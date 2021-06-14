<template>
  <div class="home">
    <div class="deck deckA">
      <Launcher session="a" deck_name="Deck A" deck_color="#F92672" />
    </div>
    <div class="deck deckB">
      <Launcher session="b" deck_name="Deck B" deck_color="#FD971F" />
    </div>

    <MidiSettings />
  </div>
</template>

<script>
// @ is an alias to /src
import Launcher from '@/components/Launcher.vue'
import MidiSettings from '@/components/MidiSettings.vue'

export default {
  name: 'Home',
  components: {
    Launcher,
    MidiSettings
  },

  data () {
    return {
      osc: null
    }
  }
}
</script>

<style scoped lang="scss">
.home {
  display: flex;
  max-height: 100vh;
  overflow: hidden;
  flex-grow: 1;

  .deck {
    display: flex;
    flex-grow: 1;
    padding: 0 1em;
    background-color: #181915;
    flex-basis: 50%;
  }
}
</style>
