<template>
  <div class="update">
    <div class="date-wrapper">
      March 16th, 2020
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

    <br>
    <h4>Specific keywords</h4>
    <br>
    <p>New specific keywords:</p>
    <ul style="margin-left: 35px">
      <br>
        <li>"Every day" is equivalent to "Every 1 days".</li>
      <br>
        <li>"Every Sat, Mon, Thu" is equivalent to "Every 1 weeks on Sat, Mon, Thu".</li>
      <br>
        <li>07/12/2020: Sets the date to December 7th, 2020, MM/DD/YYYY, YYYY/MM/DD, DD-MM-YYYY, DD.MM.YYYY also work.</li>
      <br>
        <li>End of week: Sets the date to Saturday.</li>
      <br>
        <li>End of month: Sets the date to the last day of the current month.</li>
      <br>
        <li>End of year: Sets the date to the last day of the current year.</li>
    </ul>
    <br>
    <br>
    
    <h3><Icon icon='calendar' class='heading-icon' color='var(--green)'/>New Calendar Picker</h3>
    <br>
    <p>Calendar Picker and drop downs redesigned.</p>
    <br>

    <h3>New Floating Button Behavior</h3>
    <br>
    <p>By tapping on the floating button, instead of opening the quick add, an animation will occur and the task adder will be opened at the end of the list.</p>
    <br>
    <p>Drag it to the Inbox area for quick add.</p>
    
    <br>
    <h3><Icon icon='layer-group' class='heading-icon' color='var(--olive)'/>New Anytime and Inbox</h3>
    <br>

    <p>Any task that does not have date(Anytime, Someday, Specific date, Recurring) will be shown on the Inbox.</p>
    <br>

    <h3><Icon icon='star' class='heading-icon' color='var(--red)'/>Enable Overdue Profile Option</h3>
    <br>
    <p>Specific tasks by default won't go to Overdue if not completed on the specific date, it will be shown on the Tomorrow smart view instead, deadlines and recurring dates will still go to Overdue.</p>
    <br>
    <h3><Icon icon='tag' class='heading-icon' color='var(--red)'/>Logged Tasks Heading on Tag Views</h3>
    <br>
    <p>Logged tasks will be shown on the Tag view inside its heading.</p>

    <br>
    <h3><Icon icon='logbook' class='heading-icon' color='var(--dark-blue)'/>Landing Page</h3>
    <br>
    <p>Started to work on the Landing page, new illustration.</p>


    <br>
  </div>
</template>

<style scoped>


</style>

<style scoped src='@/assets/css/updates.css'></style>
