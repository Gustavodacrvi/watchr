<template>
  <div>
    <h3>Additions</h3>

    <br>
    <h4>Lists in folders</h4>
    <br>

    <li>Now folder lists will be shown on the folder view.</li>
    <li>Now it's possible to complete entire lists, only uncompleted lists will be shown on sidebar.</li>

    <br>
    <h4>More keyboard shortcuts</h4>
    <br>

    <br>
    <h5>Edit items</h5>
    <br>

    <div class="line">
      <span>Add high priority to selection</span>
      <span class="tag">Shift + ! + p</span>
    </div>
    <div class="line">
      <span>Add medium priority to selection</span>
      <span class="tag">Shift + ! + m</span>
    </div>
    <div class="line">
      <span>Add low priority to selection</span>
      <span class="tag">Shift + ! + l</span>
    </div>
    <div class="line">
      <span>Remove priority of selection</span>
      <span class="tag">Shift + ! + n</span>
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
