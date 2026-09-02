import { createRoot } from "react-dom/client";
import "./global.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(<App />);

/* Pas de service worker en développement : il servirait des fichiers en cache
   par-dessus le rechargement à chaud. */
if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  });
}
