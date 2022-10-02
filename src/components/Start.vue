<script setup>
import { ref, onMounted } from "vue";
import { extractProfiles, readCredentials } from "../utils/aws";
import { readTextFile, BaseDirectory } from "@tauri-apps/api/fs";
import { homeDir } from "@tauri-apps/api/path";

import { StartCodePipeline, UpdateCodePipeline } from "../utils/codepipeline";
import { useGithubAction } from "../utils/github";

const configurations = ref("");
const selectedPipeline = ref("");
const branchName = ref("");
const credentials = ref("");
const profiles = ref("");

const message = ref("");
const error = ref("");

const isLoading = ref("");
const isInitializing = ref("");

onMounted(async () => {
  isInitializing.value = true;
  await loadCredentials();
  await loadConfig();
  isInitializing.value = false;
});

async function startPipeline() {
  switch (selectedPipeline.value.type) {
    case "codepipeline":
      if (branchName.value !== "")
        await UpdateCodePipeline({
          profiles: profiles.value,
          selectedPipeline: selectedPipeline.value,
          branchName: branchName.value,
        });
      return StartCodePipeline({
        profiles: profiles.value,
        selectedPipeline: selectedPipeline.value,
      });
    case "github":
      if (branchName.value === "") throw new Error("Missing branch name");
      return useGithubAction({
        auth: configurations.value.authentication.github.api_key,
        workflow_id: selectedPipeline.value.workflow_id,
        ref: branchName.value,
        repo: selectedPipeline.value.repository,
        owner: selectedPipeline.value.owner,
        inputs: selectedPipeline.value.inputs,
      });
    default:
      throw new Error("Incorrect pipeline type");
  }
}

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
    // console.debug("Read Credentials");
    credentials.value = await readCredentials();
    // console.debug("Extract Profiles");
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
  message.value = null;
  error.value = null;
}

async function start() {
  try {
    resetMessage();
    isLoading.value = true;
    console.log("Start");

    const msg = await startPipeline();
    message.value = `Pipeline started : ${msg.pipelineExecutionId || "Ok !"}`;

    selectedPipeline.value = null;
    branchName.value = "";
  } catch (e) {
    error.value = e.message;
    throw e;
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <div class="card">
    <div
      id="pipeline"
      class="card-body"
      v-if="configurations && configurations.pipelines"
    >
      <form id="inputs">
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

        <div>
          <label for="branch">What branch to deploy</label>
          <input
            class="form-control"
            type="text"
            name="branch"
            placeholder="branch name"
            v-model="branchName"
          />
        </div>
      </form>

      <div id="buttons" class="d-grid gap-2 mt-2 p-2">
        <button
          class="btn btn-outline-primary"
          type="button"
          @click="start()"
          :disabled="
            !selectedPipeline ||
            isLoading === true ||
            (selectedPipeline.type === 'github' && branchName === '')
          "
        >
          Start
        </button>
      </div>

      <hr />
    </div>

    <div id="messages" class="card-body">
      <p class="border rounded p-2 shadow text-center">
        <span v-if="isLoading">Wait for it..</span>
        <span class="text-success text-xs" v-if="!isLoading && message">{{
          message
        }}</span>
        <span class="text-danger text-xs" v-else>{{ error }}</span>
      </p>
    </div>

    <div id="loading" class="card-body" v-if="isInitializing">Loading...</div>
  </div>
</template>
