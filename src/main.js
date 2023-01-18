import { createApp } from "vue";
import App from "./App.vue";

import store from "./store";

import "bootstrap-icons/font/bootstrap-icons.css";
import "./assets/style.scss";
import "bootstrap/dist/js/bootstrap.esm";

import timeago from "vue-timeago3";

createApp(App).use(timeago).use(store).mount("#app");
