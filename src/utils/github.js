// Studio Webux @ 2022

import { Octokit } from "https://cdn.skypack.dev/octokit";

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

export { useGithubAction };
