<template>
  <div class="Edit">
    <InputApp
      v-model="name"
      :focus="true"
      :placeholder="placeholder"
    />
    <div class="options">
      <div class="button">
        <ButtonApp value="Add task"/>
      </div>
      <div class="icons">
        <IconDrop
          handle="tag"
          handleWidth="25px"
        />
        <IconDrop
          handle="priority"
          handleWidth="25px"
          :options="priorityOptions"
        />
        <IconDrop
          handle="tasks"
          handleWidth="32px"
        />
        <IconDrop
          handle="calendar"
          handleWidth="23px"
        />
      </div>
    </div>
  </div>
</template>

<script>

import InputVue from '../../Auth/Input.vue'
import ButtonVue from '../../Auth/Button.vue'
import IconDropVue from '../../IconDrop.vue'

export default {
  components: {
    InputApp: InputVue,
    ButtonApp: ButtonVue,
    IconDrop: IconDropVue,
  },
  props: ['placeholder'],
  data() {
    return {
      name: '',
      priority: '',
    }
  },
  computed: {
    priorityOptions() {
      const links = this.$store.getters['task/priorityOptions']
      for (const l of links) {
        l.callback = ({name}) => {
          this.priority = name
        }
      }
      return links
    }
  },
}

</script>

<style>

.button {
  width: 100px;
}

.options {
  margin-top: 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.icons {
  display: inline-flex;
  flex-direction: row-reverse;
}

</style>
