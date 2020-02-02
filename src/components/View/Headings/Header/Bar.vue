<template>
  <div
    class="header"
    :class="platform"
    @click="click"
  >
    <Icon class="icon"
      :icon="getIcon"
      :color="getIconColor"
      :progress='progress'
      :shadow='true'
      :width="isDesktop ? '40px' : '30px'"
      @click="openMenu"
    />
    <HeaderSearch v-if="!isDesktop"/>
    <span v-if="!editing || !isEditable"
      class="name"
      @click.stop="editing = true"
    >{{ viewNameValue }}</span>
    <input v-else-if="isEditable"
      class="input"
      autocomplete="off"
      :value="title"
      @input='v => title = v.target.value'
      ref='input'
      @click.stop
      @keydown="keydown"
    >
    <transition name="line-t"
      @enter="lineEnter"
      @leave="lineLeave"
    >
      <div v-if="isEditable && editing" class="line"></div>
    </transition>
    <div class="drop passive">
      <Icon v-for="i in extraIcons" :key="i.icon"
        class="cursor opt remove-highlight primary-hover"
        :icon="i.icon"
        color='var(--fade)'
        :circle="true"
        @click="i.callback"
      />
      <IconDrop v-if="options && options.length > 0"
        class="opt"
        :handle="optionsHandle"
        handleColor="var(--fade)"
        :options="options"
        :circle='true'
      />
    </div>
  </div>
</template>

<script>

import Icon from '../../../Icon.vue'
import IconDrop from '../../../IconDrop/IconDrop.vue'
import HeaderSearch from './HeaderSearch.vue'

import { mapGetters, mapState } from 'vuex'

export default {
  components: {
    HeaderSearch,
    Icon, IconDrop,
  },
  props: ['optionsHandle', 'options', 'progress', 'extraIcons', 'viewNameValue', 'notes', 'viewType', 'icon', 'viewName', 'saveHeaderName'],
  data() {
    return {
      editing: false,
      title: this.viewNameValue,
      note: this.notes,
    }
  },
  created() {
    window.addEventListener('click', this.hide)
  },
  beforeDestroy() {
    window.removeEventListener('click', this.hide)
  },
  methods: {
    click(event) {
      if (this.selectedItems.length > 0) event.stopPropagation()
    },
    hide() {
      this.editing = false
    },
    openMenu() {
      if (!this.isDesktop)
        this.$router.push('/menu')
    },
    lineEnter(el) {
      const s = el.style
      
      const inp = this.$refs.input
      if (inp) {
        s.left = inp.offsetLeft + 'px'
        s.opacity = '0'
        s.width = '0px'
        s.transitionDuration = '.0s'
        setTimeout(() => {
          s.transitionDuration = '.15s'
          s.width = inp.offsetWidth + 'px'
          s.opacity = '1'
        })
      }
    },
    keydown({key}) {
      if (key === "Enter" && this.isEditable) {
        if (this.saveHeaderName)
          this.saveHeaderName(this.title.trim())
        this.editing = false
      }
    },
    focusOnInput() {
      setTimeout(() => {
        const inp = this.$refs.input
        if (inp) inp.focus()
      }, 100)
    },
    lineLeave(el) {
      el.style.width = '0px'
      el.style.opacity = '0'
    },
  },
  computed: {
    ...mapState(['selectedItems']),
    ...mapGetters(['platform', 'isDesktop']),
    getIcon() {
      if (this.icon) return this.icon
      if (this.viewType === 'search') return 'search'
      const obj = {
        Today: 'star',
        Tomorrow: 'sun',
        Someday: 'archive',
        Anytime: 'layer-group',
        Inbox: 'inbox',
        Calendar: 'calendar-star',
        Pomodoro: 'pomo',
        Statistics: 'pie',
        Upcoming: 'calendar',
        Completed: 'circle-check',
        "Later lists": 'later-lists',
      }
      return obj[this.viewName]
    },
    getIconColor() {
      if (this.viewType === 'folder') return ''
      if (this.viewType === 'list') {
        const obj = {
          Today: 'var(--yellow)',
          Tomorrow: 'var(--orange)',
          Someday: 'var(--brown)',
          Anytime: 'var(--dark-blue)',
          Inbox: 'var(--primary)',
          Calendar: 'var(--purple)',
          Pomodoro: 'var(--dark-red)',
          Statistics: 'var(--primary)',
          Upcoming: 'var(--green)',
          Completed: 'var(--olive)',
        }
        const color = obj[this.viewName]
        if (!color) return 'var(--primary)'
        return color
      }
      if (this.viewType === 'search') return ''
      return 'var(--red)'
    },
    isEditable() {
      return !this.isSmart && (this.viewType === 'list' || this.viewType === 'tag' || this.viewType === 'folder') && this.isDesktop
    },
  },
  watch: {
    viewName() {
      this.editing = false
    },
    viewNameValue() {
      this.title = this.viewNameValue
      this.note = this.notes
    },
    editing() {
      if (this.editing)
        this.focusOnInput()
    },
  },
}

</script>

<style scoped>

.header {
  z-index: 200;
}

.icon {
  position: relative;
  z-index: 2;
  margin-right: 16px;
}

.name {
  position: relative;
  z-index: 1;
  margin: 0;
  font-size: 1.6em;
  max-width: 550px;
  word-break: break-all;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.opt {
  margin-left: 8px;
}

.line {
  position: absolute;
  bottom: 0;
  display: inline-block;
  height: 2px;
  background-color: var(--txt);
}

.input {
  background-color: var(--back-color);
  border: none;
  font-size: 1.5em;
  width: 500px;
  font-weight: bold;
  outline: none;
}

.mobile.header {
  padding-top: 30px;
  margin-bottom: 24px;
  margin-left: 6px;
}

.drop {
  transform: translateY(3px);
  position: absolute;
  right: 0;
  display: flex;
  align-items: center;
}

.mobile .name {
  font-size: 1.15em;
}

.mobile .drop {
  margin-right: 5px;
}

</style>
