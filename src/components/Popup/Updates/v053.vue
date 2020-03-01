<template>
  <div>
    <div class="date-wrapper">
      Dec 7th, 2019
    </div>
    
    <h4>Changes</h4>
      <li>You can now filter by folders too, instead of only tags and lists.</li>
      <li>Exclusive tag, list, folder selection: <br><br>
      
      For example, let's say you have 3 tasks, and one of them has the "5min" tag, by toggling the tag selection and clicking on the "5min" filter tag once, the only task that will be rendered on the view will be the task with the "5min" tag. <br><br>However, by clicking on "5min" filter tag again, all the tasks, <strong><i>except</i></strong> the task with the "5min" will be shown, that is, the filter tag is now exclusive.
      </li>
      <li>Uncomplete or delete tasks menu options for Completed smart view.</li>
    <h4>Bug Fixes</h4>
    <ul>
      <li>Fixed tag selection not working inside headings.</li>
    </ul>
  </div>
</template>

<style scoped src='@/assets/css/updates.css'></style>
