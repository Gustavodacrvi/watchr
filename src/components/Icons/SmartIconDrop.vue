<template>
  <transition
    :css='false'
    @appear='appear'
    @enter='enter'
    @leave='leave'
  >
    <div class="SmartIconDrop cursor"

      :class="{isActive, headerIcon, notHeaderIcon: !headerIcon, tagMode, isTyping: !disabled && (isActive || tagMode) && (!tagMode || tagModeToggle)}"
      :title='title'

      @click="click"
      @click.self='clickSelf'
    >
      <div class="wrapper-wrapper"
        @click="activate"
      >
        <div class="icon-wrapper">
          <Icon class="icon"
            ref='icon'
            :icon='icon'
            :width='width || "13px"'
            :color='color'
            :file='file'
            @add='onFileDrop'
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
              @blur='focus = false'
              @focus='focus = true'
            />
            <span v-else ref="tag-mode-name" class="value">
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

              @click.stop="select(o)"
            >
              <div class="option-wrapper">
                <div class="option-icon-wrapper">
                  <Icon v-if='o.icon' class="option-icon"
                    :icon='o.icon'
                    :color='o.color'
                    width='12px'
                  />
                  <Photo v-else-if='o.photoURL'
                    class="mem"
                    :photoURL='o.photoURL'
                    size='ultra-small'
                    :stopAuthFallback='true'
                    :display='true'
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

import Photo from "@/components/View/RenderComponents/ProfilePhoto.vue"

import { mapState } from 'vuex'

