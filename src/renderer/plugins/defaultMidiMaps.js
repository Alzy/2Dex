const defaultMidiMaps = {
  "2dex": {
    deckButtonMap: [
      76, 77, 78, 79,
      72, 73, 74, 75,
      68, 69, 70, 71,
      64, 65, 66, 67
    ],
    deckStopButtonMap: [
      60, 61, 62, 63
    ],
  },
  "Atom": {
    deckButtonMap: [
      48, 49, 50, 51,
      44, 45, 46, 47,
      40, 41, 42, 43,
      36, 37, 38, 39
    ],
    deckStopButtonMap: [
      32, 33, 34, 35
    ]
  }
}

export default ({ app }, inject) => {
  inject('defaultMidiMaps', defaultMidiMaps)
}
