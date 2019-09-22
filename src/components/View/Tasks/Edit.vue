<template>
  <div class="Edit">
    <div class="tags">
      <Tag v-if="priority"
        icon="priority"
        :color="getPriorityColor"
        :value="priority"
        @click="priority = ''"
      />
      <Tag v-if="list"
        icon="tasks"
        :value="list"
        @click="list = ''"
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
      :options="options"
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
          :allowSearch="true"
          :options="listOptions"
        />
        <IconDrop
          handle="calendar"
          handleWidth="23px"
          :calendar="true"
          @select="selectDate"
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
import { mapState } from 'vuex'

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
      list: '',
      tags: [],
      options: [],
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
    selectDate(date) {
      console.log(date)
    }
  },
  computed: {
    ...mapState({
      savedTags: state => state.tag.tags,
      savedLists: state => state.list.lists,
    }),
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
      for (const el of this.savedTags) {
        arr.push({
          name: el.name,
          icon: 'tag',
          callback: () => {
            if (!this.tags.find(e => e === el.name))
              this.tags.push(el.name)
          },
        })
      }
      return arr
    },
    listOptions() {
      const arr = []
      for (const el of this.savedLists) {
        arr.push({
          name: el.name,
          icon: 'tasks',
          callback: () => {
            this.list = el.name
          }
        })
      }
      return arr
    },
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
