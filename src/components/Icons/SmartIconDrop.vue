<template>
  <transition
    :css='false'
    @appear='appear'
    @enter='enter'
    @leave='leave'
  >
    <div class="SmartIconDrop cursor"

      :class="{isActive, tagMode}"

      @click.stop="click"
    >
      <div class="wrapper" @click="activate">
        <div class="icon-wrapper">
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
          <div v-if="!disabled && (isActive || tagMode)" class="placeholder">
            <input v-if="!tagMode || tagModeToggle" class="input"
              v-model="model"
              ref='input'
              :placeholder='getPlaceholder'
              size='1'

              :style="{width: tagModeWidth}"

              @keydown="keydown"
            />
            <span v-else ref="tag-mode-name">
              {{ name }}
            </span>
          </div>
        </transition>
      </div>
      <transition
        appear
        @enter='listEnter'
        @leave='listLeave'
      >
        <div v-if="isShowingList"
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
  </transition>
</template>

<script>

export default {
  props: ['icon', 'color', 'placeholder', 'width', 'active', 'trigger', 'list', 'listWidth', 'tagMode', 'name', 'callback', 'compose', 'disabled'],
  data() {
    return {
      focus: false,
      model: '',
      activeListElement: null,
      tagModeWidth: null,
      currentList: this.list,

      tagModeToggle: false,
    }
  },
  created() {
    if (this.currentList && this.searchFiltered[0])
      this.activeListElement = this.searchFiltered[0].id

  },
  beforeDestroy() {
    this.$parent.$el.addEventListener('click', this.hide)
  },
  mounted() {
    this.saveValueWith()
    this.$parent.$el.addEventListener('click', this.hide)
  },
  methods: {
    appear(el, done) {
      if (this.$parent.isFirstEdit)
        return done()
      this.enter(el, done)
    },
    enter(el, done) {
      const s = el.style

      const {width} = getComputedStyle(el)

      s.transitionDuration = 0
      s.width = 0
      s.opacity = 0
      s.overflow = 'hidden'
      s.whiteSpace = 'nowrap'

      if (this.tagMode) {
        s.height = 0
        s.border = 0
        s.marginLeft = 0
      }

      requestAnimationFrame(() => {
        s.transitionDuration = '.2s'

        s.width = width
        s.opacity = 1

        if (this.tagMode) {
          s.height = '25px'
          s.border = '1px solid var(--light-gray)'
        }

        setTimeout(() => {
          s.width = 'auto'
          s.overflow = 'unset'
          s.whiteSpace = 'unset'
          s.marginLeft = '4px'
          done()
        }, 200)
      })
    },
    leave(el, done) {

      const s = el.style

      const {width} = getComputedStyle(el)

      s.transitionDuration = 0

      s.width = width
      s.opacity = 1

      if (this.tagMode) {
        s.height = '25px'
        s.border = '1px solid var(--light-gray)'
      }

      requestAnimationFrame(() => {
        s.transitionDuration = '.2s'
        s.width = 0
        s.opacity = 0
        s.overflow = 'hidden'
        s.whiteSpace = 'nowrap'

        if (this.tagMode) {
          s.height = 0
          s.border = 0
          s.marginLeft = 0
        }

        setTimeout(done, 200)
      })


    },
    
    saveValueWith() {
      setTimeout(() => {
        if (this.tagMode)
          this.tagModeWidth = this.$refs['tag-mode-name'].getBoundingClientRect().width + 'px'
      }, 200)
    },
    hide(evt) {
      
      const path = evt.path || (evt.composedPath && evt.composedPath())
      let found
      for (const node of path)
        if (node === this.$el) {
          found = true
          break
        }

      if (!found) {
        if (this.tagMode)
          this.tagModeToggle = false
        else if (this.active)
          this.$parent.resetCursor()
      }
      
    },
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
    click() {
      if (this.tagMode) {
        if (this.trigger === 'enter')
          this.tagModeToggle = !this.tagModeToggle
        else if (this.trigger === 'click')
          this.callback()
      } else {
        if (!this.disabled && this.$refs.input)
          this.$refs.input.focus()
        else if (this.trigger === 'click')
          this.callback()
      }
    },
    activate(option) {
      if (!this.tagMode)
        this.$emit('trigger', option || (this.trigger === 'type' ? () => this.model : null))
      else if (!option)
        this.click()
    },


    keydown(evt) {
      const {key} = evt

      if (key === 'ArrowDown' || key === 'ArrowUp') {
        evt.stopPropagation()
        this.moveActive(key)
      } else if (key === 'Enter' && this.activeListElement) {
        this.select(this.searchFiltered.find(el => el.id === this.activeListElement))
      } else if (key === 'Escape' || key === 'ArrowRight' || key === 'ArrowLeft') {

        let stop
        
        if (key === "Escape" || ((key === 'ArrowRight' || key === 'ArrowLeft') && this.model.length > 0)) {
          stop = true
          evt.stopPropagation()
        }

        if (!stop) {
          if (this.tagMode && this.currentList === this.list)
            this.tagModeToggle = !this.tagModeToggle
          else
            this.switchLists()
        }
      }
    },
    select(option) {
      const res = option.callback(this.$parent.model)
      if (Array.isArray(res))
        this.switchLists(res)
      else if (this.tagMode)
        setTimeout(() => {
          this.tagModeToggle = !this.tagModeToggle
          this.switchLists()
        })
    },
    switchLists(arr) {
      if (!arr && !this.list)
        return;
      arr = arr || this.list
      this.currentList = arr
      if (arr && arr.length > 0)
        this.activeListElement = arr[0].id
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
      if (!this.currentList)
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
    focusOnNextTick() {
      this.$nextTick(() => {
        if (this.$refs.input)
          this.$refs.input.focus()
      })
    },
  },
  computed: {
    getPlaceholder() {
      return this.tagMode ? this.name : this.placeholder
    },
    
    isActive() {
      return this.focus || this.active
    },
    searchFiltered() {
      if (!this.currentList)
        return []
      return this.compose ? this.compose(this.currentList, this.model) : this.currentList.filter(el => el.name.toLowerCase().includes(this.model.toLowerCase()))
    },
    isShowingList() {
      return !this.disabled && (this.isActive && this.currentList && !this.tagMode) || (this.tagMode && this.tagModeToggle)
    },
  },
  watch: {
    name() {
      this.saveValueWith()
    },
    tagModeToggle() {
      if (this.tagModeToggle) {
        this.model = ''
        this.focusOnNextTick()
      }
    },
    searchFiltered() {
      if (!this.searchFiltered.find(el => el.id === this.activeListElement) && this.searchFiltered[0])
        this.activeListElement = this.searchFiltered[0].id
    },
    active() {
      if (this.active && !this.tagMode) {
        this.focusOnNextTick()
      } else if (!this.active && this.focus && this.$refs.input)
        this.$refs.input.blur()
    },
    isActive(val) {
      this.model = ''
      this.switchLists()
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
  box-sizing: border-box;
  position: relative;
  transition-duration: .2s;
}

.tagMode + .tagMode {
  margin-left: 4px;
}

.SmartIconDrop.isActive, .SmartIconDrop:hover {
  background-color: var(--light-sidebar-color);
}

.tagMode {
  border: 1px solid var(--light-gray);
}

.tagMode.isActive, .tagMode:hover {
  background-color: var(--light-gray);
}

.icon-wrapper {
  min-width: 20px;
  display: flex;
  justify-content: center;
}

.icon {
  transform: translateX(-1px);
}

.tagMode .icon {
  transform: translateY(-1.5px);
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
  box-shadow: 0 2px 8px rgba(0, 0, 0, .2);
  max-height: 250px;
  width: 145px;
  left: 0;
  top: 100%;
}

.tag-mode-name {
  white-space: nowrap;
  overflow: hidden;
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
