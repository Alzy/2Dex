/// //////////////////////
// MIDI LIBRARY CONFIG //
/// //////////////////////
const STATUS_NOTE_ON = 144
const STATUS_NOTE_OFF = 128

const midi = require('midi')
const input = new midi.Input()
const output = new midi.Output()
const input2 = new midi.Input()
const output2 = new midi.Output()

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
  // console.log(status, data1, data2)
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
  // console.log(status, data1, data2)
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
  midiOutDevices: [],
  useSingleMidiController: true,

  deckAPort: null,
  deckAOutPort: null,
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
  deckBOutPort: null,
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

  setMidiOutDevices (state, devices) {
    state.midiOutDevices = devices
  },

  setUseSingleMidiController (state, value) {
    state.useSingleMidiController = value
  },

  setOpenPort (state, [deck, port]) {
    state[`deck${String(deck).toUpperCase()}Port`] = port
  },

  setOpenOutPort (state, [deck, port]) {
    state[`deck${String(deck).toUpperCase()}OutPort`] = port
  },

  closeOpenOutPort (state, deck) {
    state[`deck${String(deck).toUpperCase()}OutPort`] = null
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
    // set midi in devices
    const pCount = input.getPortCount()
    const devices = []
    for (let i = 0; i < pCount; i++) {
      devices.push({
        port: i,
        name: input.getPortName(i)
      })
    }
    context.commit('setMidiDevices', devices)

    // set midi out devices
    const pOutCount = output.getPortCount()
    const outDevices = []
    for (let i = 0; i < pOutCount; i++) {
      outDevices.push({
        port: i,
        name: output.getPortName(i)
      })
    }
    context.commit('setMidiOutDevices', outDevices)
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
    console.log(`(Deck${_deck}) INPUT port opened: ${number}`)
  },

  openOutPort (context, [deck, number]) {
    const _deck = String(deck).toUpperCase()
    if (_deck === 'A') {
      output.openPort(number)
    } else {
      output2.openPort(number)
    }
    context.commit('setOpenOutPort', [deck, number])
    console.log(`(Deck${_deck}) OUTPUT port opened: ${number}`)
  },

  closePort (context, [deck, number]) {
    const _deck = String(deck).toUpperCase()
    if (_deck === 'A') {
      input.closePort(number)
    } else {
      input2.closePort(number)
    }
    context.commit('closeOpenPort', deck)
    console.log(`(Deck${_deck}) INPUT port closed:`, number)
  },

  closeOutPort (context, [deck, number]) {
    const _deck = String(deck).toUpperCase()
    if (_deck === 'A') {
      output.closePort(number)
    } else {
      output2.closePort(number)
    }
    context.commit('closeOpenOutPort', deck)
    console.log(`(Deck${_deck}) OUTPUT port closed:`, number)
  },


  /**
   * Will send midi messages back to the midi controller to turn on and off lights in led matrix.
   *
   * grid state will look something like: [
   *  true, false, true, true,
   *  true, false, false, true,
   *  true, true, true, true,
   *  true, true, true, true,
   * ]
   * @param context
   * @param deck deck A/B (ie: "a" or "b")
   * @param gridState grid of booleans representing whether lights should be on or not.
   */
  sendGridStateMidiMessage (context, [deck, gridState]) {
    const _deck = String(deck).toUpperCase()
    let outputDev = ((_deck === 'A') ? output : output2)
    gridState.forEach((ledState, index) => {
      let midiEventType = ledState ? STATUS_NOTE_ON : STATUS_NOTE_OFF
      let midiNote = context.state[`deck${_deck}ButtonMap`][index]
      outputDev.sendMessage([midiEventType, midiNote, 127]);
    })
  }
}

export const getters = {
  isOpen: state => {
    return state.isOpen
  },

  midiDevices: state => {
    return state.midiDevices
  },

  midiOutDevices: state => {
    return state.midiOutDevices
  },

  useSingleMidiController: state => {
    return state.useSingleMidiController
  }
}