export default {
  components: {
    Photo,
  },
  props: ['icon', 'color', 'placeholder', 'width', 'active', 'trigger', 'list', 'listWidth', 'tagMode', 'name', 'callback', 'compose', 'disabled', 'file', 'onDrop', 'headerIcon', 'title', 'listenToWindow'],
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
    (!this.listenToWindow ? this.$parent.$el : window).removeEventListener('click', this.hide)
  },
  mounted() {
    (!this.listenToWindow ? this.$parent.$el : window).addEventListener('click', this.hide)
    this.saveValueWith()
  },
  methods: {
    onFileDrop(...args) {
      if (this.onDrop)
        this.onDrop(...args)
    },
    appear(el, done) {
      if (this.$parent.isFirstEdit || this.headerIcon)
        return done()
      this.enter(el, done)
    },
    enter(el, done) {
      const s = el.style

      const {width} = getComputedStyle(el)

      s.transitionDuration = 0
      s.width = 0
      s.opacity = 0
      s.overflow = 'visible'
      s.whiteSpace = 'nowrap'

      if (this.tagMode) {
        s.height = 0
        s.border = 0
        s.marginLeft = 0
      }

      requestAnimationFrame(() => {
        s.transitionDuration = '.15s'

        s.width = width
        s.opacity = 1

        if (this.tagMode) {
          s.height = '19px'
          s.border = '1px solid var(--light-gray)'
          s.marginLeft = '4px'
        }

        setTimeout(() => {
          s.width = 'auto'
          s.overflow = 'unset'
          s.whiteSpace = 'unset'
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
        s.height = '19px'
        s.border = '1px solid var(--light-gray)'
      }

      requestAnimationFrame(() => {
        s.transitionDuration = '.15s'
        s.width = 0
        s.opacity = 0
        s.overflow = 'visible'
        s.whiteSpace = 'nowrap'

        if (this.tagMode) {
          s.height = 0
          s.border = 0
          s.marginLeft = 0
        }

        setTimeout(done, 151)
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

      const clickedInSmartIcon = () => {
        for (const node of path)
          if (node && node.classList && node.classList.contains('SmartIconDrop'))
            return true
      }

      if (!found) {
        if (this.tagMode)
          this.tagModeToggle = false
        else if (this.active && !clickedInSmartIcon())
          this.$refs.input.focus()
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
          s.transitionDuration = '.15s'
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
        s.transitionDuration = '.15s'
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
        s.transitionDuration = '.15s'

        s.width = width
        s.opacity = 1
        s.padding = '0 2px'

        setTimeout(done, 200)
      })
    },
    placeLeave(el, done) {

      const s = el.style

      s.transitionDuration = '.15s'
      s.width = 0
      s.opacity = 0
      s.padding = '0'

      setTimeout(done, 200)

    },
    clickSelf() {
      if (this.file)
        this.$refs.icon.click()
    },
    click(evt) {
      if (this.tagMode) {
        if (this.trigger === 'enter')
          this.tagModeToggle = !this.tagModeToggle
        else if (this.trigger === 'click')
          if (this.callback)
            this.callback()
      } else {
        if (!this.disabled && this.$refs.input)
          this.$refs.input.focus()
        else if (this.trigger === 'click')
          if (this.callback)
            this.callback()
      }
    },
    activate(option, isFromEdit) {
      if (this.file && isFromEdit) {
        this.$refs.icon.click()
      } else {
        if (!this.tagMode)
          this.$emit('trigger', option || (this.trigger === 'type' ? () => this.model : null))
        else if (!option)
          this.click()
      }
    },


    keydown(evt) {
      const {key} = evt

      if (this.headerIcon && this.isOnAlt) {
        evt.preventDefault()
      }

      if (key === 'ArrowDown' || key === 'ArrowUp') {
        evt.stopPropagation()
        this.moveActive(key)
      } else if (key === 'Enter' && this.activeListElement) {
        this.select(this.searchFiltered.find(el => el.id === this.activeListElement))
      } else if (key === 'Escape' || key === 'ArrowRight' || key === 'ArrowLeft') {

        let stop
        
        if (!this.headerIcon && (key === "Escape" || ((key === 'ArrowRight' || key === 'ArrowLeft') && this.model.length > 0))) {
          stop = true
          evt.stopPropagation()
        }

        if (key === "Escape" && !(this.tagMode && this.currentList === this.list))
          this.switchLists()
        
        if (key === "Escape" && this.headerIcon)
          this.$emit('close')
        if (key === "Escape" && this.tagMode)
          this.tagModeToggle = false

        if (!stop) {
          if (this.tagMode && this.currentList === this.list)
            this.tagModeToggle = !this.tagModeToggle
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
    ...mapState(['isOnAlt']),
    
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
      } else if (!this.active && this.focus && this.$refs.input) {
        this.$refs.input.blur()
      }
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
  height: 19px;
  padding: 2px;
  display: inline-block;
  border-radius: 4px;
  box-sizing: border-box;
  position: relative;
  transition-duration: .15s;
}

.tagMode + .tagMode {
  margin-left: 4px;
}

.isTyping {
  box-shadow: inset 0 10px 8px -13px rgba(5,5,5, .7),
    inset 0 -10px 5px -13px rgba(210,210,210, .7);
}

.SmartIconDrop.isActive, .SmartIconDrop.notHeaderIcon:hover {
  background-color: var(--light-sidebar-color);
}

.SmartIconDrop.isActive.headerIcon {
  background-color: var(--sidebar-color);
  box-shadow: inset 0 10px 8px -13px rgba(5,5,5, .7),
    inset 0 -10px 5px -13px rgba(210,210,210, .7);
}

.tagMode {
  border: 1px solid var(--light-gray);
}

.tagMode.isActive, .tagMode.notHeaderIcon:hover {
  background-color: var(--light-gray);
}

.value {
  display: block;
  transform: translateY(-1px);
}

.icon-wrapper {
  min-width: 20px;
  display: flex;
  justify-content: center;
  transform: translateY(1px);
}

.tagMode .icon-wrapper {
  transform: translateY(0px);
}

.wrapper-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
}

.placeholder {
  padding: 0 2px;
  height: 100%;
}

.input {
  padding: 0;
  width: 80px;
  outline: none;
  transform: translateY(-1px);
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
}

.notHeaderIcon .list {
  top: 110%;
}

.headerIcon .list {
  bottom: 110%;
}

.tag-mode-name {
  white-space: nowrap;
  overflow: hidden;
}

.option {
  margin: 0 6px;
  height: 19px;
  padding: 0 4px;
  transition-duration: .15s;
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
  transition-duration: .15s;
  opacity: 0;
  height: 0;
}

.option-t-leave, .option-t-enter-to {
  transition-duration: .15s;
  opacity: 1;
  height: 19px;
}

</style>
