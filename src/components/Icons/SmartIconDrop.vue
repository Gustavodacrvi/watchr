<template>
  <div class="SmartIconDrop cursor"
    @mouseenter="hover = true"
    @mouseleave="hover = false"

    :class="{isActive}"
  >
    <div class="wrapper">
      <div class="icon-wrapper" @click="activate">
        <Icon class="icon"
          :icon='icon'
          :width='width || "16px"'
          :color='color'
        />
      </div>
      <transition
        :css='false'
        @enter='placeEnter'
        @leave='placeLeave'
      >
        <div v-if="hover || focus" class="placeholder">
          <input class="input"
            v-model="model"
            ref='input'
            :placeholder='placeholder'
            size='1'

            @keydown="keydown"
            @focus='focus = true'
            @blur='focus = false'
          />
        </div>
      </transition>
    </div>
    <transition
      appear
      @enter='listEnter'
      @leave='listLeave'
    >
      <div v-if="isActive && list"
        class="list rb scroll-thin"
        ref='list'

        :style='{width: listWidth}'
      >
        <transition-group name="option-t">
          <div v-for="o in searchFiltered" :key="o.id"
            class="option rb"
            :class="{activeOption: activeListElement === o.id}"

            :data-id='o.id'

            @click="select(o)"
          >
            <div class="option-wrapper">
              <div class="option-icon-wrapper">
                <Icon class="option-icon"
                  :icon='o.icon'
                  :color='o.color'
                  width='14px'
                />
              </div>
              <div class="option-name">
                {{ o.name }}
              </div>
            </div>
          </div>
        </transition-group>
      </div>
    </transition>
  </div>
</template>

<script>

