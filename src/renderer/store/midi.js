/// //////////////////////
// MIDI LIBRARY CONFIG //
/// //////////////////////
const STATUS_NOTE_ON = 144
const STATUS_NOTE_OFF = 128

const midi = require('midi')
const input = new midi.Input()
const input2 = new midi.Input()

function triggerIfInButtonMap (session, note) {
  const deck = `deck${String(session).toUpperCase()}`
  const pos = $nuxt.$store.state.midi[`${deck}ButtonMap`].indexOf(note)
  if (pos >= 0) {
    const deckSceneOffset = $nuxt.$store.state.ableton[`${deck}SceneOffset`]
    const offsetPos = (deckSceneOffset * 4) + pos
    $nuxt.$store.dispatch('ableton/triggerClip', [session, offsetPos])
  }
}

function triggerIfInStopButtonMap (session, note) {
  const deck = `deck${String(session).toUpperCase()}`
  const index = $nuxt.$store.state.midi[`${deck}StopButtonMap`].indexOf(note)
  if (index >= 0) {
    $nuxt.$store.dispatch('ableton/stopTrack', [session, index])
  }
}

input.on('message', (deltaTime, message) => {
  // The message is an array of numbers corresponding to the MIDI bytes:
  //   [status, data1, data2]
  // https://www.cs.cf.ac.uk/Dave/Multimedia/node158.html has some helpful
  // information interpreting the messages.
  const [status, data1, data2] = message
  console.log(status, data1, data2)
  if (status >= 144 && status <= 159) {
    // data1 => note # , data2 => velocity
    triggerIfInButtonMap('a', data1)
    triggerIfInStopButtonMap('a', data1)

    if ($nuxt.$store.state.midi.useSingleMidiController) {
      triggerIfInButtonMap('b', data1)
      triggerIfInStopButtonMap('b', data1)
    }
  }
})

input2.on('message', (deltaTime, message) => {
  const [status, data1, data2] = message
  console.log(status, data1, data2)
  if (status >= 144 && status <= 159) {
    // data1 => note # , data2 => velocity
    triggerIfInButtonMap('b', data1)
    triggerIfInStopButtonMap('b', data1)
  }
})

/// ////////
// STORE //
/// ////////
export const state = () => ({
  isOpen: true,
  midiDevices: [],
  useSingleMidiController: true,

  deckAPort: null,
  deckAButtonMap: [
    76, 77, 78, 79,
    72, 73, 74, 75,
    68, 69, 70, 71,
    64, 65, 66, 67
  ],
  deckAStopButtonMap: [
    60, 61, 62, 63
  ],

  deckBPort: null,
  deckBButtonMap: [
    48, 49, 50, 51,
    44, 45, 46, 47,
    40, 41, 42, 43,
    36, 37, 38, 39
  ],
  deckBStopButtonMap: [
    32, 33, 34, 35
  ]
})

export const mutations = {
  setIsOpen (state, isOpen) {
    state.isOpen = isOpen
  },

  setMidiDevices (state, devices) {
    state.midiDevices = devices
  },

  setUseSingleMidiController (state, value) {
    state.useSingleMidiController = value
  },

  setOpenPort (state, [deck, port]) {
    state[`deck${String(deck).toUpperCase()}Port`] = port
  },

  closeOpenPort (state, deck) {
    state[`deck${String(deck).toUpperCase()}Port`] = null
  }
}

export const actions = {
  toggleIsOpen (context) {
    context.commit('setIsOpen', !context.state.isOpen)
  },

  getMidiDevices (context) {
    const pCount = input.getPortCount()
    const devices = []
    for (let i = 0; i < pCount; i++) {
      devices.push({
        port: i,
        name: input.getPortName(i)
      })
    }
    context.commit('setMidiDevices', devices)
  },

  updateUseSingleMidiController (context, value) {
    context.commit('setUseSingleMidiController', value)
  },

  openPort (context, [deck, number]) {
    const _deck = String(deck).toUpperCase()
    if (_deck === 'A') {
      input.openPort(number)
    } else {
      input2.openPort(number)
    }
    context.commit('setOpenPort', [deck, number])
    console.log(`(Deck${_deck}) port opened:`, number)
  },

  closePort (context, [deck, number]) {
    const _deck = String(deck).toUpperCase()
    if (_deck === 'A') {
      input.closePort(number)
    } else {
      input2.closePort(number)
    }
    context.commit('closeOpenPort', deck)
    console.log(`(Deck${_deck}) port closed:`, number)
  }
}

export const getters = {
  isOpen: state => {
    return state.isOpen
  },

  midiDevices: state => {
    return state.midiDevices
  },

  useSingleMidiController: state => {
    return state.useSingleMidiController
  }
}
