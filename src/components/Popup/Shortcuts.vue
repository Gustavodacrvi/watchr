<template>
  <div class="Shortcuts popup cb shadow rb scroll-thin" :class="layout">
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
        <span>Open tag quick add</span>
        <span class="tag">T</span>
      </div>

      <h3 class="pc">Edit items</h3>
      <div class="line">
        <span>Select task priority</span>
        <span class="tag">Alt + P</span>
      </div>
      <div class="line">
        <span>Add selection to logbook</span>
        <span class="tag">Alt + Shift + L</span>
      </div>
      <div class="line">
        <span>Assign user to selection</span>
        <span class="tag">Alt + A</span>
      </div>
      <div class="line">
        <span>Add deadline to selection</span>
        <span class="tag">Alt + D</span>
      </div>
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
        <span class="tag">.</span>
      </div>
      <div class="line">
        <span>Cancel selected</span>
        <span class="tag">,</span>
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
        <span>Move selection to list/group/folder</span>
        <span class="tag">Alt + M</span>
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
        <span>Go to selected list</span>
        <span class="tag">Shift + ArrowRight</span>
      </div>
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
    ...mapGetters(['layout']),
  },
}

</script>

<style scoped src="@/assets/css/popupAuth.css">
</style>

<style scoped>

.Shortcuts {
  flex-basis: 600px;
}

.line {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
}

.tag {
  display: inline-block;
  border-radius: 4px;
  background-color: var(--dark);
  padding: 6px;
}

h3 {
  margin: 24px 0;
}

.popup {
  max-height: 650px;
  overflow: auto;
}

</style>
