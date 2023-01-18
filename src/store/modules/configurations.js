import { readTextFile, BaseDirectory } from "@tauri-apps/api/fs";
import { homeDir } from "@tauri-apps/api/path";
import { extractProfiles, readCredentials } from "../../utils/aws";

const state = () => ({
  configurations: {},
  credentials: null,
  profiles: [],
});

// getters
const getters = {};

// actions
const actions = {
  async loadConfigurations({ commit }) {
    try {
      const configurations = JSON.parse(
        await readTextFile("onebtwoionec.config.json", {
          dir: BaseDirectory.Home,
        })
      );
      commit("loadConfigurations", { configurations });
    } catch (e) {
      throw new Error(
        "Failed to load the configuration in " +
          (await homeDir()) +
          "onebtwoionec.config.json"
      );
    }
  },

  async loadCredentials({ commit }) {
    const credentials = await readCredentials();
    commit("loadCredentials", { credentials });
  },

  async loadProfiles({ state, commit, dispatch }) {
    if (!state.credentials || Object.keys(state.credentials).length === 0)
      await dispatch("loadCredentials", { root: true });

    const profiles = await extractProfiles({
      rawCredentials: state.credentials,
    });
    commit("loadProfiles", { profiles });
  },
};

// mutations
const mutations = {
  loadConfigurations(state, { configurations }) {
    state.configurations = configurations;
  },

  loadProfiles(state, { profiles }) {
    state.profiles = profiles;
  },

  loadCredentials(state, { credentials }) {
    state.credentials = credentials;
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
