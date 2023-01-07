// Studio Webux @ 2022
import {
  CodePipelineClient,
  StartPipelineExecutionCommand,
  GetPipelineCommand,
  UpdatePipelineCommand,
  GetPipelineStateCommand,
} from "@aws-sdk/client-codepipeline";
import { assumeRole } from "./aws";

async function StartCodePipeline({ profiles, selectedPipeline }) {
  let assumedRole = await assumeRole({
    profiles,
    profile: selectedPipeline.profile,
  });

  const client = new CodePipelineClient({
    region: selectedPipeline.region,
    credentials: {
      accessKeyId: assumedRole.Credentials.AccessKeyId,
      secretAccessKey: assumedRole.Credentials.SecretAccessKey,
      sessionToken: assumedRole.Credentials.SessionToken,
    },
  });
  const command = new StartPipelineExecutionCommand({
    name: selectedPipeline.pipeline,
  });

  return client.send(command);
}

async function UpdateCodePipeline({
  profiles,
  selectedPipeline,
  branchName,
  detectChanges,
}) {
  let assumedRole = await assumeRole({
    profiles,
    profile: selectedPipeline.profile,
  });
  let pipeline = await getPipeline({ profiles, selectedPipeline });

  if (!pipeline) throw new Error("Pipeline information not found");

  const client = new CodePipelineClient({
    region: selectedPipeline.region,
    credentials: {
      accessKeyId: assumedRole.Credentials.AccessKeyId,
      secretAccessKey: assumedRole.Credentials.SecretAccessKey,
      sessionToken: assumedRole.Credentials.SessionToken,
    },
  });
  let _pipeline = { ...pipeline.pipeline };

  let altered = false;
  _pipeline.stages.map((stage) => {
    if (stage.name.includes(selectedPipeline.codePipelineActionName)) {
      stage.actions[0].configuration.BranchName =
        branchName || stage.actions[0].configuration.BranchName; // eurk..
      stage.actions[0].configuration.DetectChanges =
        detectChanges !== null
          ? detectChanges.toString()
          : stage.actions[0].configuration.DetectChanges;
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

async function getPipeline({ profiles, selectedPipeline }) {
  let assumedRole = await assumeRole({
    profiles,
    profile: selectedPipeline.profile,
  });

  const client = new CodePipelineClient({
    region: selectedPipeline.region,
    credentials: {
      accessKeyId: assumedRole.Credentials.AccessKeyId,
      secretAccessKey: assumedRole.Credentials.SecretAccessKey,
      sessionToken: assumedRole.Credentials.SessionToken,
    },
  });
  const command = new GetPipelineCommand({
    name: selectedPipeline.pipeline,
  });

  return client.send(command);
}

async function getPipelineState({ profiles, selectedPipeline }) {
  let assumedRole = await assumeRole({
    profiles,
    profile: selectedPipeline.profile,
  });

  const client = new CodePipelineClient({
    region: selectedPipeline.region,
    credentials: {
      accessKeyId: assumedRole.Credentials.AccessKeyId,
      secretAccessKey: assumedRole.Credentials.SecretAccessKey,
      sessionToken: assumedRole.Credentials.SessionToken,
    },
  });

  return client.send(
    new GetPipelineStateCommand({
      name: selectedPipeline.pipeline,
    })
  );
}

export { StartCodePipeline, UpdateCodePipeline, getPipelineState, getPipeline };
