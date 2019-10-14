<template>
  <div class="Update popup cb shadow rb scroll-thin" :class="platform">
    <div class="title tac">
      <h2 class="pc">{{ l['New update!'] }}</h2>
    </div>
    <div class="content">
      <h3>Bug fixes</h3>
      <ul>
        <li>Add task with shortcuts not working properly.</li>
      </ul>
      <h3>Features</h3>
      <h4>Desktop and Mobile</h4>
      <ul>
        <li>Convert heading to list option.</li>
        <li>Add list/tag notes and edit them directly by clicking on the them.</li>
        <li>Duplicate heading and its tasks option.</li>
        <li>Duplicate list with its tasks and headings.</li>
      </ul>
      <h4>Desktop</h4>
      <ul>
        <li>Edit list name and tag name directly by clicking on the header text.</li>
        <li>Add heading at the end of the list with the key 'h' and at the beginning with the key 'H'.</li>
        <li>Close task/heading adder with the key 'Esc'.</li>
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
