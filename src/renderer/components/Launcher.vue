<template>
  <div class="launcher-container" :scroll-lock="scroll_lock">
    <div class="toolbar">
      <h1 class="deck_name" :style="deck_color_style" @click="test">{{ deck_name }}</h1>
      <select v-model="songSelected" class="song_selection" @change="onSongSelectionChange">
        <option selected value="0">Jump to: </option>
        <option v-for="scene in sceneMap" :key="scene.index" :value="scene.index">{{ scene.name }}</option>
      </select>
    </div>

    <!-- Clip launch buttons -->
    <div v-if="isLoaded" ref="launcher" class="launcher" @scroll="onScroll">
      <div v-for="clip in clips" :key="clip.index" class="clip">
        <button
          :ref="'clip'+clip.index"
          :index="clip.index"
          :style="clip.color"
          :state="clip.state"
          :reference="'clip'+clip.index"
          @click="onClipBtnClick(clip.index, $event)"
          @touchstart="onClipBtnTouchStart(clip.index)"
          @touchend="onClipBtnClick(clip.index, $event)"
        >
          {{ clip.name }}
        </button>
      </div>
    </div>
    <!-- Place holder when not initiated -->
    <div v-else ref="launcher" class="launcher">
      <div v-for="clip in clips" :key="clip.index" class="clip">
        <button />
      </div>
    </div>

    <div class="transport">
      <div class="stop-btns btns-container">
        <button @click.prevent="onStopBtnClick(0)" @touchend.prevent="onStopBtnClick(0)">◼</button>
        <button @click.prevent="onStopBtnClick(1)" @touchend.prevent="onStopBtnClick(1)">◼</button>
        <button @click.prevent="onStopBtnClick(2)" @touchend.prevent="onStopBtnClick(2)">◼</button>
        <button @click.prevent="onStopBtnClick(3)" @touchend.prevent="onStopBtnClick(3)">◼</button>
      </div>

      <div class="activate-btns btns-container">
        <button
          :class="trackStatus[0]"
          :state="trackState[0]"
          @click.prevent="onActivateBtnClick(0)"
          @touchend.prevent="onActivateBtnClick(0)"
        >
          1
        </button>
        <button
          :class="trackStatus[1]"
          :state="trackState[1]"
          @click.prevent="onActivateBtnClick(1)"
          @touchend.prevent="onActivateBtnClick(1)"
        >
          2
        </button>
        <button
          :class="trackStatus[2]"
          :state="trackState[2]"
          @click.prevent="onActivateBtnClick(2)"
          @touchend.prevent="onActivateBtnClick(2)"
        >
          3
        </button>
        <button
          :class="trackStatus[3]"
          :state="trackState[3]"
          @click.prevent="onActivateBtnClick(3)"
          @touchend.prevent="onActivateBtnClick(3)"
        >
          4
        </button>
      </div>
    </div>
  </div>
</template>

<script>

import { mapGetters } from 'vuex'

