<template>
  <div class="Edit handle">
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
        :value="l[priority]"
        @click="priority = ''"
      />
      <Tag v-if="list"
        icon="tasks"
        :value="list"
        color='var(--purple)'
        @click="list = ''"
      />
      <Tag v-if="list && heading"
        icon="heading"
        :value="heading"
        color='var(--purple)'
        @click="heading = ''"
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
      @enter='save'
      @cancel="$emit('cancel')"
      @goup='$emit("goup")'
      @godown='$emit("godown")'
    />
    <div class="options">
      <div class="button-wrapper">
        <div class="button">
          <ButtonApp :value="buttonText" @click="save"/>
        </div>
        <span v-if="showCancel" class="cancel cursor" @click="$emit('cancel')">{{ l['Cancel'] }}</span>
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
          :options="priorityOptions"
        />
        <IconDrop
          handle="tasks"
          handleWidth="25px"
          :allowSearch="true"
          :options="listOptions"
        />
        <IconDrop
          handle="calendar"
          handleWidth="23px"
          :calendar="true"
          :calendarCall='selectDate'
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

import { mapState, mapGetters } from 'vuex'

import utils from '@/utils/'

export default {
  props: ['placeholder', 'task', 'showCancel', 'btnText'],
  components: {
    DropInput: DropInputVue,
    ButtonApp: ButtonVue,
    IconDrop: IconDropVue,
    Tag: TagVue,
  },
  data() {
    return {
      name: '',
      priority: '',
      list: '',
      calendar: null,
      heading: null,
      tags: [],
      optionsType: '',
      options: [],
    }
  },
  created() {
    if (this.task) {
      const t = this.task
      this.name = t.name
      this.priority = t.priority
      this.calendar = t.calendar
      this.list = this.listName
      this.heading = t.heading
      this.tags = this.getTagNames
    }
  },
  methods: {
    removeTag(name) {
      const index = this.tags.findIndex(el => el === name)
      this.tags.splice(index, 1)
    },
    select(value) {
      const arr = this.name.split(' ')
      arr[arr.length - 1] = this.optionsType + value
      let str = ''
      for (const s of arr)
        str += s + ' '
      str = str.slice(0, -1)
      this.name = str
    },
    save() {
      let n = this.name
      const i = n.indexOf(' $')
      if (i && i > -1 && this.calendar) {
        n = n.substr(0, i)
      }
      let head = this.heading
      if (head === undefined) head = null
      this.$emit('save', {
        name: n,
        priority: this.priority,
        list: this.listId,
        tags: this.tagIds,
        calendar: this.calendar,
        heading: head,
      })
      this.name = ''
    },
    addTag(name) {
      if (!this.tags.find(e => e === name))
        this.tags.push(name)
    }
  },
  computed: {
    ...mapState({
      savedTags: state => state.tag.tags,
      savedLists: state => state.list.lists,
    }),
    ...mapGetters(['l']),
    selectDate() {
      return (date) => this.calendar = date
    },
    listName() {
      if (this.task.list)
        return this.$store.getters['list/getListsById']([this.task.list])[0].name
      return ''
    },
    listId() {
      if (this.list)
        return this.$store.getters['list/getListsByName']([this.list]).map(el => el.id)[0]
      return null
    },
    getTagNames() {
      const tags = this.savedTags
      const names = []
      for (const id of this.task.tags) {
        const tag = tags.find(el => el.id === id)
        if (tag) names.push(tag.name)
      }
      return names
    },
    tagIds() {
      return this.$store.getters['tag/getTagsByName'](this.tags).map(el => el.id)
    },
    calendarStr() {
      if (this.calendar)
        return utils.parseCalendarObjectToString(this.calendar, this.l)
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
            this.addTag(el.name)
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
            const arr = []
            for (const h of el.headings) {
              arr.push({
                name: h.name,
                icon: 'heading',
                callback: () => this.heading = h.name
              })
            }
            return arr
          }
        })
      }
      return arr
    },
    buttonText() {
      if (this.btnText) return this.btnText
      return this.l['Add task']
    }
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
            this.addTag(tag.name)
            break
          }
        }
        const arr = n.split(' ')
        const lastWord = arr[arr.length - 1]
        if (lastWord[0] === '#') {
          this.optionsType = '#'
          const word = lastWord.substr(1)

          this.options = tags.map(el => el.name).filter(el => el.toLowerCase().includes(word.toLowerCase()))
          changedOptions = true
        }
      }
      const parseLists = () => {
        const lists = this.savedLists
        for (const li of lists) {
          const listName = ` @${li.name}`
          if (n.includes(listName)) {
            this.name = n.replace(listName, '')
            this.list = li.name
            break
          }
        }
        const arr = n.split(' ')
        const lastWord = arr[arr.length - 1]
        if (lastWord[0] === '@') {
          this.optionsType = '@'
          const word = lastWord.substr(1)

          this.options = lists.map(el => el.name).filter(el => el.toLowerCase().includes(word.toLowerCase()))
          changedOptions = true
        }
      }
      const parseDate = () => {
        if (n.includes(' $')) {
          const obj = utils.parseInputToCalendarObject(n, this.l)
          this.calendar = obj
        } else if (this.task) {
          this.calendar = this.task.calendar
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

.Edit {
  outline: none;
}

.cancel {
  color: var(--red);
  margin-left: 6px;
}

.cancel:hover {
  text-decoration: underline;
}

.button-wrapper {
  width: 200px;
}

.button {
  display: inline-block;
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
