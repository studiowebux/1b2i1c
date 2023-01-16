<script setup>
import { ref, computed } from "vue";
import { useStore } from "vuex";

const store = useStore();

const selectedPipeline = computed(() => store.state.pipelines.selectedPipeline);

const props = defineProps({
  branchName: String,
});

const isLoading = ref(false);

async function start() {
  try {
    isLoading.value = true;

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
    isLoading.value = false;
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
