<template>
  <div class="Update popup cb shadow rb scroll-thin" :class="platform">
    <div class="title tac">
      <h2 class="pc">{{ l['New update!'] }}</h2>
    </div>
    <div class="content">
      <h3>Features for Desktop and Mobile</h3>
      <h2>General</h2>
      <ul>
        <li>Sign in with google.</li>
        <li>Sign in as a guest.</li>
        <li>Upgrade guest user with google.</li>
        <li>Upgrade guest user with email and password.</li>
      </ul>
      <h2>Date</h2>
      <ul>
        <li>You can now set the number of times a task should be checked before being considered completed. <br><br>
          Ex: "example task $10 times", will require a check 10 times.<br><br>
        </li>
        <li>The same works for periodic/weekly tasks:<br><br>
          Ex: "Work out for 30min $every 2 days 10 times".<br><br>
        </li>
        <li>Period/weekly tasks by default are expected to be completed once a day, that means, once you check the "Work out" task, it will disappear from the Today list, however, sometimes you may want to be able to complete task in advance in the same day, in those cases, you can use the "persistent" or "per" keyword. <br><br>

          Ex: "Read 10 pages of 'O Cortiço' $every day 7 times persistent", the task won't disapper from the Today list until it reaches zero.
        
        </li>
      </ul>
      <Button @click="close" value="Got it! Refresh"/>
    </div>
  </div>
</template>

<script>

import { mapState, mapGetters } from 'vuex'

import ButtonVue from '../Auth/Button.vue'

export default {
  components: {
    Button: ButtonVue,
  },
  methods: {
    close() {
      window.location.reload()
    },
  },
  computed: {
    ...mapState(['lang']),
    ...mapGetters(['l', 'platform']),
  }
}

</script>

<style scoped src="@/assets/css/popupAuth.css">
</style>

<style scoped>

.Update.desktop {
  max-height: 350px;
}

.Update {
  overflow: auto;
}

h1, h2, h3, h4, h5, h6 {
  color: var(--primary);
}

</style>
