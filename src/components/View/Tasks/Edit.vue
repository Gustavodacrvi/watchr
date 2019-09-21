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
    <div class="tags">
      <Tag v-for="t in tags"
        :key="t"
        icon="tag"
        :value="t"
        @click="removeTag(t)"
      />
    </div>
    <DropInput
      v-model="name"
      :focus="true"
      :options="['I am the option 1', 'You are the option 2', 'You are breath taking', 'No, no, you are breath taking', 'Mr Keano enters the chat',
      'asdf', 'asçlkdjfaçsjdf', 'jkfdaçslkfjaç  '
      ]"
      :placeholder="placeholder"
      @select="select"
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

import ButtonVue from '../../Auth/Button.vue'
import IconDropVue from '../../IconDrop.vue'
import TagVue from '../Tag.vue'
import DropInputVue from '../../Auth/DropInput.vue'

export default {
  components: {
    DropInput: DropInputVue,
    ButtonApp: ButtonVue,
    IconDrop: IconDropVue,
    Tag: TagVue,
  },
  props: ['placeholder'],
  data() {
    return {
      name: '',
      priority: '',
      tags: [],
      tagss: [
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
  methods: {
    removeTag(name) {
      const index = this.tags.findIndex(el => el === name)
      this.tags.splice(index, 1)
    },
    select(value) {
      this.name = value
    },
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
      for (const el of this.tagss) {
        arr.push({
          name: el.name,
          icon: 'tag',
          callback: () => {
            this.tags.push(el.name)
          },
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
