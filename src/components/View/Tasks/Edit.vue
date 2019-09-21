<template>
  <div class="Edit">
    <div class="tags">
      <Tag v-if="priority"
        icon="priority"
        :color="getPriorityColor"
        :value="priority"
        @click="priority = ''"
      />
    </div>
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
          :allowSearch="true"
          :options="getTags"
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
import TagVue from '../Tag.vue'

export default {
  components: {
    InputApp: InputVue,
    ButtonApp: ButtonVue,
    IconDrop: IconDropVue,
    Tag: TagVue,
  },
  props: ['placeholder'],
  data() {
    return {
      name: '',
      priority: '',
      tags: [
        {
          id: '1',
          name: 'Freaking tag',
        },
        {
          id: '2',
          name: 'Another tag',
        },
        {
          id: '3',
          name: 'The ultimate tag',
        },
        {
          id: '4',
          name: 'The last one'
        }
      ]
    }
  },
  computed: {
    priorityOptions() {
      const links = this.$store.getters['task/priorityOptions']
      for (const l of links) {
        l.callback = ({name}) => {
          if (name !== 'No priority')
            this.priority = name
          else this.priority = ''
        }
      }
      return links
    },
    getPriorityColor() {
      const obj = {
        "High priority": "var(--red)",
        "Medium priority": "var(--orange)",
        "Low priority": "var(--primary)",
      }
      return obj[this.priority]
    },
    getTags() {
      const arr = []
      for (const el of this.tags) {
        arr.push({
          name: el.name,
          icon: 'tag',
        })
      }
      return arr
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

.tags {
  padding-bottom: 4px;
  display: flex;
}

</style>
