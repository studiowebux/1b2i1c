<script setup>
import { ref, computed } from "vue";
import { useStore } from "vuex";

const store = useStore();

const selectedPipeline = computed(() => store.state.pipelines.selectedPipeline);

const props = defineProps({
  branchName: String,
});

const isLoading = computed(() => store.state.loadingHandler.isLoading);

async function start() {
  try {
    store.dispatch("loadingHandler/startLoading");

    const { pipelineExecutionId } = await store.dispatch(
      "pipelines/startPipeline",
      {
        branchName: props.branchName,
      }
    );

    store.dispatch(
      "messageHandler/setMessage",
      `Pipeline started : ${pipelineExecutionId || "Ok !"}`
    );
  } catch (e) {
    store.dispatch("messageHandler/setError", e.message);
    throw e;
  } finally {
    store.dispatch("loadingHandler/stopLoading");
  }
}
</script>

<template>
  <button
    id="startBtn"
    class="btn btn-outline-primary"
    type="button"
    @click="start()"
    :disabled="
      !selectedPipeline ||
      isLoading === true ||
      (selectedPipeline &&
        selectedPipeline.type === 'github' &&
        props.branchName === '')
    "
  >
    Start
  </button>
</template>
