<template>
  <div>
    <div class="date-wrapper">
      Dec 15th, 2019
    </div>
    
    <h4>Auto scheduler</h4>
    <br>
    <span>Tasks now can have a duration property, 5 minutes, 45 minutes, etc..., which then can be used for auto-scheduling.

      Every view now has an auto-scheduler option, the auto-schedule creates a timeline of the day containing the beginning and then end of each task based on its duration.
    <br>
    <br>

      <li>Start time</li>
      <li>Buffer time</li>
      <li>Fallback time</li>
    <br>
      
      <strong>Start time:</strong> the beginning of the entire timeline.
    <br>
    <br>

      <strong>Buffer time:</strong> time to be added between tasks, it should be used for short breaks or minor delays.
    <br>
    <br>

      <strong>Fallback time:</strong> time to be used instead for tasks that don't contain the duration property.
    </span>
  </div>
</template>

<style scoped src='@/assets/css/updates.css'></style>
