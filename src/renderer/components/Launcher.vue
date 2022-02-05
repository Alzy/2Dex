<template>
  <div class="launcher-container" :scroll-lock="scroll_lock">
    <div class="toolbar">
      <h1 class="deck_name" :style="deck_color_style">{{ deck_name }}</h1>
      <SongSelect
        v-model="songSelected"
        :scenes="sceneMap"
        class="scene_selection"
        @input="onSongSelectionChange"
      />
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
          :empty="!clip.name.length"
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
import SongSelect from '@/components/SongSelect.vue'

export default {
  name: 'Launcher',
  components: {
    SongSelect
  },
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

    deck () {
      const deck = String(this.session).toUpperCase()
      return `deck${deck}`
    },
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
    deckOffset () {
      return this.$store.state.ableton[`${this.deck}SceneOffset`]
    },
    isLoaded () {
      if (typeof this.clips === 'undefined') return false
      return typeof this.clips[0] === 'object'
    }
  },

  watch: {
    isLoaded () {
      this.updateLedMatrix()
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
          const scene = Math.floor(parseInt(elem.getAttribute('index')) / 4)
          if (sceneIndexMap.includes(scene)) {
            this.songSelected = scene
          }
          if (scene !== this.deckOffset) {
            this.$store.dispatch('ableton/setDeckSceneOffset', [this.session, scene])
            this.updateLedMatrix()
          }
          break
        }
      }
    },

    updateLedMatrix () {
      const sliceFrom = this.deckOffset * 4; const sliceTo = sliceFrom + 16
      const visibleClips = this.clips.slice(sliceFrom, sliceTo)
      const ledGridMap = visibleClips.map(clip => { return (!(clip.name === '')) })
      // send midi message back to controller
      this.$store.dispatch('midi/sendGridStateMidiMessage', [this.session, ledGridMap])
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.launcher-container {
  position: relative;
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
      margin-left: 0.15em;
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

    &[empty="true"] {
      border-color: grey !important;
      border-width: medium;
      border-style: groove;
      opacity: 0.5;
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
