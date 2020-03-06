<template>
  <div class="update">
    <div class="date-wrapper">
      March 1st, 2020
    </div>
    
    <h3><Icon icon='repeat' class='heading-icon' color='var(--green)'/>Advanced Smart Date Input</h3>
    <br>

    <p>Set recurring dates using smart keyboard input.</p>
    <br>
    
    <p><strong class="green">Every X days and every X days after:</strong> Will result in a "daily" recurring date where X is the period, type in "after" for "after completion" dates.</p>
    <br>
    <p><strong class="green">Every X weeks on Mon, Fri:</strong> Will result in a "weekly" recurring date which repeats only on Mondays and Fridays after X weeks, the weekdays are separated by commas.</p>
    <br>
    <p><strong class="green">Every X months on the (last|[1-7]) (day|WEEKDAY):</strong> Monthly recurring dates, the (last|[1-7]) means it can only be the last day/weekday or an ordinal number from 1 to 7, the final (day|WEEKDAY) means it's a month day or a weekday, Monday, Saturday..., examples:</p>
    <br>

    <ul class="list">
      <li>Every 2 months on the 3rd Monday.</li>
      <li>Every 3 months on the 7th day.</li>
      <li>Every 1 months on the 2nd Sunday.</li>
      <li>Every 4 months on the last day.</li>
      <li>Every 3 months on the last Wednesday.</li>
    </ul>

    <br>
    <p><strong class="green">Every X years on Dec, Jan on the (last|[1-7]) (day|WEEKDAY):</strong> Yearly recurring dates, the acceptable months are separated by commas preceded by the previous weekly input format.</p>
    <br>

    <h4>Recurring options</h4>
    <br>
    <p>You can also set due(end dates) and defer(begin dates) using the keyboard in any of the recurring dates, just type in the option keyword preceded by the specific date keyword, specific keywords defines specific dates, next week, in 4 days, in 2 weeks, 23th, Jul 2nd 2021 and tomorrow are examples of specific keywords. examples:</p>
    <br>

    <ul class="list">
      <li>Every 3 days after begins next month ends next year.</li>
      <li>Every 6 days due in 3 months defer in 7 days.</li>
      <li>Every 1 days ends next month due tomorrow.</li>
    </ul>

    <br>
    <h4>Completion times</h4>
    <br>
    <p>Use the "X times" keyword to set the number of times a recurring task should be completed instead of setting a due date.</p>
    

  </div>
</template>

<style scoped>


</style>

<style scoped src='@/assets/css/updates.css'></style>
