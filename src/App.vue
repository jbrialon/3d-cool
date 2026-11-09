<script setup>
// Three.js app
import Experience from "./Experience/Experience";
const experience = new Experience();
</script>

<template>
  <div class="container"></div>
</template>

<style lang="scss">
#app {
  position: relative;
  width: 100vw;
  height: var(--vh);
  pointer-events: none;
}

.container {
  position: relative;
  display: flex;
  flex-direction: row;
  width: 100vw;
  height: var(--vh);
  z-index: var(--z-ui);
}
</style>
