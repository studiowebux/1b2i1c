<script setup>
import { ref, computed, watch } from "vue";
import { useStore } from "vuex";

const store = useStore();

const detectChanges = ref(false);
const isLoading = computed(() => store.state.loadingHandler.isLoading);

const pipelineData = computed(() => store.state.pipelines.pipeline);
const selectedPipeline = computed(() => store.state.pipelines.selectedPipeline);

watch(
  pipelineData,
  () => {
    detectChanges.value =
      pipelineData.value?.stages[0]?.actions[0]?.configuration?.DetectChanges ||
      null;
  },
  { deep: true }
);

async function updatePipeline() {
  try {
    store.dispatch("loadingHandler/startLoading");
    await store.dispatch("pipelines/updatePipeline", {
      detectChanges: detectChanges.value,
    });
    store.dispatch("messageHandler/setMessage", `Pipeline updated`);
  } catch (e) {
    store.dispatch("messageHandler/setError", e.message);
    throw e;
  } finally {
    store.dispatch("loadingHandler/stopLoading");
  }
}
</script>

<template>
  <div v-if="selectedPipeline.type === 'codepipeline'" class="mt-2">
    <div class="form-check form-switch text-end">
      <input
        class="form-check-input"
        type="checkbox"
        id="detectChanges"
        v-model="detectChanges"
        @change="updatePipeline"
        :disabled="isLoading"
      />
      <label class="form-check-label" for="detectChanges">
        <span v-if="isLoading">Saving..</span>
        <span v-else> Detect Changes </span>
      </label>
    </div>
  </div>
</template>
