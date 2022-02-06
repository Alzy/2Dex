<template>
  <div class="deck-midi-config-wrapper">
    <div class="midi-device">
      <h1>
        Deck {{ String(session).toUpperCase() }} Config
      </h1>
      <section>
        <h3>Select MIDI device for this deck:</h3>
        <v-radio-group v-model="midiDevice" :disabled="useSingleMidiController && session === 'b'" @change="onMidiDeviceRadioChange">
          <v-radio
            v-for="device in midiDevices"
            :key="device.port"
            :label="device.name"
            :value="device.port"
            :disabled="mappingButtons"
          />
        </v-radio-group>
        <h3>Output Device</h3>
        <v-radio-group v-model="midiOutDevice" :disabled="useSingleMidiController && session === 'b'" @change="onMidiOutDeviceRadioChange">
          <v-radio
            v-for="device in midiOutDevices"
            :key="device.port"
            :label="device.name"
            :value="device.port"
            :disabled="mappingButtons"
          />
        </v-radio-group>
        <v-btn v-if="midiDevice !== null" @click="onResetButtonClick">Reset</v-btn>

        <v-checkbox v-if="session==='b'" v-model="useSingleMidiController" label="Use same controller as deck A" @change="updateUseSingleMidiController" />
      </section>
    </div>
    <section>
      <h2>Midi Controls</h2>
      <v-select
        :items="deviceMaps"
        label="Load from profile"
        class="device-map-select"
        outlined
        @change="onDeviceProfileChange"
      ></v-select>

      <h3>Grid Buttons:</h3>
      <v-btn :loading="mappingButtons" color="primary" @click="onButtonMapClick">Map buttons</v-btn>
      <div class="midi-button-grid">
        <div v-for="btn in buttonMap" class="grid-button">
          <span v-if="btn">{{ btn }}</span>
          <span v-else>_</span>
        </div>
      </div>
    </section>

    <section>
      <h3>Stop Buttons:</h3>
      <v-btn :loading="mappingButtons" color="primary" @click="onButtonMapClick">Map buttons</v-btn>
      <div class="midi-button-grid">
        <div v-for="btn in stopButtonMap" class="grid-button">
          <span v-if="btn">{{ btn }}</span>
          <span v-else>_</span>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
// @ is an alias to /src
import { mapActions, mapMutations, mapGetters } from 'vuex'
const Fs = require('@supercharge/fs')

export default {
  components: {
  },

  data () {
    return {
      midiDevice: null,
      midiOutDevice: null,
      mappingButtons: false,
      useSingleMidiController: true
    }
  },

  computed: {
    ...mapGetters('midi', [
      'midiDevices',
      'midiOutDevices',
      'deckAButtonMap',
      'deckAStopButtonMap',
      'deckBButtonMap',
      'deckBStopButtonMap',
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
    },

    deviceMaps () {
      return Object.keys(this.$defaultMidiMaps)
    }
  },

  async mounted () {
    this.dataFolder = await Fs.homeDir('2dex')
    await Fs.ensureFile(`${this.dataFolder}/midi.cache`)
    const midiCache = await Fs.content(`${this.dataFolder}/midi.cache`)
    this.loadMidiCache(midiCache)
  },

  beforeDestroy () {
    this.closePort([this.session, this.midiDevice])
  },

  methods: {
    ...mapActions('midi', [
      'openPort',
      'openOutPort',
      'closePort',
      'closeOutPort',
      'updateUseSingleMidiController'
    ]),

    ...mapMutations('midi', [
      'setDeckButtonMap',
      'setDeckStopButtonMap',
    ]),

    loadMidiCache (midiCache) {
      if (midiCache.length === 0) {
        this.initMidiCache()
        return
      }
      let {deckAMidiMap, deckBMidiMap} = JSON.parse(midiCache)
      let deckMidiMap = String(this.session).toUpperCase() === 'A' ? deckAMidiMap : deckBMidiMap
      this.setDeckButtonMap([this.session, deckMidiMap.deckButtonMap])
      this.setDeckStopButtonMap([this.session, deckMidiMap.deckStopButtonMap])
    },

    async initMidiCache () {
      await Fs.writeFile(`${this.dataFolder}/midi.cache`, JSON.stringify({
        deckAMidiMap: {
          ...this.$defaultMidiMaps['2dex']
        },
        deckBMidiMap: {
          ...this.$defaultMidiMaps['Atom']
        },
      }))
    },

    async writeMidiCache () {
      await Fs.writeFile(`${this.dataFolder}/midi.cache`, JSON.stringify({
        deckAMidiMap: {
          deckButtonMap: this.deckAButtonMap,
          deckStopButtonMap: this.deckAStopButtonMap,
        },
        deckBMidiMap: {
          deckButtonMap: this.deckBButtonMap,
          deckStopButtonMap: this.deckBStopButtonMap,
        },
      }))
    },

    onDeviceProfileChange (selected) {
      this.setDeckButtonMap([this.session, this.$defaultMidiMaps[selected].deckButtonMap])
      this.setDeckStopButtonMap([this.session, this.$defaultMidiMaps[selected].deckStopButtonMap])
      this.writeMidiCache()
    },

    onButtonMapClick () {
      this.mappingButtons = true
    },

    onMidiDeviceRadioChange () {
      this.openPort([this.session, this.midiDevice])
    },

    onMidiOutDeviceRadioChange () {
      this.openOutPort([this.session, this.midiOutDevice])
    },

    onResetButtonClick () {
      this.closePort([this.session, this.midiDevice])
      if (this.midiOutDevice) { this.closeOutPort([this.session, this.midiOutDevice]) }

      this.midiDevice = null
      this.midiOutDevice = null
    },

    onSingleMidiControllerChange () {
      this.updateUseSingleMidiController(this.useSingleMidiController)
    }
  },

  props: {
    session: { type: String, default: 'a' }
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

.deck-midi-config-wrapper .midi-device {
  display: flex;
  flex-direction: column;
}

.device-map-select {
  max-width: 75%;
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
