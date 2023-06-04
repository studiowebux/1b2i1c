// Studio Webux @ 2022

import { Octokit } from "https://esm.sh/octokit@2.0.19?target=es2019";

/**
 *
 * @param {String} auth Github Token to start the workflow
 * @param {String} workflow_id Github action Workflow Id
 * @param {String} ref Branch Name
 * @param {String} repo Repository Name
 * @param {String} owner Github Owner
 * @param {Object} inputs Optional inputs for the workflow
 */
async function useGithubAction({
  auth,
  workflow_id,
  ref,
  repo,
  owner,
  inputs,
}) {
  const octokit = new Octokit({
    auth,
  });

  return octokit.request(
    "POST /repos/{owner}/{repo}/actions/workflows/{workflow_id}/dispatches",
    {
      owner,
      repo,
      workflow_id,
      ref,
      inputs,
    }
  );
}

async function getWorkflowDetails({ auth, repo, owner }) {
  const octokit = new Octokit({
    auth,
  });

  return octokit.request("GET /repos/{owner}/{repo}/actions/runs", {
    owner,
    repo,
    headers: {
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
}

export { useGithubAction, getWorkflowDetails };
