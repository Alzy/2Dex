<template>
  <div class="deck-midi-config-wrapper">
    <h1>
      Deck {{String(session).toUpperCase()}} Config
    </h1>
    <section>
      <h3>Select MIDI device for this deck:</h3>
      <v-radio-group v-model="midiDevice" @change="openPort(midiDevice)">
        <v-radio
          v-for="device in midiDevices"
          :key="device.port"
          :label="device.name"
          :value="device.port"
          :disabled="mappingButtons"
        ></v-radio>
      </v-radio-group>
    </section>

    <section>
      <h3>Grid Buttons:</h3>
      <v-btn :loading="mappingButtons" @click="onButtonMapClick" color="primary">Map buttons</v-btn>
      <div class="midi-button-grid">
        <div v-for="btn in buttonMap" class="grid-button">
          <span v-if="btn">{{btn}}</span>
          <span v-else>_</span>
        </div>
      </div>
    </section>

    <section>
      <h3>Stop Buttons:</h3>
      <v-btn :loading="mappingButtons" @click="onButtonMapClick" color="primary">Map buttons</v-btn>
            <div class="midi-button-grid">
        <div v-for="btn in stopButtonMap" class="grid-button">
          <span v-if="btn">{{btn}}</span>
          <span v-else>_</span>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
// @ is an alias to /src
import { mapActions, mapGetters } from 'vuex'

export default {
  components: {
  },

  data () {
    return {
      midiDevice: null,
      mappingButtons: false
    }
  },

  computed: {
    ...mapGetters('midi', [
      'midiDevices'
    ]),

    deck () {
      const deck = String(this.session).toUpperCase()
      return `deck${deck}`
    },

    buttonMap () {
      return this.$store.state.midi[`${this.deck}ButtonMap`]
    },

    stopButtonMap () {
      return this.$store.state.midi[`${this.deck}StopButtonMap`]
    }
  },

  mounted () {
  },

  beforeDestroy () {
    this.closePort(this.midiDevice)
  },

  methods: {
    ...mapActions('midi', ['openPort', 'closePort']),

    onButtonMapClick () {
      this.mappingButtons = true
    }

  },

  props: {
    session: {type: String, default: 'a'}
  }
}
</script>


<style>
.deck-midi-config-wrapper {
  padding: 1.5rem 0.5rem 1rem 0;
}

.deck-midi-config-wrapper h1, h2, h3 {
  margin-bottom: 1em;
}
.deck-midi-config-wrapper section {
  margin-bottom: 3rem;
}

.midi-button-grid {
  max-width: 75%;
}
.midi-button-grid .grid-button {
  display: inline-block;
  width: 25%;
  border: 1px solid white;
  text-align: center;
  height: 3rem;
}
</style>
