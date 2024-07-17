<script setup>
import {init} from "./twin.js";
import { onMounted, ref } from "vue";

onMounted(()=>{

   init()
})
</script>

<template>
<div style="background: black;" id="container"></div>
<div id="canvas" ref="canvas"></div>
</template>

<style scoped>

#container {
  width: 100%;
  height: 100vh;
  position: relative;
  overflow: hidden;
}
</style>
