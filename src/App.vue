<script setup>
import { ref, onMounted, computed } from "vue";
import { useStore } from "vuex";

import Start from "./views/Start.vue";
import AWSStatus from "./views/AWSStatus.vue";

import Message from "./components/Messages/Message.vue";

const store = useStore();

const isInitializing = ref("");

const isLoading = computed(() => store.state.loadingHandler.isLoading);

const selectedPipeline = computed(() => store.state.pipelines.selectedPipeline);

onMounted(async () => {
  try {
    isInitializing.value = true;
    await store.dispatch("configurations/loadConfigurations");
    await store.dispatch("configurations/loadProfiles");
    store.dispatch("messageHandler/setMessage", "Ready");
  } catch (e) {
    store.dispatch("messageHandler/setError", e.message);
  } finally {
    isInitializing.value = false;
  }
});
</script>

<template>
  <div class="container p-3">
    <div class="overlay" v-if="isInitializing || isLoading">
      <div class="d-flex justify-content-center align-items-middle">
        <div class="spinner-border" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
    </div>

    <Message :isLoading="isInitializing" />
    <div id="loading" class="card-body" v-if="isInitializing">Loading...</div>

    <div class="modules">
      <Start />
      <AWSStatus v-if="selectedPipeline?.type === 'codepipeline'" />
    </div>
  </div>
</template>

<style>
.overlay {
  position: fixed;
  width: 100%;
  height: 100%;
  z-index: 1000;
}
</style>
