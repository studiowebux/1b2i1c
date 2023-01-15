<script setup>
import { onMounted, ref } from "vue";
import { UpdateCodePipeline, getPipeline } from "../../utils/codepipeline";

const props = defineProps({
  selectedPipeline: Object,
  profiles: Object,
});

const detectChanges = ref(false);
const isLoading = ref(false);

onMounted(async () => {
  const pipeline = await getPipeline({
    profiles: props.profiles,
    selectedPipeline: props.selectedPipeline,
  });
  // TODO: move to vuex or pinia at some point, it is bigger than initially planned
  detectChanges.value =
    pipeline?.pipeline?.stages[0]?.actions[0]?.configuration?.DetectChanges ||
    null;
});

async function updatePipeline() {
  try {
    isLoading.value = true;
    console.debug(detectChanges.value);
    const response = await UpdateCodePipeline({
      profiles: props.profiles,
      selectedPipeline: props.selectedPipeline,
      detectChanges: detectChanges.value,
    });
    console.log(response.pipeline.stages[0].actions[0].configuration);
  } catch (e) {
    console.error(e);
    throw e;
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <div v-if="props.selectedPipeline.type === 'codepipeline'" class="mt-2">
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
