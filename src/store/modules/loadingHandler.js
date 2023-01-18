const state = () => ({
  isLoading: false,
});

// actions
const actions = {
  toggleLoading({ commit }) {
    commit("toggleLoading");
  },

  stopLoading({ commit }) {
    commit("stopLoading");
  },

  startLoading({ commit }) {
    commit("startLoading");
  },
};

// mutations
const mutations = {
  toggleLoading(state) {
    state.isLoading = !state.isLoading;
  },

  stopLoading(state) {
    state.isLoading = false;
  },

  startLoading(state) {
    state.isLoading = true;
  },
};

export default {
  namespaced: true,
  state,
  actions,
  mutations,
};
