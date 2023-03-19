<script setup>
import { computed } from "vue";
import { useStore } from "vuex";
import { open } from "@tauri-apps/api/shell";

const store = useStore();

const status = computed(() => store.state.pipelines.status);
const pipelineData = computed(() => store.state.pipelines.pipeline);

function isValidDate(date) {
  return date instanceof Date && !isNaN(date);
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

function getFullRepositoryId() {
  return (
    pipelineData.value?.stages[0]?.actions[0]?.configuration
      ?.FullRepositoryId || null
  );
}
</script>

<template>
  <div class="">
    <div class="row mb-3">
      <span class="text-sm col-3 fw-bolder text-decoration-underline text-start"
        >Action</span
      >
      <span
        class="text-sm col-6 fw-bolder text-decoration-underline text-center"
        >Timestamp</span
      >
      <span
        class="text-sm col-3 fw-bolder text-decoration-underline text-center"
        >Latest Status</span
      >
    </div>

    <hr class="mx-auto" />

    <div
      class="row"
      v-for="pipeline in status.stageStates"
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
                <a
                  v-if="
                    getSummary(pipeline)?.ProviderType === 'GitHub' &&
                    getFullRepositoryId() &&
                    getCommitId(pipeline)
                  "
                  href="#"
                  @click.prevent="
                    open(
                      'https://github.com/' +
                        getFullRepositoryId() +
                        '/commit/' +
                        getCommitId(pipeline)
                    )
                  "
                  ><i class="bi bi-github text-xl"></i>&nbsp;{{
                    getCommitId(pipeline)?.substring(0, 8)
                  }}</a
                >
                <span v-else class="text-break text-end text-sm">{{
                  getCommitId(pipeline)?.substring(0, 8)
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
</template>
