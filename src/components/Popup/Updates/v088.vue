<template>
  <div>
    <div class="date-wrapper">
      Jan 27th, 2020
    </div>
    
    <h3>Text Formatting in task names and list/headings notes</h3>
    <br>

    <li>Available text formatting:

      <ul style="margin-left: 2em">
      <br>
        <li><b>Bold:</b> __This will be bold__ </li>
      <br>
        <li><i>Italic:</i> *This will be italic* </li>
      <br>
        <li><a class="parsed-link" href="https://goggle.com" target='_blank'>Hyperlink: </a> [https://goggle.com this will be a hyperlink] </li>
      <br>
        <li><span style="color: yellow">Colors:</span> {yellow this will be yellow}, hexadecimal, RGB, HSL will work too. </li>
      <br>
      </ul>
      
    </li>

    <h3>Natural Language Input</h3>

      <br>
    <li>You can type natural language terms to easily add dates, the available keywords are:
      <br>
      <ul style="margin-left: 2em">

      <br>
        <li>today: Today(tod also works).</li>
      <br>
        <li>tomorrow: Tomorrow(tom also works).</li>
      <br>
        <li>next week: Sets the date to the next monday.</li>
      <br>
        <li>next month: Sets the date to the beginning of the next month.</li>
      <br>
        <li>next year: Sets the date to the beginning of the next year.</li>
      <br>
        <li>8pm: Today at 8pm (unless 6pm has passed, in which case tomorrow).</li>
      <br>
        <li>in 4 days: 4 days from today.</li>
      <br>
        <li>in 5 hours: 5 hours from now.</li>
      <br>
        <li>in 2 weeks: 2 weeks from now.</li>
      <br>
        <li>in 6 months: 6 months from now.</li>
      <br>
        <li>in 2 years: 6 years from now.</li>
      <br>
        <li>28th: 28th day of the current month</li>
      <br>
        <li>14th jan: 14th day of the next january.</li>
      <br>
        <li>4th dec 2022: 4th day of december of on the year 2020.</li>
      <br>
        <li>monday: Sets the date to the next monday(mon also works).</li>
      <br>
        <li>no date: Removes the date.</li>
      </ul>
      <br>

      
    </li>


  </div>
</template>

<style scoped src='@/assets/css/updates.css'></style>
