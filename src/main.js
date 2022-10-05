import { createApp } from "vue";
import App from "./App.vue";

import "bootstrap-icons/font/bootstrap-icons.css";
import "./assets/style.scss";
import "bootstrap/dist/js/bootstrap.esm";

import timeago from "vue-timeago3";

createApp(App).use(timeago).mount("#app");
