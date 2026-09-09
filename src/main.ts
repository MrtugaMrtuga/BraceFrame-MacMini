import "./styles.css";
import { registerSW } from "virtual:pwa-register";
import { mountApp } from "./app";

registerSW({ immediate: true });

const root = document.getElementById("app");
if (root) mountApp(root);
