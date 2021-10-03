<template>
  <header class="main-header">
    <nav>
      <v-btn plain dark x-large>
        <v-icon>mdi-view-grid-outline</v-icon>
      </v-btn>
      <v-btn plain dark x-large @click="onMidiClick">
        <v-icon>mdi-midi-port</v-icon>
      </v-btn>
      <v-btn plain dark x-large @click="onSyncClick">
        <v-icon>mdi-table-sync</v-icon>
      </v-btn>
    </nav>
    <div v-if="tempo > 0" class="d-flex align-center mr-2">
      <v-chip outlined dark>
        <v-icon left>mdi-metronome</v-icon>
        {{tempoFormatted}} bpm
      </v-chip>
    </div>
  </header>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'

export default {
  mounted () {
  },

  beforeDestroy () {
    this.closeOSC()
  },

  computed: {
    ...mapGetters('ableton', ['tempo']),

    tempoFormatted () {
      return isNaN(this.tempo) ? 0 : this.tempo.toFixed(2)
    }
  },

  methods: {
    ...mapActions('ableton', ['initialize', 'closeOSC']),

    onMidiClick () {
      this.$store.dispatch('midi/toggleIsOpen')
    },

    onSyncClick () {
      this.initialize()

      setTimeout(() => {
        this.$store.dispatch('ableton/getClipMapNames', 'a')
        this.$store.dispatch('ableton/getClipMapColors', 'a')
        this.$store.dispatch('ableton/resetClipStates', 'a')
        this.$store.dispatch('ableton/getClipMapNames', 'b')
        this.$store.dispatch('ableton/getClipMapColors', 'b')
        this.$store.dispatch('ableton/resetClipStates', 'b')
        this.$store.dispatch('ableton/getSceneMap')
      }, 125)
    }
  }
}
</script>

<style scoped>
    .main-header {
        display: flex;
        background-color: #181915;
        border-bottom: 1px white;
    }

    nav{
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    nav div{
        height: 100%;
        margin: 0 20px;
        display: flex;
        align-items: center;
    }

    a {
        font-family: Helvetica, sans-serif;
        color: white;
        font-size: 1rem;
        font-weight: 100;
        text-decoration: underline;
        text-transform: uppercase;
    }

    a:hover{
        opacity: 0.9;
    }
</style>
