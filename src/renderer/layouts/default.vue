<template>
  <div id="default-layout">
    <app-header />
    <nuxt />
  </div>
</template>

<script>
import appHeader from '@/components/header'
export default {
  components: { appHeader }
}
</script>

<style>
body {
  margin: 0 !important;
}
#default-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
}
</style>
