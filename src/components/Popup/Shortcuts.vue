<template>
  <div class="Signin popup cb shadow rb scroll-thin" :class="platform">
    <div class="tac title">
      <h2 class="pc">Shortcuts</h2>
    </div>
    <div class="content">
      <h3>Select</h3>
      <div class="line">
        <span>Move selection up</span>
        <span class="tag">Up Arrow</span>
      </div>
      <div class="line">
        <span>Move selection down</span>
        <span class="tag">Down Arrow</span>
      </div>
      <div class="line">
        <span>Select task</span>
        <span class="tag">Control + Enter</span>
      </div>
      <div class="line">
        <span>Select all view tasks</span>
        <span class="tag">Control + A</span>
      </div>
      <div class="line">
        <span>Move selection to top</span>
        <span class="tag">Control + Up Arrow</span>
      </div>
      <div class="line">
        <span>Move selection to bottom</span>
        <span class="tag">Control + Down Arrow</span>
      </div>
      <div class="line">
        <span>Extend selection to bottom</span>
        <span class="tag">Shift + Control + Down Arrow</span>
      </div>
      <div class="line">
        <span>Extend selection to top</span>
        <span class="tag">Shift + Control + Up Arrow</span>
      </div>
      
      <h3 class="pc">Add items</h3>
      <div class="line">
        <span>New task at the bottom</span>
        <span class="tag">A</span>
      </div>
      <div class="line">
        <span>New task at the top</span>
        <span class="tag">Shift + A</span>
      </div>
      <div class="line">
        <span>New task after selection</span>
        <span class="tag">Space</span>
      </div>
      <div class="line">
        <span>Add checklist to task</span>
        <span class="tag">Shift + C</span>
      </div>

      <h3 class="pc">Edit items</h3>

      <div class="line">
        <span>Duplicate task</span>
        <span class="tag">Shift + D</span>
      </div>
      <div class="line">
        <span>Complete selected</span>
        <span class="tag">Shift + .</span>
      </div>
      <div class="line">
        <span>Move to Someday</span>
        <span class="tag">Shift + S</span>
      </div>
      <div class="line">
        <span>Move to Today</span>
        <span class="tag">Shift + T</span>
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

</style>
