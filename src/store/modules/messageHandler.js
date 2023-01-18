const state = () => ({
  error: "",
  message: "",
});

// getters
const getters = {};

// actions
const actions = {
  setError({ commit }, msg) {
    commit("setError", msg);
  },

  setMessage({ commit }, msg) {
    commit("setMessage", msg);
  },

  resetError({ commit }) {
    commit("resetError");
  },

  resetMessage({ commit }) {
    commit("resetMessage");
  },
};

// mutations
const mutations = {
  setError(state, msg) {
    state.error = msg;
  },

  resetError(state) {
    state.error = "";
  },

  setMessage(state, msg) {
    state.message = msg;
  },

  resetMessage(state) {
    state.message = "";
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
