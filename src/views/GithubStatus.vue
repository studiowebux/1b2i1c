<script setup>
import { watch, computed } from "vue";
import { useStore } from "vuex";

import Inputs from "../components/GithubStatus/Sections/Inputs.vue";
import Workflow from "../components/GithubStatus/Sections/Workflow.vue";

const store = useStore();

const selectedPipeline = computed(() => store.state.pipelines.selectedPipeline);

async function refresh() {
  try {
    store.dispatch("loadingHandler/startLoading");
    store.dispatch("messageHandler/setMessage", "Refreshing Status...");
    await store.dispatch("pipelines/githubStatus");
  } catch (e) {
    store.dispatch("messageHandler/setError", e.message);
    throw e;
  } finally {
    store.dispatch("loadingHandler/stopLoading");
    store.dispatch("messageHandler/resetMessage");
  }
}

watch(
  selectedPipeline,
  () => {
    refresh();
  },
  { deep: true, immediate: true }
);
</script>

<template>
  <div
    class="card"
    v-if="selectedPipeline && selectedPipeline?.type === 'github'"
  >
    <div class="card-body">
      <button
        class="btn btn-outline-primary btn-sm mb-3"
        @click.prevent="refresh"
      >
        Refresh
      </button>
      <Inputs
        v-if="
          selectedPipeline.inputs && Object.keys(selectedPipeline.inputs).length
        "
      />
      <Workflow />
    </div>
  </div>
</template>
