<script setup>
import { ref, computed } from "vue";
import { useStore } from "vuex";

const store = useStore();

const selectedPipeline = ref({});

const configurations = computed(
  () => store.state.configurations.configurations
);

async function selectPipeline() {
  await store.dispatch("pipelines/setSelectedPipeline", selectedPipeline.value);
}
</script>

<template>
  <div>
    <label for="pipeline"
      >Select a pipeline (<span class="fw-bold"
        >&nbsp;{{ configurations.pipelines.length }}&nbsp;</span
      >)</label
    >
    <select
      class="form-select"
      name="pipeline"
      id="pipeline"
      @change="selectPipeline()"
      v-model="selectedPipeline"
    >
      <option
        :value="config"
        v-for="config in configurations.pipelines"
        :key="config.pipeline"
      >
        {{ config.friendlyName }}
      </option>
    </select>
  </div>
</template>
