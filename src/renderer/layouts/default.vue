<template>
  <v-app>
    <div id="default-layout">
      <app-header />
      <nuxt />
    </div>
  </v-app>
</template>

<script>
import appHeader from '@/components/header'
export default {
  components: { appHeader }
}
</script>

<style>
html, body {
  margin: 0 !important;
  overflow: hidden;
}
#default-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
}
</style>
