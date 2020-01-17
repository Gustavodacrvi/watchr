<template>
  <div>
    <h3>Additions</h3>
    <br>

    <li><strong>Add multiple tasks from txt file:</strong> Add multiple tasks by copying and pasting them on the task name from a text file, each line will be a task, you can add priorities to them using !h, !m, !l.</li>
    <br>
    <li><strong>Add task duration using keyboard:</strong> Select some tasks, then type its duration in the format: "hours:minutes/hh:mm", then press "Shift + D", the typing needs to occur before 3 seconds, if no hours are given, the number will be treated as seconds, examples:<br>
      <br>
      Typing "45" then "Shift + D" will set 45 minutes to each selected task. <br>
      Typing "1:10" then "Shift + D" will set 1 hour and 45 minutes to each selected task. <br>
    </li>

    <br>
    <h4>More keyboard shortcuts</h4>
    <br>

    <br>
    <h5>Add items</h5>
    <br>

    <div class="line">
      <span>New task before selection</span>
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

    <br>
    <h4>Bug fixes</h4>
    <br>

    <li>Fixed add task with floating button not working properly on Today, Tomorrow and Calendar smart views.</li>
    <li>Fixed drag and drop between headings not working properly on Today, Tomorrow and Calendar smart views.</li>

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
  border-radius: 8px;
  background-color: var(--dark);
  padding: 6px;
  font-size: .8em;
}

</style>
