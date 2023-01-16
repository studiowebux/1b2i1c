<script setup>
import { ref, computed } from "vue";
import { useStore } from "vuex";

import BranchName from "../components/Inputs/BranchName.vue";
import StartBtn from "../components/Buttons/StartBtn.vue";
import SelectPipeline from "../components/Inputs/SelectPipeline.vue";

const store = useStore();

const selectedPipeline = computed(() => store.state.pipelines.selectedPipeline);

const configurations = computed(
  () => store.state.configurations.configurations
);

const branchName = ref("");
</script>

<template>
  <div class="card">
    <div
      id="startView"
      class="card-body"
      v-if="configurations && configurations.pipelines"
    >
      <form id="inputs">
        <div class="mt-2">
          <SelectPipeline />
        </div>

        <div class="mt-2" v-if="selectedPipeline">
          <BranchName :update-value="(v) => (branchName = v)" />
        </div>

        <div id="buttons" class="d-grid gap-2 mt-2 p-2">
          <StartBtn :branchName="branchName" />
        </div>
      </form>
    </div>
  </div>
</template>
