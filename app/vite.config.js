import { createHash } from "node:crypto";
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

function filesUnder(dir, root = dir) {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    return statSync(full).isDirectory() ? filesUnder(full, root) : [relative(root, full)];
  });
}

/* Écrit le service worker à partir de `src/sw.js` en y injectant la liste
   réelle des fichiers du build. Sans ça, la liste serait à tenir à la main
   alors que les noms changent à chaque build. */
function serviceWorker() {
  let outDir;
  return {
    name: "service-worker",
    apply: "build",
    configResolved(config) {
      outDir = resolve(config.root, config.build.outDir);
    },
    closeBundle() {
      const files = filesUnder(outDir).filter((f) => f !== "sw.js").sort();
      const assets = ["./", ...files.map((f) => `./${f.split("\\").join("/")}`)];

      const hash = createHash("sha256");
      files.forEach((f) => hash.update(f).update(readFileSync(join(outDir, f))));

      const source = readFileSync(resolve(import.meta.dirname, "src/sw.js"), "utf8")
        .replace('"__CACHE__"', JSON.stringify(`workout-${hash.digest("hex").slice(0, 12)}`))
        .replace('"__ASSETS__"', JSON.stringify(assets));

      writeFileSync(join(outDir, "sw.js"), source);
    },
  };
}

export default defineConfig({
  /* Chemins relatifs : l'app est servie depuis un sous-dossier
     (github.io/workout/) et doit rester déplaçable. */
  base: "./",
  plugins: [react(), serviceWorker()],
});
