<template>
  <div class="Shortcuts popup cb shadow rb scroll-thin" :class="platform">
    <div class="tac title">
      <h2 class="pc">Shortcuts</h2>
    </div>
    <div class="content">
      <h3 class="pc">Select</h3>
      <div class="line">
        <span>Move selection up</span>
        <span class="tag">Up Arrow</span>
      </div>
      <div class="line">
        <span>Move selection down</span>
        <span class="tag">Down Arrow</span>
      </div>
      <div class="line">
        <span>Select item</span>
        <span class="tag">Control + Enter</span>
      </div>
      <div class="line">
        <span>Select all view items</span>
        <span class="tag">Control + A</span>
      </div>
      <div class="line">
        <span>Move selection to top</span>
        <span class="tag">Shift + Up Arrow</span>
      </div>
      <div class="line">
        <span>Move selection to bottom</span>
        <span class="tag">Shift + Down Arrow</span>
      </div>
      <div class="line">
        <span>Extend selection to bottom</span>
        <span class="tag">Control + Down Arrow</span>
      </div>
      <div class="line">
        <span>Extend selection to top</span>
        <span class="tag">Control + Up Arrow</span>
      </div>
      
      <h3 class="pc">Add items</h3>
      <div class="line">
        <span>New item at the bottom</span>
        <span class="tag">A</span>
      </div>
      <div class="line">
        <span>New item at the top</span>
        <span class="tag">Shift + A</span>
      </div>
      <div class="line">
        <span>New item after selection</span>
        <span class="tag">Space</span>
      </div>
      <div class="line">
        <span>New item before selection</span>
        <span class="tag">Shift + Space</span>
      </div>
      <div class="line">
        <span>New heading after selection</span>
        <span class="tag">Control + Space</span>
      </div>
      <div class="line">
        <span>New heading before selection</span>
        <span class="tag">Shift + Control + Space</span>
      </div>
      <div class="line">
        <span>Add checklist to item</span>
        <span class="tag">Shift + C</span>
      </div>
      <div class="line">
        <span>Open task quick add</span>
        <span class="tag">Q</span>
      </div>
      <div class="line">
        <span>Open list quick add</span>
        <span class="tag">L</span>
      </div>
      <div class="line">
        <span>Open folder quick add</span>
        <span class="tag">F</span>
      </div>
      <div class="line">
        <span>Open tag quick add</span>
        <span class="tag">F</span>
      </div>

      <h3 class="pc">Edit items</h3>

      <div class="line">
        <span>Duplicate item</span>
        <span class="tag">Shift + D</span>
      </div>
      <div class="line">
        <span>Delete selection</span>
        <span class="tag">Delete</span>
      </div>
      <div class="line">
        <span>Add tags to selection</span>
        <span class="tag">Alt + T</span>
      </div>
      <div class="line">
        <span>Complete selected</span>
        <span class="tag">Alt + .</span>
      </div>
      <div class="line">
        <span>Cancel selected</span>
        <span class="tag">Alt + ,</span>
      </div>
      <div class="line">
        <span>Move to Someday</span>
        <span class="tag">Shift + S</span>
      </div>
      <div class="line">
        <span>Move to Today</span>
        <span class="tag">Shift + T</span>
      </div>
      <div class="line">
        <span>Close task editor</span>
        <span class="tag">Esc</span>
      </div>

      <h3 class="pc">Move items</h3>
      <div class="line">
        <span>Move to list</span>
        <span class="tag">Alt + L</span>
      </div>
      <div class="line">
        <span>Move to folder</span>
        <span class="tag">Alt + F</span>
      </div>
      <div class="line">
        <span>Use calendar on selection</span>
        <span class="tag">Alt + S</span>
      </div>
      <div class="line">
        <span>Copy task</span>
        <span class="tag">Control + C</span>
      </div>
      <div class="line">
        <span>Paste task</span>
        <span class="tag">Control + V</span>
      </div>

      <h3 class="pc">View</h3>
      <div class="line">
        <span>Hide/show completed items view</span>
        <span class="tag">Alt + C</span>
      </div>
      <div class="line">
        <span>Hide/show someday items</span>
        <span class="tag">Alt + O</span>
      </div>
      <div class="line">
        <span>Hide/show scheduler</span>
        <span class="tag">Control + Alt + S</span>
      </div>
      <div class="line">
        <span>Hide/show sidebar</span>
        <span class="tag">/</span>
      </div>
    </div>
  </div>
</template>

<script>

import { mapGetters } from 'vuex'

export default {
  computed: {
    ...mapGetters(['platform']),
  },
}

</script>

<style scoped src="@/assets/css/popupAuth.css">
</style>

<style scoped>

.Shortcuts {
  flex-basis: 1000px;
}

.line {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
}

.tag {
  display: inline-block;
  border-radius: 8px;
  background-color: var(--dark);
  padding: 6px;
  font-size: .8em;
}

h3 {
  margin: 24px 0;
}

.popup {
  max-height: 650px;
  overflow: auto;
}

</style>
