<template>
  <div>
    <h3>Additions</h3>
    <br>

    <li>Manually change auto schedule's time</li>

    <br>
    <h4>More keyboard shortcuts</h4>
    <br>

    <h5>Add items</h5>
    <br>

    <div class="line">
      <span>Add tags to selection</span>
      <span class="tag">Alt + T</span>
    </div>
    <br>

    <h5>Move items</h5>
    <br>

    <div class="line">
      <span>Move selection up</span>
      <span class="tag">Alt + Arrow Up</span>
    </div>
    <div class="line">
      <span>Move selection down</span>
      <span class="tag">Alt + Arrow Down</span>
    </div>
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
    <br>

    <h5>View</h5>
    <br>
    <div class="line">
      <span>Toggle completed tasks</span>
      <span class="tag">Alt + C</span>
    </div>
    <div class="line">
      <span>Toggle someday tasks</span>
      <span class="tag">Alt + O</span>
    </div>
    <div class="line">
      <span>Toggle scheduler</span>
      <span class="tag">Control + Alt + S</span>
    </div>

  </div>
</template>

<style scoped>

.line {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
}

.tag {
  display: inline-block;
  border-radius: 6px;
  background-color: var(--dark);
  padding: 6px;
  font-size: .8em;
}

</style>