export default {
  name: 'Launcher',
  props: {
    session: { type: String, default: 'a' },
    deck_name: { type: String, default: 'Deck A' },
    deck_color: { type: String, default: 'red' }
  },
  data () {
    return {
      deck_color_style: String,
      deck_border_color_style: String,
      is_scrolling: false,
      songSelected: 0,
      scroll_timer: null,
      scroll_lock: false,
      clips_held: 0
    }
  },
  computed: {
    ...mapGetters('ableton', [
      'sceneMap',
      'deckATrackStatus',
      'deckATrackState',
      'deckAClipMap',
      'deckBTrackStatus',
      'deckBTrackState',
      'deckBClipMap'
    ]),

    trackStatus () {
      const deck = String(this.session).toUpperCase()
      if (deck === 'B') return this.deckBTrackStatus
      return this.deckATrackStatus
    },
    trackState () {
      const deck = String(this.session).toUpperCase()
      if (deck === 'B') return this.deckBTrackState
      return this.deckATrackState
    },
    clips () {
      const deck = String(this.session).toUpperCase()
      if (deck === 'B') return this.deckBClipMap
      return this.deckAClipMap
    },
    isLoaded () {
      if (typeof this.clips === 'undefined') return false
      return typeof this.clips[0] === 'object'
    }
  },

  mounted () {
    this.deck_color_style = 'color: ' + this.deck_color + ';'
    this.deck_border_color_style = 'border-color: ' + this.deck_color + ';'
  },
  methods: {
    onSongSelectionChange () {
      const targetClipIndex = this.songSelected * 4
      const targetClipElem = this.$refs[`clip${targetClipIndex}`][0]
      targetClipElem.scrollIntoView()
    },

    onClipBtnClick (index, event) {
      event.preventDefault()
      if (this.is_scrolling === true) { return } // only trigger if not scrolling (touchscreens).
      this.$store.dispatch('ableton/triggerClip', [this.session, index])
      this.onClipBtnTouchEnd(index)
    },
    onClipBtnTouchStart (index) {
      setTimeout(() => {
        if (this.is_scrolling === false) {
          const targetClipElem = this.$refs[`clip${index}`][0]
          targetClipElem.classList.add('held')
          this.clips_held += 1

          if (this.clips_held > 0) {
            this.scroll_lock = true
          }
        }
      }, 150)
    },
    onClipBtnTouchEnd (index) {
      const targetClipElem = this.$refs[`clip${index}`][0]

      targetClipElem.classList.remove('held')
      setTimeout(() => {
        // dirty way to clear the hold if it's still set
        targetClipElem.classList.remove('held')
      }, 150)

      this.clips_held -= 1

      if (this.clips_held <= 0) {
        this.scroll_lock = false
      }
    },

    onActivateBtnClick (index) {
      this.$store.dispatch('ableton/toggleTrack', [this.session, index])
    },
    onStopBtnClick (index) {
      this.$store.dispatch('ableton/stopTrack', [this.session, index])
    },

    onScroll () {
      // set is_scrolling
      if (this.scroll_timer !== null) {
        this.is_scrolling = true
        clearTimeout(this.scroll_timer)
      }
      this.scroll_timer = setTimeout(() => {
        this.is_scrolling = false
      }, 250)

      // set song select option when clip button is on top of view.
      const sceneIndexMap = this.sceneMap.map(x => x.index)
      for (let i = 0; i < this.clips.length; i++) {
        const elem = this.$refs[`clip${i}`][0]
        const distanceFromTop = Math.abs(
          elem.getBoundingClientRect().top -
          this.$refs.launcher.getBoundingClientRect().top
        )
        if (distanceFromTop > 0 && distanceFromTop < 50) {
          const scene = parseInt(elem.getAttribute('index')) / 4
          if (sceneIndexMap.includes(scene)) {
            this.songSelected = scene
            break
          }
        }
      }
    },

    test () {
      this.$store.dispatch('ableton/getSceneMap')
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.launcher-container {
  width: 100%;
  max-height: 100%;
  flex-grow: 1;
  display: flex;
  flex-direction: column;

  .toolbar {
    display: flex;

    .deck_name {
      flex-grow: 1;
      text-align: left;
    }

    .song_selection {
      flex-grow: 1;
      background-color: unset;
      color: white;
      font-size: 1.25em;
      padding: 0.5em;

      option {
        font-size: 96px;
        background-color: unset;
        color: black;
      }
    }
  }

  button {
    background-color: unset;
    border-color: white;
    border-radius: 0.5em;
    color: white;

    &.active {
      background-color: white;
      color: black;
    }

    &.held {
      opacity: 0.5;
    }

    &:focus {
      outline: none;
    }
  }

  &[scroll-lock="true"] .launcher {
    overflow: hidden !important;
    padding-right: 17px;
  }

  .launcher {
    height: 100%;
    display: flex;
    flex-wrap: wrap;
    overflow-x: hidden;
    overflow-y: scroll;
    scroll-snap-type: y mandatory;

    .clip {
      display: flex;
      width: 25%;
      height: 25%;
      flex-grow: 1;
      padding: 0.25rem;
      scroll-snap-align: start;

      button {
        flex-grow: 1;
        height: 100%;
        font-size: 1em;
        margin: 0.15em;

        &[state='idle'] {
        }
        &[state='launching'] {
          border-style: dotted;
          border-width: medium;
        }
        &[state='playing'] {
          border-color: #A6E22E !important;
          border-width: thick;
          border-style: groove;
        }
      }
    }
  }

  .transport {
    display: flex;
    flex-direction: column;
    padding-right: 17px;
    padding-top: 0.5em;
    padding-bottom: 1em;
    border-top: 3px solid white;

    .btns-container {
      display: flex;

      button {
        flex-grow: 1;
        margin: 0.15em;
        height: 4em;
        font-size: 18px;
      }
    }

    .activate-btns button {
      &[state='idle'] {
        border-color: grey !important;
        border-width: thick;
        border-style: groove;
      }
      &[state='playing'] {
        border-color: #A6E22E !important;
        border-width: thick;
        border-style: groove;
      }
    }
  }
}
</style>