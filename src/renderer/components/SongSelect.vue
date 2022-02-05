<template>
  <div>
    <select v-if="!showList" :value="value" class="scene_selection" @click.prevent.stop="showList = true">
      <option selected value="0">Jump to: </option>
      <option v-for="scene in scenes" :key="scene.index" :value="scene.index">{{ scene.name }}</option>
    </select>
    <v-overlay v-if="showList" absolute class="scene-table" @>
      <div class="scene-table inner">
        <div class="scene-table-header">
          <v-btn color="red" @click="showList = false">Close</v-btn>
        </div>
        <div class="scene-table-list">
          <div class="scene-table-list-header">
            <div>Name</div>
            <div>Tempo</div>
          </div>
          <div class="scene-table-list-scenes">
            <div
              v-for="scene in scenes"
              :key="scene.index"
              class="scene-table-list-scene"
              @click="onSongSelectionChange(scene.index)"
            >
              <div>{{ getSceneName(scene.name) }}</div>
              <div>{{ getSceneTempo(scene.name) }}</div>
            </div>
          </div>
        </div>
      </div>
    </v-overlay>
  </div>
</template>

<script>
export default {
  name: 'SongSelect',

  props: {
    value: { type: Number },
    scenes: { type: Array, required: true, default: () => { return [] } }
  },

  data () {
    return {
      sceneSelected: 0,
      headers: [
        { text: 'Name', value: 'name' }
      ],
      search: '',
      showList: false
    }
  },

  methods: {
    onSongSelectionChange (index) {
      this.showList = false
      this.$emit('input', index)
    },

    getSceneName (name) {
      const regex = /(\w*)\s\-/gm
      const m = regex.exec(name)
      return m !== null ? m[0].substring(0, m[0].indexOf(' -')) : name
    },

    getSceneTempo (name) {
      const regex = /(\d*bpm)/gm
      const m = regex.exec(name)
      return m !== null ? m[0] : ''
    }
  }
}
</script>

<style lang="scss">
.scene-table {
  width: 100%;
  height: 99%;
  display: flex;
  flex-direction: column;
  background-color: rgba(0, 0, 0, 0.7);
  z-index: 9999;

  &.inner {
    padding: 1.5rem;
  }

  .scene-table-header {
    text-align: right;
  }

  .scene-table-list {
    font-size: 2rem;

    .scene-table-list-header {
      border-bottom: 1px solid white;
      font-size: 1.25rem;
      display: flex;

      & > div {
        flex-grow: 1;
      }
    }

    .scene-table-list-scenes {
      max-height: 80vh;
      overflow-y: auto;

      .scene-table-list-scene  {
        cursor: pointer;
        padding: 1rem 0rem;
        display: flex;

        & > div {
          flex-grow: 1;
        }

        &:hover {
          background-color: rgba(255, 255, 255, 0.25);
          padding-left: 1rem;
        }
      }
    }
  }

  .v-overlay__content {
    height: 100%;
    width: 100%;
  }
}

.scene_selection {
  flex-grow: 1;
  display: flex;
  background-color: unset;
  color: white;
  font-size: 1em;
  padding: 0.5em;
  outline: none !important;
  border: none !important;

  option {
    display: none;
  }

  .v-overlay__content {
    height: 100%;
    width: 100%;
  }

  &:focus {
    outline: none !important;
    border: none !important;
  }
}
</style>
