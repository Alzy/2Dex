/////////////////////////
// MIDI LIBRARY CONFIG //
/////////////////////////
const STATUS_NOTE_ON = 144
const STATUS_NOTE_OFF = 128

const midi = require('midi')
let input = new midi.Input()


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
  let [status, data1, data2] = message
  // console.log(status, data1, data2);
  if (status === STATUS_NOTE_ON) {
    // data1 => note # , data2 => velocity
    triggerIfInButtonMap('a', data1)
    triggerIfInButtonMap('b', data1)
    triggerIfInStopButtonMap('a', data1)
    triggerIfInStopButtonMap('b', data1)
  }
})

///////////
// STORE //
///////////
export const state = () => ({
  isOpen: true,
  midiDevices: [],
  openPorts: [],

  deckAMidiDevice: null,
  deckAButtonMap: [
    76, 77, 78, 79,
    72, 73, 74, 75,
    68, 69, 70, 71,
    64, 65, 66, 67
  ],
  deckAStopButtonMap: [
    60, 61, 62, 63,
  ],

  deckBMidiDevice: null,
  deckBButtonMap: [
    null, null, null, null,
    null, null, null, null,
    null, null, null, null,
    null, null, null, null
  ],
  deckBStopButtonMap: [
    null, null, null, null
  ],
})

export const mutations = {
  setIsOpen (state, isOpen) {
    state.isOpen = isOpen
  },

  setMidiDevices (state, devices) {
    state.midiDevices = devices
  },

  setOpenPort (state, port) {
    let _openPorts = state.openPorts
    if(state.openPorts.indexOf(port) === -1) {
      _openPorts.push(port)
    }
    state.openPorts = _openPorts
  },

  closeOpenPort (state, port) {
    let _openPorts = state.openPorts
    if(state.openPorts.indexOf(port) > -1) {
      _openPorts.splice(port, 1)
    }
    state.openPorts = _openPorts
  }
}

export const actions = {
  toggleIsOpen (context) {
    context.commit('setIsOpen', !context.state.isOpen)
  },

  getMidiDevices (context) {
    const pCount = input.getPortCount()
    let devices = []
    for (let i = 0; i < pCount; i++) {
      devices.push({
        port: i,
        name: input.getPortName(i)
      })
    }
    context.commit('setMidiDevices', devices)
  },

  openPort (context, number) {
    console.log('port opened:', number)
    input.openPort(number)
    context.commit('setOpenPort', number)
  },

  closePort (context, number) {
    console.log('port closed:', number)
    input.closePort(number)
    context.commit('closeOpenPort', number)
  }
}

export const getters = {
  isOpen: state => {
    return state.isOpen
  },

  midiDevices: state => {
    return state.midiDevices
  },
}
