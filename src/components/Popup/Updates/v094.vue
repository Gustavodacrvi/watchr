<template>
  <div>
    <div class="date-wrapper">
      February 18th, 2020
    </div>
    
    <h3>Changes</h3>
    <br>

    <br>
    <li>Slim mode navigation dropdown.</li>
    <br>
    <li>Manually log completed tasks.</li>
    <br>
    <li>Better Upcoming smart view, show tasks and events in the next 7 days, this month, the next months and the next years.</li>
    <br>
    <li>Better Logbook smart view, show logged tasks in the last 7 days, this month, the last months and the in the last years.</li>
    <br>
    <li>New headings adder UI.</li>
    <br>
    <li>Reset subtasks on periodic tasks reset.</li>
    <br>
    <li>Complete task adder keyboard navigation.</li>
    <br>

    <h3>New Keyboard shortcuts</h3>
    <br>

    <div class="line">
      <span>Add "High priority" to selection</span>
      <span class="tag">Alt + H</span>
    </div>
    <div class="line">
      <span>Add "Medium priority" to selection</span>
      <span class="tag">Alt + M</span>
    </div>
    <div class="line">
      <span>Add "Low priority" to selection</span>
      <span class="tag">Alt + L</span>
    </div>
    <div class="line">
      <span>Remove priority from selection</span>
      <span class="tag">Alt + N</span>
    </div>
    <br>
    <div class="line">
      <span>Add selection to logbook</span>
      <span class="tag">Alt + Shift + L</span>
    </div>
    <div class="line">
      <span>Add selection to group</span>
      <span class="tag">Alt + L</span>
    </div>
    <div class="line">
      <span>Add deadline to selection</span>
      <span class="tag">Alt + D</span>
    </div>
    <div class="line">
      <span>Assign user to selection</span>
      <span class="tag">Alt + A</span>
    </div>

    <br>
    <h3>Bug fixes</h3>
    <br>

    <li>Prevent duplicate list names</li>
    <br>


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

<style scoped src='@/assets/css/updates.css'></style>
