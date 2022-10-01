<script setup>
import { ref, onMounted } from "vue";
import { extractProfiles, readCredentials } from "../utils/aws";
import { readTextFile, BaseDirectory } from "@tauri-apps/api/fs";
import { homeDir } from "@tauri-apps/api/path";
import {
  CodePipelineClient,
  StartPipelineExecutionCommand,
  GetPipelineCommand,
  UpdatePipelineCommand,
} from "@aws-sdk/client-codepipeline";
import { STSClient, AssumeRoleCommand } from "@aws-sdk/client-sts";

const configurations = ref("");
const selectedPipeline = ref("");
const branchName = ref("");
const credentials = ref("");
const profiles = ref("");

const message = ref("");
const error = ref("");

const isLoading = ref("");

onMounted(async () => {
  await loadCredentials();
  await loadConfig();
});

async function updatePipeline(pipeline, branchName) {
  let assumedRole = await assumeRole();

  const client = new CodePipelineClient({
    region: selectedPipeline.value.region,
    credentials: {
      accessKeyId: assumedRole.Credentials.AccessKeyId,
      secretAccessKey: assumedRole.Credentials.SecretAccessKey,
      sessionToken: assumedRole.Credentials.SessionToken,
    },
  });
  let _pipeline = { ...pipeline };

  let altered = false;
  _pipeline.stages.map((stage) => {
    if (stage.name.includes(selectedPipeline.value.codePipelineActionName)) {
      stage.actions[0].configuration.BranchName = branchName; // eurk..
      altered = true;
    }
  });

  if (!altered)
    throw new Error(
      "Unable to update the pipeline; Action might not have been found, verify your configuration in ~/onebtwoionec.config.json"
    );

  const command = new UpdatePipelineCommand({
    name: pipeline.name,
    pipeline: _pipeline,
  });

  return client.send(command);
}

async function getPipeline() {
  let assumedRole = await assumeRole();

  const client = new CodePipelineClient({
    region: selectedPipeline.value.region,
    credentials: {
      accessKeyId: assumedRole.Credentials.AccessKeyId,
      secretAccessKey: assumedRole.Credentials.SecretAccessKey,
      sessionToken: assumedRole.Credentials.SessionToken,
    },
  });
  const command = new GetPipelineCommand({
    name: selectedPipeline.value.pipeline,
  });

  return client.send(command);
}

async function assumeRole() {
  let profile = profiles.value.find((pv) =>
    pv.profile.includes(selectedPipeline.value.profile)
  );

  if (!profile) throw new Error("Profile not found");

  const client = new STSClient({
    region: "us-east-1", // this is ok that it is hardcoded
    credentials:
      profile.credentials?.AccessKeyId && profile.credentials?.secretAccessKey
        ? profile.credentials
        : profile.sourceProfile?.credentials,
  });
  const command = new AssumeRoleCommand({
    RoleSessionName: "onebtwoionec", // this is ok that it is hardcoded
    RoleArn: profile.roleArn,
  });

  return await client.send(command);
}

async function startPipeline() {
  let assumedRole = await assumeRole();

  const client = new CodePipelineClient({
    region: selectedPipeline.value.region,
    credentials: {
      accessKeyId: assumedRole.Credentials.AccessKeyId,
      secretAccessKey: assumedRole.Credentials.SecretAccessKey,
      sessionToken: assumedRole.Credentials.SessionToken,
    },
  });
  const command = new StartPipelineExecutionCommand({
    name: selectedPipeline.value.pipeline,
  });

  return client.send(command);
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
    credentials.value = await readCredentials({});
    // console.debug("Extract Profiles");
    profiles.value = await extractProfiles({
      rawCredentials: credentials.value,
    });
  } catch (e) {
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
    if (branchName.value !== "") {
      await update();
      message.value = "Pipeline branch name is up-to-date";
    }
    const msg = await startPipeline();
    message.value = `Pipeline started : ${msg.pipelineExecutionId}`;
    selectedPipeline.value = null;
    branchName.value = "";
  } catch (e) {
    error.value = e.message;
    throw e;
  } finally {
    isLoading.value = false;
  }
}

async function update() {
  try {
    resetMessage();
    isLoading.value = true;
    console.log("Update");
    const pipelineInfo = await getPipeline();
    await updatePipeline(pipelineInfo.pipeline, branchName.value);
    message.value = "Branch name updated";
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
    <div class="card-body">
      <form>
        <div>
          <label for="pipeline"
            >Select a pipeline (<span class="fw-bold"
              >&nbsp;{{ configurations.length }}&nbsp;</span
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
              v-for="config in configurations"
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

      <div class="d-grid gap-2 mt-2 p-2">
        <button
          class="btn btn-outline-primary"
          type="button"
          @click="start()"
          :disabled="!selectedPipeline || isLoading === true"
        >
          Start
        </button>
      </div>

      <!-- <div>
        <button
          class="btn btn-outline-primary"
          type="button"
          @click="update()"
          :disabled="
            branchName === '' || !selectedPipeline || isLoading === true
          "
        >
          Update Branch Name (only)
        </button>
      </div> -->

      <hr />

      <p class="border rounded p-2 shadow text-center">
        <span v-if="isLoading">Wait for it..</span>
        <span class="text-success text-xs" v-if="!isLoading && message">{{
          message
        }}</span>
        <span class="text-danger text-xs" v-else>{{ error }}</span>
      </p>
    </div>
  </div>
</template>