export default {
  props: ['icon', 'color', 'placeholder', 'width', 'active', 'trigger', 'list', 'listWidth'],
  data() {
    return {
      hover: false,
      focus: false,
      model: '',
      activeListElement: null,
    }
  },
  methods: {
    listEnter(el, done) {

      const s = el.style
      requestAnimationFrame(() => {
        const height = getComputedStyle(el).height

        s.transitionDuration = 0
        s.height = 0
        s.opacity = 0

        requestAnimationFrame(() => {
          s.transitionDuration = '.2s'
          s.height = height
          s.opacity = 1

          setTimeout(() => {
            s.height = 'auto'
            done()
          }, 200)

        })
      })

    },
    listLeave(el, done) {

      const s = el.style

      s.transitionDuration = 0
      s.height = getComputedStyle(el).height
      s.opacity = 1

      requestAnimationFrame(() => {
        s.transitionDuration = '.2s'
        s.height = 0
        s.opacity = 0

        setTimeout(done, 200)

      })

    },
    
    placeEnter(el, done) {
      const s = el.style

      const width = getComputedStyle(el).width

      s.transitionDuration = 0
      s.width = 0
      s.opacity = 0
      s.padding = '0'

      requestAnimationFrame(() => {
        s.transitionDuration = '.2s'

        s.width = width
        s.opacity = 1
        s.padding = '0 4px'

        setTimeout(done, 200)
      })
    },
    placeLeave(el, done) {

      const s = el.style

      s.transitionDuration = '.2s'
      s.width = 0
      s.opacity = 0
      s.padding = '0'

      setTimeout(done, 200)

    },
    activate(option) {
      this.$emit('trigger', option || (this.trigger === 'type' ? () => this.model : null))
    },


    keydown({key}) {

      if (key === 'ArrowDown' || key === 'ArrowUp') {
        this.moveActive(key)
      } else if (key === 'Enter' && this.activeListElement) {
        this.select(this.searchFiltered.find(el => el.id === this.activeListElement))
      }
    },
    select(option) {
      option.callback(this.$parent.model)
    },
    getRefsPositions(id) {
      const list = this.$refs.list
      const childNodes = list.childNodes[0].childNodes
      let active
      for (const c of childNodes) {
        if (c.dataset.id === id) active = c
      }
      const activeHeight = active.clientHeight
      const activeTop = active.offsetTop
      const listHeight = list.clientHeight
      const scroll = list.scrollTop

      return {
        act: {
          height: activeHeight,
          top: activeTop,
        },
        list: {
          height: listHeight,
          scroll,
        },
      }
    },
    moveActive(key) {
      if (!this.list)
        return;
      if (!this.activeListElement)
        this.activeListElement = this.searchFiltered[0].id
      else {
        const i = this.searchFiltered.findIndex(el => {
          return el.id === this.activeListElement
        })
        const list = this.$refs.list

        const p = this.getRefsPositions(this.activeListElement)
        if (key === 'ArrowDown' && i + 1 < this.searchFiltered.length) {
          this.activeListElement = this.searchFiltered[i + 1].id

          if (p.act.top + p.act.height > p.list.height + p.list.scroll)
            list.scrollTop += p.act.height
        } else if (key === 'ArrowUp' && i !== 0) {
          this.activeListElement = this.searchFiltered[i - 1].id

          if (p.act.top < p.list.scroll)
            list.scrollTop -= p.act.height
        } else {
          if (key === 'ArrowUp' && this.searchFiltered[this.searchFiltered.length - 1].id) {
            list.scrollTop = p.list.height
            this.activeListElement = this.searchFiltered[this.searchFiltered.length - 1].id
          } else if (key === 'ArrowDown' && this.searchFiltered[0].id) {
            list.scrollTop = 0
            this.activeListElement = this.searchFiltered[0].id
          }
        }
      }
    },
  },
  created() {
    if (this.list && this.searchFiltered[0])
      this.activeListElement = this.searchFiltered[0].id
  },
  computed: {
    isActive() {
      return this.hover || this.focus
    },
    searchFiltered() {
      if (!this.list)
        return []
      return this.list.filter(el => el.name.toLowerCase().includes(this.model.toLowerCase()))
    },
  },
  watch: {
    searchFiltered() {
      if (!this.searchFiltered.find(el => el.id === this.activeListElement) && this.searchFiltered[0])
        this.activeListElement = this.searchFiltered[0].id
    },
    active() {
      if (this.active) {
        this.focus = true
        this.$nextTick(() => this.$refs.input.focus())
      } else if (!this.active && this.focus)
        this.$refs.input.blur()
    },
    isActive(val) {
      this.model = ''
    },
    model() {
      if (this.trigger === 'type' && this.model.length > 0)
        this.activate()
    },
  },
}

</script>

<style scoped>

.SmartIconDrop {
  height: 25px;
  padding: 4px;
  display: inline-block;
  border-radius: 6px;
  position: relative;
  transition-duration: .2s;
}

.SmartIconDrop.isActive {
  background-color: var(--light-sidebar-color);
}

.icon-wrapper {
  min-width: 20px;
  display: flex;
  justify-content: center;
}

.icon {
  transform: translateX(-1px);
}

.wrapper {
  width: 100%;
  height: 100%;
  display: flex;
}

.placeholder {
  padding: 0 4px;
  height: 100%;
}

.input {
  padding: 0;
  width: 80px;
  outline: none;
}

.list {
  background-color: var(--card);
  border: 1px solid var(--light-gray);
  padding: 8px 0;
  position: absolute;
  overflow: auto;
  max-height: 250px;
  width: 145px;
  left: 0;
  top: 100%;
}

.option {
  margin: 0 6px;
  height: 25px;
  padding: 0 6px;
  transition-duration: .2s;
}

.option:hover, .activeOption {
  background-color: var(--light-gray);
}

.option-wrapper {
  display: flex;
  align-items: center;
  height: 100%;
}

.option-icon-wrapper {
  height: 100%;
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.option-icon {
  transform: translateY(1px);
}

.option-name {
  margin-left: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.option-t-enter, .option-t-leave-to {
  transition-duration: .2s;
  opacity: 0;
  height: 0;
}

.option-t-leave, .option-t-enter-to {
  transition-duration: .2s;
  opacity: 1;
  height: 25px;
}

</style>
