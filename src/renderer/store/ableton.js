const OSC = require('osc-js')
let _osc = null

export const state = () => ({
  oscStatus: false,

  tempo: 0,
  sceneMap: [],

  deckAClipMap: [],
  deckATrackStatus: ['active', 'active', 'active', 'active'],
  deckATrackState: ['idle', 'idle', 'idle', 'idle'],
  deckASceneOffset: 0,

  deckBClipMap: [],
  deckBTrackStatus: ['active', 'active', 'active', 'active'],
  deckBTrackState: ['idle', 'idle', 'idle', 'idle'],
  deckBSceneOffset: 0
})

export const mutations = {
  initOSC (state) {
    if (_osc !== null) {
      _osc.close()
      _osc = null
    }

    _osc = new OSC({
      plugin: new OSC.DatagramPlugin({
        open: {
          host: 'localhost', // @param {string} Hostname of udp server to bind to
          port: 9000 // @param {number} Port of udp server to bind to
        },
        send: {
          host: 'localhost', // @param {string} Hostname of udp client for messaging
          port: 9001 // @param {number} Port of udp client for messaging
        }
      })
    })

    _osc.on('open', () => {
      console.log('connection established...status:', _osc.status())
      $nuxt.$store.commit('ableton/setOSCStatus', true)
    })

    _osc.on('close', () => {
      console.log('connection was closed...status:', _osc.status())
      $nuxt.$store.commit('ableton/setOSCStatus', false)
    })

    _osc.on('error', err => {
      console.log(_osc.status())
      throw new Error('ERROR:', err)
    })

    _osc.open()
  },

  closeOSC (state) {
    if (_osc !== null) {
      _osc.close()
      _osc = null
    }
  },

  addOSCListener (state, [event, callback]) {
    _osc.on(event, callback)
  },

  setTempo (state, tempo) {
    state.tempo = tempo
  },

  setOSCStatus (state, status) {
    state.oscStatus = status
  },

  /// //////////////////
  // SCENE MUTATIONS //
  /// //////////////////
  setDeckSceneOffset (state, [deck, offset]) {
    deck = String(deck).toUpperCase()
    state[`deck${String(deck).toUpperCase()}SceneOffset`] = offset
  },
  setSceneMap (state, sceneMap) {
    state.sceneMap = sceneMap
  },

  /// //////////////////
  // DECK MUTATIONS //
  /// /////////////////
  setDeckClipMap (state, [deck, clipMap]) {
    deck = String(deck).toUpperCase()
    state['deck' + deck + 'ClipMap'] = clipMap
  },
  setDeckTrackStatus (state, [deck, track, status]) {
    deck = String(deck).toUpperCase()
    const newTrackStatus = [...state['deck' + deck + 'TrackStatus']]
    newTrackStatus[track] = status
    state['deck' + deck + 'TrackStatus'] = newTrackStatus
  },
  setDeckTrackState (state, [deck, track, trackState]) {
    deck = String(deck).toUpperCase()
    const newTrackState = [...state['deck' + deck + 'TrackState']]
    newTrackState[track] = trackState
    state['deck' + deck + 'TrackState'] = newTrackState
  }
}
export const actions = {
  /// //////////////
  // OSC ACTIONS //
  /// //////////////
  initialize (context) {
    context.commit('initOSC')

    context.commit('addOSCListener', ['/live/clip/state', message => {
      // eslint-disable-next-line prefer-const
      let [column, row, state] = message.args
      const deck = (column >= 4 && column < 8 ? 'B' : 'A')
      column = (deck === 'A' ? column : column - 4)
      const clipIndex = (row * 4) + column

      switch (state) {
      case 1:
        state = 'idle'
        break
      case 2:
        state = 'playing'
        break
      case 3:
        state = 'launching'
        break
      }

      context.dispatch('setClipState', [deck, clipIndex, state])
    }])

    context.commit('addOSCListener', ['/live/tempo', message => {
      const tempo = message.args[0]
      context.commit('setTempo', tempo)
    }])

    context.commit('addOSCListener', ['/live/track/state', message => {
      let [track, trackState] = message.args
      const deck = (track >= 4 && track < 8 ? 'B' : 'A')
      track = (deck === 'A' ? track : track - 4)

      if (trackState < 0) {
        trackState = 'idle'
      } else {
        trackState = 'playing' // any nonzero value number is playing I think...
      }

      context.commit('setDeckTrackState', [deck, track, trackState])
    }])

    context.commit('addOSCListener', ['/live/track/mute', message => {
      let [track, status] = message.args

      if (track > 7) { return }
      const deck = (track < 4 ? 'A' : 'B')
      track = (track < 4 ? track : track - 4)

      status = (status === 0 ? 'active' : '') // 0: unmuted, 1: muted
      context.commit('setDeckTrackStatus', [deck, track, status])
    }])

    context.commit('addOSCListener', ['/live/session/*/clip/*/all', message => {
      const regex = /live.session.(?<deck>[a-z]).clip.(?<attr>[a-z]*).all/g
      const result = regex.exec(message.address)
      let { deck, attr } = result.groups
      deck = deck.toUpperCase()
      attr = attr.slice(0, -1)

      const out = setArrayAttribute(context.state['deck' + deck + 'ClipMap'], message.args, attr)
      context.commit('setDeckClipMap', [deck, out])
    }])

    context.commit('addOSCListener', ['/live/scene/name/block/all', message => {
      const scenes = message.args
      const sceneMap = []
      scenes.forEach((name, index) => {
        if (isNaN(name) && name.length > 1) {
          sceneMap.push({
            name,
            index
          })
        }
      })
      context.commit('setSceneMap', sceneMap)
    }])
  },

  closeOSC (context) {
    context.commit('closeOSC')
  },

  setDeckSceneOffset (context, [deck, offset]) {
    context.commit('setDeckSceneOffset', [deck, offset])
  },

  /// ////////////////////
  // SCENE MAP ACTIONS //
  /// ////////////////////
  getSceneMap (context) {
    _osc.send(
      new OSC.Message('/live/scene/name/block/all')
    )
  },

  /// //////////////////
  // CLIPMAP ACTIONS //
  /// //////////////////
  getClipMapNames (context, deck) {
    deck = String(deck).toLowerCase()
    _osc.send(
      new OSC.Message('/live/session/' + deck + '/clip/names/all')
    )
  },
  getClipMapColors (context, deck) {
    deck = String(deck).toLowerCase()
    _osc.send(
      new OSC.Message('/live/session/' + deck + '/clip/colors/all')
    )
  },

  /// ///////////////
  // CLIP ACTIONS //
  /// ///////////////
  triggerClip (context, [deck, clipIndex]) {
    const column = clipIndex % 4
    const row = Math.floor(clipIndex / 4)
    _osc.send(
      new OSC.Message('/live/session/' + deck + '/launch', column, row)
    )
  },

  setClipState (context, [deck, clipIndex, state]) {
    deck = String(deck).toUpperCase()
    const clips = [...context.state[`deck${deck}ClipMap`]]
    clips[clipIndex].state = state
    context.commit('setDeckClipMap', [deck, clips])
  },

  resetClipStates (context, [deck]) {
    deck = String(deck).toUpperCase()
    const clips = [...context.state[`deck${deck}ClipMap`]]
    for (let i = 0; i < clips.length; i++) {
      clips[i].state = 'idle'
    }
    context.commit('setDeckClipMap', [deck, clips])
  },

  /// ////////////////
  // TRACK ACTIONS //
  /// ////////////////
  toggleTrack (context, [deck, track]) {
    deck = String(deck).toUpperCase()
    const liveTrack = (deck === 'A' ? track : track + 4)
    const state = (
      context.state['deck' + deck + 'TrackStatus'][track] === 'active'
        ? 1
        : 0
    )

    _osc.send(
      new OSC.Message('/live/track/mute', liveTrack, state)
    )
  },

  stopTrack (context, [deck, track]) {
    deck = String(deck).toUpperCase()
    const liveTrack = (deck === 'A' ? track : track + 4)
    _osc.send(
      new OSC.Message('/live/track/stop', liveTrack)
    )
  }
}

