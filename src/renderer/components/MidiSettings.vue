<template>
  <v-dialog
    v-model="isOpen"
    fullscreen
    transition="dialog-bottom-transition"
  >
    <v-card dark>
      <v-toolbar
        dark
      >
        <v-btn
          icon
          dark
        >
          <v-icon>mdi-midi-port</v-icon>
        </v-btn>
        <v-toolbar-title>MIDI Settings</v-toolbar-title>
        <v-spacer />
        <v-toolbar-items>
          <v-btn
            dark
            text
            @click="toggleIsOpen"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar-items>
      </v-toolbar>
      <v-card-text class="d-flex">
        <div class="flex-grow-1">
          <DeckMidiConfig session="a" />
        </div>
        <div class="flex-grow-1">
          <DeckMidiConfig session="b" />
        </div>
      </v-card-text>
      <v-card-actions>
        <v-btn x-large @click="toggleIsOpen">Done</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import DeckMidiConfig from '@/components/DeckMidiConfig.vue'
const Fs = require('@supercharge/fs')

export default {
  components: {
    DeckMidiConfig
  },

  data () {
    return {
      dataFolder: ''
    }
  },

  computed: {
    ...mapGetters('midi', [
      'isOpen',
      'midiDevices',
      'midiOutDevices'
    ])
  },

  async mounted () {
    this.getMidiDevices()

    const dataFolder = await Fs.homeDir('2dex')
    this.dataFolder = dataFolder
    const exists = await Fs.exists(dataFolder)
  },

  methods: {
    ...mapActions('midi', ['toggleIsOpen', 'getMidiDevices']),

    writeMidiSettings (path, data) {
      try {
        fs.writeFileSync(path, data, 'utf-8')
      } catch (e) { alert('Failed to save the file !') }
    }


  }
}
</script>

<style>
.v-dialog__container {
  display: unset;
}
</style>
