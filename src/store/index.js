import { createStore, createLogger } from "vuex";
import configurations from "./modules/configurations";
import messageHandler from "./modules/messageHandler";
import pipelines from "./modules/pipelines";
import loadingHandler from "./modules/loadingHandler";

const debug = import.meta.env.NODE_ENV !== "production";

export default createStore({
  modules: {
    configurations,
    messageHandler,
    pipelines,
    loadingHandler,
  },
  strict: debug,
  plugins: debug ? [createLogger()] : [],
});
