
<template>
  <transition
    appear
    @enter='enter'
    @leave='leave'
  >
    <div
      class="Subtask rb item-handle"
      :class="{isTaskCompleted, active}"
      
      @mouseenter="hover = true"
      @mouseleave="hover = false"
      @click="edit"
    >
      <span class="icons cursor" @click.stop="$emit('toggle')">
        <Icon v-if="!isTaskCompleted"
          class="icon primary-hover"
          icon="circle"
          color='var(--primary)'
          width='12px'
        />
        <Icon v-else
          class="icon primary-hover"
          icon="circle-check"
          color='var(--primary)'
          width='12px'
        />
      </span>
      <span v-if="!editing"
        class="name-wrapper"
        @click.stop='edit'
      >
        <span class="name">
          {{ str }}
        </span>
      </span>
      <InputApp v-else
        :value='str'
        @input='v => str = v'
        class="no-back input"
        :focus='true'
        @enter='save'

        @keydown="keydown"
      />
      <div class="line-wrapper">
        <div class="line rb"></div>
      </div>
      <transition name="fade-t">
        <div v-if="showDeleteIcon && !editing" class="delete-wrapper">
          <Icon icon="trash" class="delete cursor" @click="$emit('remove')"/>
        </div>
      </transition>
    </div>
  </transition>
</template>

<script>

import InputApp from "@/components/Auth/Input.vue"

import mom from 'moment'

import { mapGetters } from 'vuex'

export default {
  props: ['name', 'compareDate', 'completeDate', 'completed', 'id', 'active'],
  components: {
    InputApp,
  },
  data() {
    return {
      hover: false,
      str: this.name,
      editing: false,
    }
  },
  mounted() {
    window.addEventListener('click', this.stopEditing)
  },
  beforeDestroy() {
    window.removeEventListener('click', this.stopEditing)
  },
  methods: {
    edit() {
      this.editing = true
    },
    keydown({key}) {
      if (key === "ArrowDown" || key === 'ArrowUp') {
        this.str = this.name
        this.editing = false
      }
      
      if (key === "ArrowUp")
        this.$emit('move-cursor-up')
      else if (key === 'ArrowDown')
        this.$emit('move-cursor-down')
    },
    stopEditing() {
      this.str = this.name
      this.editing = false
    },
    save() {
      setTimeout(() => {
        this.editing = false
      })
      this.$emit("save", this.str)
    },

    enter(el, done) {
      const s = el.style
      requestAnimationFrame(() => {
        s.transitionDuration = 0
        s.height = 0
        s.opacity = 0
  
        requestAnimationFrame(() => {
          s.transitionDuration = '.175s'
          s.height = '22px'
          s.opacity = 1
  
          setTimeout(done, 205)
        })
      })
    },
    leave(el, done) {
      const s = el.style

      s.transitionDuration = 0
      s.height = '22px'
      s.opacity = 1

      requestAnimationFrame(() => {
        s.transitionDuration = '.175s'
        
        s.height = 0
        s.opacity = 0

        setTimeout(done, 201)
      })

    },
  },
  computed: {
    ...mapGetters(['isDesktopBreakPoint', 'isDesktopDevice']),
    showDeleteIcon() {
      return !this.isDesktopBreakPoint || this.hover
    },
    isTaskCompleted() {
      if (!this.compareDate)
        return this.completed
      if (!this.completeDate)
        return false

      return this.completed && mom(this.completeDate, 'Y-M-D').isSameOrAfter(mom(this.compareDate, 'Y-M-D'), 'day')
    },
  },
  watch: {
    name() {
      this.str = this.name
    },
  }
}
</script>

<style scoped>

.Subtask {
  position: relative;
  display: flex;
  transition: height .175s, background-color .175s;
  height: 22px;
}

.name-wrapper {
  position: relative;
  flex-basis: 100%;
  display: flex;
  align-items: center;
  user-select: none;
}

.name {
  padding: 0 8px;
  max-width: 100%;
  position: absolute;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: opacity .175s;
}

.line-wrapper {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  box-sizing: border-box;
  padding: 0 14px;
  height: 100%;
  pointer-events: none;
  display: flex;
  align-items: center;
}

.line {
  width: 0;
  height: 3px;
  transition-duration: .3s;
  background-color: var(--extra-light-gray);
}

.isTaskCompleted .line {
  width: 100%;
}

.Subtask:hover, .active {
  background-color: var(--light-gray);
}

.delete-wrapper {
  position: absolute;
  right: 6px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  width: 30px;
  height: 100%;
  align-items: center;
  justify-content: center;
}

.delete {
  transition-duration: .175s;
}

.delete:hover {
  color: var(--red);
}

.isTaskCompleted .icons, .isTaskCompleted .name, .isTaskCompleted .delete {
  opacity: .2;
}

.icons {
  height: 100%;
  flex-basis: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: opacity .175s;
}

.icon {
  transform: translateY(1px);
}

.input {
  padding-left: 8px;
}

</style>

<style>


.isAddingChecklist .Subtask {
  height: unset;
}

</style>
