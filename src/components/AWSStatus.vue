<script setup>
import { onMounted, ref } from "vue";
import { getPipeline, getPipelineState } from "../utils/codepipeline";
import { open } from "@tauri-apps/api/shell";

const props = defineProps({
  configurations: Object,
  credentials: String,
  profiles: Object,
  selectedPipeline: Object,
});

const pipelineState = ref({});
const pipelineData = ref({});

function isValidDate(date) {
  return date instanceof Date && !isNaN(date);
}

const emit = defineEmits(["updateMessage", "toggleLoading"]);

onMounted(async () => {
  await loadPipelineState();
  await loadPipeline();
});

async function refresh() {
  emit("updateMessage", "Refreshing Status...");
  emit("toggleLoading", true);
  pipelineState.value = {};
  pipelineData.value = {};

  await loadPipelineState();
  await loadPipeline();

  emit("toggleLoading", false);
}

async function loadPipeline() {
  pipelineData.value = await getPipeline({
    profiles: props.profiles,
    selectedPipeline: props.selectedPipeline,
  });
}

async function loadPipelineState() {
  pipelineState.value = await getPipelineState({
    profiles: props.profiles,
    selectedPipeline: props.selectedPipeline,
  });
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

function getGitUrl(pipeline) {
  return pipeline?.actionStates[0]?.entityUrl || null;
}

function goToCodebuildLogs(pipeline) {
  return (
    pipeline?.actionStates[0]?.latestExecution?.externalExecutionUrl || null
  );
}

function getFullRepositoryId() {
  console.log(pipelineData.value.pipeline?.stages[0].actions[0]);
  return (
    pipelineData.value.pipeline?.stages[0]?.actions[0]?.configuration
      ?.FullRepositoryId || null
  );
}
</script>

<template>
  <div class="card">
    <div class="card-body">
      <div class="d-flex justify-content-between align-items-baseline">
        <div>
          <h4>AWS CodePipeline Status</h4>
        </div>
        <div class="">
          <a
            data-bs-toggle="collapse"
            href="#moreInfoCollapse"
            role="button"
            aria-expanded="false"
            aria-controls="moreInfoCollapse"
          >
            <i class="bi bi-info-circle text-xl text-info fw-bolder"></i>
          </a>
        </div>
      </div>

      <div id="moreInfoCollapse" class="collapse">
        <div class="card mb-3">
          <div class="card-body">
            <ul class="list-group list-group-flush">
              <li class="list-group-item">
                <div class="d-flex flex-column justify-content-between">
                  <span
                    class="fw-bolder text-start text-sm text-decoration-underline"
                    >Artifact Store</span
                  >
                  <span class="text-break text-start text-sm"
                    >[
                    <span class="fw-bold">{{
                      pipelineData?.pipeline?.artifactStore?.type
                    }}</span>
                    ]&nbsp;{{ pipelineData?.pipeline?.artifactStore?.location }}
                  </span>
                </div>
              </li>

              <li class="list-group-item">
                <div class="d-flex flex-column justify-content-between">
                  <span
                    class="fw-bolder text-start text-sm text-decoration-underline"
                    >Role Arn</span
                  >
                  <span class="text-break text-start text-xs"
                    >{{ pipelineData?.pipeline?.roleArn }}
                  </span>
                </div>
              </li>

              <li
                class="list-group-item"
                v-if="pipelineData?.metadata?.updated"
              >
                <div class="d-flex flex-column justify-content-between">
                  <span
                    class="fw-bolder text-start text-sm text-decoration-underline"
                  >
                    Last Pipeline Update:
                  </span>
                  <span class="text-break text-start text-sm">
                    <timeago
                      v-if="
                        isValidDate(new Date(pipelineData?.metadata?.updated))
                      "
                      :datetime="pipelineData?.metadata?.updated"
                  /></span>
                </div>
              </li>

              <li class="list-group-item mt-2">
                <div>
                  <span
                    class="fw-bolder text-start text-sm text-decoration-underline"
                    >Action{{
                      pipelineData?.pipeline?.stages?.length > 0 ? "s" : ""
                    }}
                    ({{ pipelineData?.pipeline?.stages?.length }})</span
                  >
                </div>

                <div
                  class="d-flex flex-column justify-content-between p-3 border rounded"
                >
                  <div
                    v-for="stage in pipelineData?.pipeline?.stages"
                    :key="stage.name"
                  >
                    <span class="fw-bold">
                      {{ stage.name }}
                    </span>
                    <div
                      class="mb-2 text-sm text-break"
                      v-for="action in stage.actions"
                      :key="action.name"
                    >
                      <div class="fw-bold text-start">
                        <span> Step #</span>
                        <span>{{ action?.runOrder }}</span>
                      </div>

                      <div>
                        <span class="fw-bolder text-start"> Category: </span>
                        &nbsp;
                        <span class="text-end">{{
                          action?.actionTypeId?.category
                        }}</span>
                      </div>

                      <div v-if="action?.configuration?.BranchName">
                        <span class="fw-bolder text-start"> Branch Name: </span>
                        &nbsp;
                        <span class="text-end">{{
                          action?.configuration?.BranchName
                        }}</span>
                      </div>

                      <div v-if="action?.configuration?.DetectChanges">
                        <span class="fw-bolder text-start">
                          Detect Changes:
                        </span>
                        &nbsp;
                        <span class="text-end">{{
                          action?.configuration?.DetectChanges
                        }}</span>
                      </div>

                      <div v-if="action?.configuration?.FullRepositoryId">
                        <span class="fw-bolder text-start"> Repository: </span>
                        &nbsp;
                        <span class="text-end">{{
                          action?.configuration?.FullRepositoryId
                        }}</span>
                      </div>

                      <div v-if="action?.actionTypeId?.provider">
                        <span class="fw-bolder text-start">
                          Action Provider:
                        </span>
                        &nbsp;
                        <span class="text-end">{{
                          action?.actionTypeId?.provider
                        }}</span>
                      </div>

                      <div v-if="action?.configuration?.ProjectName">
                        <span class="fw-bolder text-start">
                          Project Name:
                        </span>
                        &nbsp;
                        <span class="text-end">{{
                          action?.configuration?.ProjectName
                        }}</span>
                      </div>
                    </div>
                    <hr />
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div class="">
        <div class="row mb-3">
          <span
            class="text-sm col-3 fw-bolder text-decoration-underline text-start"
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
          v-for="pipeline in pipelineState.stageStates"
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

      <button
        class="btn btn-outline-primary btn-sm mt-3"
        @click.prevent="refresh"
      >
        Refresh
      </button>
    </div>

    <div class="debugger" v-if="false">
      <pre>{{ pipelineState }}</pre>
      <pre>{{ pipelineData }}</pre>
    </div>
  </div>
</template>
