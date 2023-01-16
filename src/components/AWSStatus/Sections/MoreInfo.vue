<script setup>
import { computed } from "vue";

import { useStore } from "vuex";

const store = useStore();

const pipelineData = computed(() => store.state.pipelines.pipeline);

function isValidDate(date) {
  return date instanceof Date && !isNaN(date);
}
</script>

<template>
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
                  pipelineData?.artifactStore?.type
                }}</span>
                ]&nbsp;{{ pipelineData?.artifactStore?.location }}
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
                >{{ pipelineData?.roleArn }}
              </span>
            </div>
          </li>

          <li class="list-group-item" v-if="pipelineData?.metadata?.updated">
            <div class="d-flex flex-column justify-content-between">
              <span
                class="fw-bolder text-start text-sm text-decoration-underline"
              >
                Last Pipeline Update:
              </span>
              <span class="text-break text-start text-sm">
                <timeago
                  v-if="isValidDate(new Date(pipelineData?.metadata?.updated))"
                  :datetime="pipelineData?.metadata?.updated"
              /></span>
            </div>
          </li>

          <li class="list-group-item mt-2">
            <div>
              <span
                class="fw-bolder text-start text-sm text-decoration-underline"
                >Action{{ pipelineData?.stages?.length > 0 ? "s" : "" }} ({{
                  pipelineData?.stages?.length
                }})</span
              >
            </div>

            <div
              class="d-flex flex-column justify-content-between p-3 border rounded"
            >
              <div v-for="stage in pipelineData?.stages" :key="stage.name">
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
                    <span class="fw-bolder text-start"> Detect Changes: </span>
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
                    <span class="fw-bolder text-start"> Action Provider: </span>
                    &nbsp;
                    <span class="text-end">{{
                      action?.actionTypeId?.provider
                    }}</span>
                  </div>

                  <div v-if="action?.configuration?.ProjectName">
                    <span class="fw-bolder text-start"> Project Name: </span>
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
</template>
