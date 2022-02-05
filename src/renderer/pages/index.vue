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
import { mapMutations, mapGetters } from 'vuex'

const Fs = require('@supercharge/fs')

export default {
  name: 'Home',
  components: {
    Launcher,
    MidiSettings
  },

  data () {
    return {
      osc: null,
      dataFolder: '',
    }
  },

  computed: {
    ...mapGetters('ableton', [
        'sceneMap',
        'deckAClipMap',
        'deckBClipMap',
      ])
  },

  async mounted() {
    this.dataFolder = await Fs.homeDir('2dex')
    await Fs.ensureFile(`${this.dataFolder}/session.cache`)
    const sessionCache = await Fs.content(`${this.dataFolder}/session.cache`)
    this.loadSceneCache(sessionCache)
  },

  methods: {
    ...mapMutations('ableton', [
      'setSceneMap',
      'setDeckClipMap'
    ]),

    loadSceneCache (sessionCache) {
      if (sessionCache.length === 0) return
      let {sceneMap, deckAClipMap, deckBClipMap} = JSON.parse(sessionCache)
      this.setSceneMap(sceneMap)
      this.setDeckClipMap(['a', deckAClipMap])
      this.setDeckClipMap(['b', deckBClipMap])
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
