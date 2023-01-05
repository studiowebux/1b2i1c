<script setup>
import { onMounted, ref } from "vue";
import { getPipelineState } from "../utils/codepipeline";
import { open } from "@tauri-apps/api/shell";

const props = defineProps({
  configurations: Object,
  credentials: String,
  profiles: Object,
  selectedPipeline: Object,
});

const pipelineState = ref({});

function isValidDate(date) {
  return date instanceof Date && !isNaN(date);
}

const emit = defineEmits(["updateMessage", "toggleLoading"]);

onMounted(async () => {
  pipelineState.value = await getPipelineState({
    profiles: props.profiles,
    selectedPipeline: props.selectedPipeline,
  });
});

async function refresh() {
  emit("updateMessage", "Refreshing Status...");
  emit("toggleLoading", true);
  pipelineState.value = {};
  pipelineState.value = await getPipelineState({
    profiles: props.profiles,
    selectedPipeline: props.selectedPipeline,
  });
  emit("toggleLoading", false);
}

function getSummary(pipeline) {
  try {
    return JSON.parse(pipeline?.actionStates[0]?.latestExecution?.summary);
  } catch (e) {
    return {};
  }
}

function getErrorMessage(pipeline) {
  return (
    pipeline?.actionStates[0]?.latestExecution?.errorDetails?.message || null
  );
}

function getCommitId(pipeline) {
  return (
    pipeline?.actionStates[0]?.latestExecution?.externalExecutionId || null
  );
}

function goToCodebuildLogs(pipeline) {
  return (
    pipeline?.actionStates[0]?.latestExecution?.externalExecutionUrl || null
  );
}
</script>

<template>
  <div class="card">
    <div class="card-body">
      <h6>AWS CodePipeline Status</h6>

      <div class="">
        <div class="row mb-3">
          <span class="col-3 fw-bolder text-decoration-underline text-start"
            >Action</span
          >
          <span class="col-6 fw-bolder text-decoration-underline text-center"
            >Timestamp</span
          >
          <span class="col-3 fw-bolder text-decoration-underline text-center"
            >Latest Status</span
          >
        </div>
        <hr class="mx-auto" />
        <div
          class="row"
          v-for="pipeline of pipelineState.stageStates"
          :key="pipeline.stageName"
        >
          <div class="col-3 text-start text-dynamic text-break fw-bolder">
            {{ pipeline.stageName }}
          </div>
          <!-- Currently the actionStates is limited to only one  -->
          <div class="col-6 text-xs text-center text-break fw-lighter">
            <timeago
              v-if="
                pipeline.actionStates[0]?.latestExecution?.lastStatusChange &&
                isValidDate(
                  new Date(
                    pipeline.actionStates[0]?.latestExecution?.lastStatusChange
                  )
                )
              "
              :datetime="
                pipeline.actionStates[0]?.latestExecution?.lastStatusChange
              "
            />
          </div>

          <div class="col-3 text-center text-xs">
            <span
              class="badge"
              :class="{
                'bg-danger': pipeline.latestExecution?.status === 'Failed',
                'bg-muted': pipeline.latestExecution?.status === 'Cancelled',
                'bg-info': pipeline.latestExecution?.status === 'InProgress',
                'bg-warning': pipeline.latestExecution?.status === 'Stopped',
                'bg-success': pipeline.latestExecution?.status === 'Succeeded',
              }"
              >{{ pipeline.latestExecution?.status }}</span
            >
          </div>

          <div class="col-12">
            <div v-if="getErrorMessage(pipeline)" class="p-2 border">
              <p
                class="text-center fw-light fst-italic text-xs text-break text-danger"
              >
                <span>
                  {{ getErrorMessage(pipeline) }}
                </span>
                <span v-if="goToCodebuildLogs(pipeline)">
                  <br />
                  <a
                    class="text-center fw-light text-sm"
                    href="#"
                    @click.prevent="open(goToCodebuildLogs(pipeline))"
                    >Go To CodeBuild Project</a
                  >
                </span>
              </p>
            </div>

            <div
              class="text-center p-2 border text-primary"
              v-else-if="Object.keys(getSummary(pipeline)).length > 0"
            >
              <ul class="list-group list-group-flush">
                <li
                  class="list-group-item"
                  v-for="key in Object.keys(getSummary(pipeline))"
                  :key="key"
                >
                  <div class="d-flex justify-content-between">
                    <span class="fw-bolder text-start text-sm">{{
                      key.split(/(?=[A-Z])/g).join(" ")
                    }}</span>
                    <span class="text-break text-end text-sm">{{
                      getSummary(pipeline)[key]
                    }}</span>
                  </div>
                </li>
                <li class="list-group-item" v-if="getCommitId(pipeline)">
                  <div class="d-flex justify-content-between">
                    <span class="fw-bolder text-start text-sm">Commit Id</span>
                    <span class="text-break text-end text-sm">{{
                      getCommitId(pipeline).substring(0, 8)
                    }}</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          <div class="col-12">
            <hr class="w-75 mx-auto" />
          </div>
        </div>
      </div>

      <button class="btn btn-outline-primary btn-sm mt-3" @click="refresh">
        Refresh
      </button>
    </div>
  </div>
</template>
