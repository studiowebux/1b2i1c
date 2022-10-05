<script setup>
import Start from "./components/Start.vue";
import AWSStatus from "./components/AWSStatus.vue";

import { ref, onMounted } from "vue";
import { extractProfiles, readCredentials } from "./utils/aws";
import { readTextFile, BaseDirectory } from "@tauri-apps/api/fs";
import { homeDir } from "@tauri-apps/api/path";

const configurations = ref({});
const credentials = ref("");
const profiles = ref([]);

const message = ref("");
const error = ref("");

const isLoading = ref("");
const isInitializing = ref("");

const selectedPipeline = ref({});

onMounted(async () => {
  isInitializing.value = true;
  await loadCredentials();
  await loadConfig();
  isInitializing.value = false;
});

async function loadConfig() {
  try {
    configurations.value = JSON.parse(
      await readTextFile("onebtwoionec.config.json", {
        dir: BaseDirectory.Home,
      })
    );
    message.value = "Ready";
  } catch (e) {
    configurations.value = [];
    error.value =
      e.message ||
      "Failed to load the configuration in " +
        (await homeDir()) +
        "onebtwoionec.config.json";
  }
}

async function loadCredentials() {
  try {
    credentials.value = await readCredentials();
    profiles.value = await extractProfiles({
      rawCredentials: credentials.value,
    });
  } catch (e) {
    credentials.value = "";
    profiles.value = [];
    error.value = e.message;
  }
}

function resetMessage() {
  message.value = "";
  error.value = "";
}

function updateMessage(_success, _error) {
  resetMessage();
  error.value = _error;
  message.value = _success;
}

function toggleLoading() {
  isLoading.value = !isLoading.value;
  if (isLoading.value === true) resetMessage();
}

function selectPipeline(pipeline) {
  selectedPipeline.value = pipeline;
}
</script>

<template>
  <div class="container p-3">
    <div id="messages" class="card-body mb-1" v-if="message || error">
      <p class="border rounded p-2 shadow text-center">
        <span v-if="isLoading">Wait for it..</span>
        <span class="text-success text-xs" v-if="!isLoading && message">{{
          message
        }}</span>
        <span class="text-danger text-xs" v-else>{{ error }}</span>
      </p>
    </div>

    <div id="loading" class="card-body" v-if="isInitializing">Loading...</div>

    <Start
      :credentials="credentials"
      :profiles="profiles"
      :configurations="configurations"
      :selectedPipeline="selectedPipeline"
      @updateMessage="updateMessage"
      @toggleLoading="toggleLoading"
      @selectPipeline="selectPipeline"
    />

    <AWSStatus
      v-if="selectedPipeline && selectedPipeline.type === 'codepipeline'"
      class="mt-3"
      :credentials="credentials"
      :profiles="profiles"
      :selectedPipeline="selectedPipeline"
      :configurations="configurations"
      @updateMessage="updateMessage"
      @toggleLoading="toggleLoading"
    />
  </div>
</template>
