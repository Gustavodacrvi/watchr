
<template>
  <transition
    appear
    @enter='enter'
    @leave='leave'
  >
    <div class="Subtask rb cursor handle" :class="{completed}" @mouseenter="hover = true" @mouseleave="hover = false" @click.stop="editing = true">
      <span class="icons" @click.stop="$emit('toggle')">
        <Icon v-if="!completed" class="icon" icon="circle"/>
        <Icon v-else class="icon" icon="circle-check"/>
      </span>
      <span v-if="!editing" class="name-wrapper">
        <span class="name">
          {{ str }}
        </span>
      </span>
      <InputApp v-else
        :value='str'
        @input='v => str = v'
        class="no-back"
        :focus='true'
        @enter='save'
      />
      <div class="line-wrapper">
        <div class="line rb"></div>
      </div>
      <transition name="fade-t">
        <div v-if="showDeleteIcon && !editing" class="delete-wrapper">
          <Icon icon="trash" class="delete" @click="$emit('remove')"/>
        </div>
      </transition>
    </div>
  </transition>
</template>

<script>

import InputApp from "@/components/Auth/Input.vue"

import { mapGetters } from 'vuex'

export default {
  props: ['name', 'completed', 'id'],
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
    stopEditing() {
      this.str = this.name
      this.editing = false
    },
    save() {
      this.editing = false
      this.$emit("save", this.str)
    },

    enter(el, done) {
      const s = el.style

      s.transitionDuration = 0
      s.height = 0
      s.opacity = 0

      requestAnimationFrame(() => {
        s.transitionDuration = '.2s'
        s.height = '35px'
        s.opacity = 1

        setTimeout(done, 205)
      })
    },
    leave(el) {

      const s = el.style

      s.height = 0
      s.opacity = 0

    },
  },
  computed: {
    ...mapGetters(['isDesktop']),
    showDeleteIcon() {
      return !this.isDesktop || this.hover
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
  transition-duration: .15s;
}

.name-wrapper {
  position: relative;
  flex-basis: 100%;
  display: flex;
  align-items: center;
}

.name {
  padding: 0 10px;
  max-width: 100%;
  position: absolute;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: opacity .15s;
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

.completed .line {
  width: 100%;
}

.Subtask:hover {
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
  transition-duration: .15s;
}

.delete:hover {
  color: var(--red);
}

.completed .icons, .completed .name, .completed .delete {
  opacity: .2;
}

.icons {
  height: 100%;
  flex-basis: 25px;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: opacity .15s;
}

.icon {
  transform: translateY(2px);
  margin-left: 6px;
}

</style>
