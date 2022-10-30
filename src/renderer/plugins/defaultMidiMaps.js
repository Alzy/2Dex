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
  },

  "APC40MK2": {
    deckAButtonMap: [
      32, 33, 34, 35,
      24, 25, 26, 27,
      16, 17, 18, 19,
      8, 9 , 10, 11,
      0, 1, 2, 3
    ],
    deckBButtonMap: [
      36, 37, 38, 39,
      28, 29, 30, 31,
      20, 21, 22, 23,
      12, 13, 14, 15,
      4, 5, 6, 7
    ],
    deckAStopButtonMap: [
      {note: 52, channel: 0},
      {note: 52, channel: 1},
      {note: 52, channel: 2},
      {note: 52, channel: 3}
    ],
    deckBStopButtonMap: [
      {note: 52, channel: 4},
      {note: 52, channel: 5},
      {note: 52, channel: 6},
      {note: 52, channel: 7}
    ],
  }
}

export default ({ app }, inject) => {
  inject('defaultMidiMaps', defaultMidiMaps)
}
