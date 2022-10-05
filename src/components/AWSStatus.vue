<script setup>
import { onMounted, ref } from "vue";
import { getPipelineState } from "../utils/codepipeline";

const props = defineProps({
  configurations: Object,
  credentials: String,
  profiles: Object,
  selectedPipeline: Object,
});

const pipelineState = ref({});

onMounted(async () => {
  console.debug("Mounted");
  pipelineState.value = await getPipelineState({
    profiles: props.profiles,
    selectedPipeline: props.selectedPipeline,
  });
});

async function refresh() {
  pipelineState.value = {};
  pipelineState.value = await getPipelineState({
    profiles: props.profiles,
    selectedPipeline: props.selectedPipeline,
  });
}
</script>

<template>
  <div class="card">
    <div class="card-body">
      <h6>AWS CodePipeline Status</h6>
      <h4>Last State</h4>

      <div class="">
        <div class="row">
          <span class="col fw-bolder text-decoration-underline text-start"
            >Action</span
          >
          <span class="col fw-bolder text-decoration-underline">Timestamp</span>
          <span class="col fw-bolder text-decoration-underline text-end"
            >Latest Status</span
          >
        </div>
        <div
          class="row"
          v-for="pipeline of pipelineState.stageStates"
          :key="pipeline.stageName"
        >
          <div class="col text-start">{{ pipeline.stageName }}</div>
          <!-- Currently the actionStates is limited to only one  -->
          <div class="col text-sm">
            <timeago
              :datetime="
                pipeline.actionStates[0].latestExecution.lastStatusChange
              "
            />
          </div>

          <div
            class="col text-end"
            :class="{
              'text-danger': pipeline.latestExecution.status === 'Failed',
              'text-muted': pipeline.latestExecution.status === 'Cancelled',
              'text-info': pipeline.latestExecution.status === 'InProgress',
              'text-warning': pipeline.latestExecution.status === 'Stopped',
              'text-success': pipeline.latestExecution.status === 'Succeeded',
            }"
          >
            {{ pipeline.latestExecution.status }}
          </div>
        </div>
      </div>

      <button class="btn btn-outline-primary btn-sm mt-3" @click="refresh">
        Refresh
      </button>
    </div>
  </div>
</template>