export const getters = {
  oscStatus: state => {
    return state.oscStatus
  },

  tempo: state => {
    return state.tempo
  },

  sceneMap: state => {
    return state.sceneMap
  },

  deckATrackStatus: state => {
    return state.deckATrackStatus
  },
  deckATrackState: state => {
    return state.deckATrackState
  },
  deckAClipMap: state => {
    return state.deckAClipMap
  },
  deckASceneOffset: state => {
    return state.deckASceneOffset
  },

  deckBTrackStatus: state => {
    return state.deckBTrackStatus
  },
  deckBTrackState: state => {
    return state.deckBTrackState
  },
  deckBClipMap: state => {
    return state.deckBClipMap
  },
  deckBSceneOffset: state => {
    return state.deckBSceneOffset
  }
}

export const modules = {
}

/// //////////////
// CLIP COLORS //
/// //////////////
export function decimalToHexString (number) {
  if (number < 0) {
    number = 0xFFFFFFFF + number + 1
  }

  return number.toString(16).toUpperCase().padStart(6, '0')
}
export function hexToRgb (hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return (result
    ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    }
    : null)
}
export function getColorBrightness (r, g, b) {
  return (r * 299 + g * 587 + b * 114) / 1000
}
export function getBrightnessCompliment (hexColor) {
  const rgbColor = hexToRgb(hexColor)
  const brightnessValue = getColorBrightness(rgbColor.r, rgbColor.g, rgbColor.b)
  return (brightnessValue > 150 ? 'black' : 'white')
}

export function generateColorStyles (decimalColor) {
  let style = ''
  const hexBGColor = decimalToHexString(decimalColor)

  style += `background-color: #${hexBGColor};`
  style += `color: ${getBrightnessCompliment(hexBGColor)};`
  return style
}

/// ////////////////
// CLIPMAP UTILS //
/// ////////////////
export function setArrayAttribute (array, appendArray, attribute) {
  const finalArray = [...array]
  appendArray.forEach((item, index) => {
    if (attribute === 'color') {
      // colors
      if (item === 0) {
        // don't assign colors if no color is set
        item = ''
      } else {
        item = generateColorStyles(item)
      }
    }

    // set
    if (typeof finalArray[index] === 'object') {
      finalArray[index][attribute] = item
    } else {
      finalArray[index] = {}
      finalArray[index][attribute] = item
    }
    finalArray[index].index = index
  })
  return finalArray
}
