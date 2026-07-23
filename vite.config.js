import glsl from "vite-plugin-glsl";
import restart from "vite-plugin-restart";
import vue from "@vitejs/plugin-vue";

export default {
  root: "src/",
  publicDir: "../static/",
  base: "./",
  server: {
    host: true,
    open: false,
  },
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    sourcemap: true,
  },
  plugins: [vue(), glsl(), restart({ restart: ["../static/**"] })],
};
