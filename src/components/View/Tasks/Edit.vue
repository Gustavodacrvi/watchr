<template>
  <div class="Edit">
    <div class="tags">
      <Tag v-if="calendarStr"
        icon="calendar"
        color="var(--green)"
        :value="calendarStr"
        @click="calendar = null"
      />
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

import utils from '@/utils/'

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
      calendar: null,
      tags: [],
      optionsType: '',
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
      this.calendar = date
    }
  },
  computed: {
    ...mapState({
      savedTags: state => state.tag.tags,
      savedLists: state => state.list.lists,
    }),
    calendarStr() {
      if (this.calendar)
        return utils.parseCalendarObjectToString(this.calendar)
      return null
    },
    priorities() {
      return this.$store.getters['task/priorityOptions']
    },
    priorityOptions() {
      const links = this.priorities
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
  watch: {
    name() {
      const n = this.name
      let changedOptions = false
      const parsePriority = () => {
        const pri = (priority) => {
          const obj = {
            'Low priority': ' !l',
            'Medium priority': ' !m',
            'High priority': ' !h',
          }
          this.priority = priority
          this.name = n.replace(obj[priority], '')
        }
        if (n.includes(' !l')) pri('Low priority')
        else if (n.includes(' !m')) pri('Medium priority')
        else if (n.includes(' !h')) pri('High priority')
        else if (n.includes(' !no')) {
          this.priority = null
          this.name = n.replace(' !no', '')
        }
      }
      const parseTags = () => {
        const tags = this.savedTags
        for (const tag of tags) {
          const tagName = ` #${tag.name}`
          if (n.includes(tagName)) {
            this.name = n.replace(tagName, '')
            this.tags.push(tag.name)
            break
          }
        }
        const arr = n.split(' ')
        const lastWord = arr[arr.length - 1]
        if (lastWord[0] === '#') {
          this.optionsType = '#'
          const word = lastWord.substr(1)

          this.options = tags.map(el => el.name).filter(el => el.includes(word))
          changedOptions = true
        }
      }
      const parseLists = () => {
        const lists = this.savedLists
        for (const li of lists) {
          const listName = ` #${li.name}`
          if (n.includes(listName)) {
            this.name = n.replace(listName, '')
            this.lists.push(li.name)
            break
          }
        }
        const arr = n.split(' ')
        const lastWord = arr[arr.length - 1]
        if (lastWord[0] === '@') {
          this.optionsType = '@'
          const word = lastWord.substr(1)

          this.options = lists.map(el => el.name).filter(el => el.includes(word))
          changedOptions = true
        }
      }
      const parseDate = () => {
        if (n.includes(' $')) {
          const obj = utils.parseInputToCalendarObject(n)
        }
      }

      parsePriority()
      parseTags()
      parseLists()
      parseDate()

      if (!changedOptions) this.options = []
    }
  }
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
