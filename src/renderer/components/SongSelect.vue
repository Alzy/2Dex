<template>
  <div>
    <select :value="value" class="scene_selection" @click.prevent="showList = true">
      <option selected value="0">Jump to: </option>
      <option v-for="scene in scenes" :key="scene.index" :value="scene.index">{{ scene.name }}</option>
    </select>
    <v-overlay absolute v-if="showList" class="scene-table" @>
      <div class="scene-table inner">
        <div class="scene-table-header">
          <v-btn @click="showList = false" color="red">Close</v-btn>
        </div>
        <div class="scene-table-list">
          <div class="scene-table-list-header">
            <div>Name</div>
          </div>
          <div class="scene-table-list-scenes">
            <div
              v-for="scene in scenes"
              :key="scene.index"
              class="scene-table-list-scene"
              @click="onSongSelectionChange(scene.index)"
            >
              <div>{{scene.name}}</div>
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

  data () {
    return {
      sceneSelected: 0,
      headers: [
        {text: 'Name', value: 'name'}
      ],
      search: '',
      showList: false,
    }
  },

  methods: {
    onSongSelectionChange (index) {
      this.showList = false
      this.$emit('input', index)
    }
  },

  props: {
    value: { type: Number },
    scenes: { type: Array, required: true, default: () => {return []} }
  }
}
</script>

<style lang="scss">
.scene-table {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: rgba(0, 0, 0, 0.85);

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
    }

    .scene-table-list-scenes {
      max-height: 80vh;
      overflow-y: auto;

      .scene-table-list-scene  {
        cursor: pointer;
        padding: 1rem 0rem;

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

  option {
    display: none;
  }

  .v-overlay__content {
    height: 100%;
    width: 100%;
  }
}
</style>
