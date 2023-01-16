import {
  getPipeline,
  getPipelineState,
  StartCodePipeline,
  UpdateCodePipeline,
} from "../../utils/codepipeline";
import { useGithubAction } from "../../utils/github";

const state = () => ({
  selectedPipeline: null,
  pipeline: {},
  status: {},
});

// getters
const getters = {};

// actions
const actions = {
  async setSelectedPipeline({ commit, dispatch }, pipeline) {
    commit("setSelectedPipeline", pipeline);
    if (pipeline.type === "codepipeline") await dispatch("loadPipeline");
  },

  async loadPipeline({ state, rootState, commit }) {
    try {
      if (
        !state.selectedPipeline ||
        Object.keys(state.selectedPipeline).length === 0
      )
        throw new Error("Please Select a pipeline.");

      const pipeline = await getPipeline({
        selectedPipeline: state.selectedPipeline,
        profiles: rootState.configurations.profiles,
      });
      const status = await getPipelineState({
        selectedPipeline: state.selectedPipeline,
        profiles: rootState.configurations.profiles,
      });

      commit("loadPipeline", { pipeline: pipeline.pipeline });
      commit("loadStatus", { status });
    } catch (e) {
      throw new Error(e.message);
    }
  },

  async startPipeline({ state, rootState, dispatch }, { branchName }) {
    if (!state.selectedPipeline) return;
    switch (state.selectedPipeline.type) {
      case "codepipeline":
        if (branchName !== "") await dispatch("updatePipeline", { branchName });
        return StartCodePipeline({
          profiles: rootState.configurations.profiles,
          selectedPipeline: state.selectedPipeline,
        });
      case "github":
        if (branchName === "") throw new Error("Missing branch name");
        return useGithubAction({
          auth: rootState.configurations.configurations.authentication.github
            .api_key,
          workflow_id: state.selectedPipeline.workflow_id,
          ref: branchName,
          repo: state.selectedPipeline.repository,
          owner: state.selectedPipeline.owner,
          inputs: state.selectedPipeline.inputs,
        });
      default:
        throw new Error("Incorrect pipeline type");
    }
  },

  async updatePipeline({ state, rootState }, { branchName, detectChanges }) {
    return UpdateCodePipeline({
      profiles: rootState.configurations.profiles,
      selectedPipeline: state.selectedPipeline,
      branchName: branchName,
      detectChanges: detectChanges,
    });
  },
};

// mutations
const mutations = {
  loadPipeline(state, { pipeline }) {
    state.pipeline = pipeline;
  },

  loadStatus(state, { status }) {
    state.status = status;
  },

  setSelectedPipeline(state, pipeline) {
    state.selectedPipeline = pipeline;
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
