
<template>
  <div class="ListIcons scroll-thin" :class="[{overflow: links.allowSearch}, deviceLayout]">
    <div class="links" ref='main-content'>
      <div v-if="links.allowSearch" class="search hide-trans">
        <SearchInput
          ref='input'
          v-model="search"
        />
      <span v-if="select && allowKeyboard" class="notes">
        Shift + Enter to save
      </span>
      </div>
      <transition-group
        @enter='enterItems'
        @leave='leaveItems'
      >
        <template v-for="(l, index) in getLinks">
          <div v-if="!l.type" class="link cursor hide-trans"
            :class="{important: l.important, active: (allowKeyboard && index === selectionPos)}"
            :key="l.id || l.name"
            :ref="l.name"
            @click="linkClick(l)"
            @dblclick="l.important ? linkCallback(l.callback, l) : () => {}"
          >
            <div class="link-cont">
              <ProfilePhoto v-if='l.photoURL'
                class="photo"
                :photoURL='l.photoURL'
                size='ultra-small'
                :display='true'
              />
              <Icon v-else-if="l.icon"
                class="cursor icon"
                :icon="l.icon"
                :color="l.color"
                width='12px'
              />
              <input v-if="l.file" :ref="`file-icondrop-link-${l.name}`" type="file" :accept="l.accept" style="display: none" @change='handleFiles(l)'>
              <span class="name" v-html="l.name"></span>
              <span v-if="select && selected.includes(l.name)"
                class='check-icon'
              >
                <Icon
                  icon='check'
                  width='12px'
                />
              </span>
            </div>
          </div>
          <div v-else-if="l.type === 'optionsList'" :key="l.name" class="header-link hide-trans">
            <div class="header-name">{{ l.name }}</div>
            <div class="values">
              <Icon v-for="l in l.options" :key="l.id" class="val primary-hover icon cursor"
                :icon="l.icon"
                width='14px'
                :color="l.color"
                @click="linkCallback(l.callback, l)"
              />
            </div>
          </div>
          <div v-else-if="l.type === 'hr'" :key="l.name"
            class="drop-division hide-trans"
          ><div class="division-line hide-trans"></div></div>
          <div v-else-if="l.type === 'button'" :key="l.name">
            <div class="btn">
              <ButtonInput
                type='tiny'
                :value='l.name'
                @click='linkCallback(l.callback, l)'
              />
            </div>
          </div>
        </template>
      </transition-group>
    </div>
    <div v-if="select && links.onSave" class="btn">
      <div style="height: 38px"></div>
      <div class="absolute-btn">
        <div class="abs-wrapper">
          <div class="back-layer"></div>
          <ButtonInput class="abs-btn"
            type='tiny'
            value='Save selected'
            @click.native='saveSelected'
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>

import ProfilePhoto from "@/components/View/RenderComponents/ProfilePhoto.vue"
import SearchInput from "./Components/SearchInput.vue"
import ButtonInput from "./Components/Button.vue"

import { mapGetters, mapState } from 'vuex'

export default {
  props: ['content', 'allowKeyboard', 'onSelect'],
  components: {
    SearchInput,
    ProfilePhoto, ButtonInput,
  },
  data() {
    return {
      links: this.content,
      search: '',
      selected: [],

      selectionPos: 0,
    }
  },
  created() {
    if (this.select && this.links.selected)
      this.selected = this.links.selected.slice()
  },
  mounted() {
    if (this.allowKeyboard) {
      window.addEventListener('keydown', this.keydown)
      if (this.$refs.input)
        this.$refs.input.focusInput()
    }
  },
  beforeDestroy() {
    if (this.allowKeyboard)
      window.removeEventListener('keydown', this.keydown)
  },
  methods: {
    increment(inc) {
      const newIndex = this.selectionPos + inc
      if (this.getLinks[newIndex])
        this.selectionPos = newIndex
    },
    keydown(evt) {
      const { key } = evt
      const p = () => {
        evt.stopPropagation()
        evt.preventDefault()
      }

      if (key === "Escape")
        this.$emit('close')

      if (key === 'Enter' && !this.isOnShift)
        this.keyboardActions[this.selectionPos]()
      else if (key === "Enter" && this.isOnShift)
        this.saveSelected()

      if (key === 'ArrowDown') {
        p()

        if (this.isOnShift)
          this.selectionPos = this.getLinks.length - 1
        else
          this.increment(1)
      } else if (key === 'ArrowUp') {
        p()

        if (this.isOnShift)
          this.selectionPos = 0
        else
          this.increment(-1)
      }

    },
    
    linkClick(l) {
      l.important ? this.blink(l.name) : this.linkCallback(l.callback, l)
    },
    blink(ref) {
      const el = this.$refs[ref][0]
      if (el) {
        el.classList.add('blink')
        setTimeout(() => el.classList.remove('blink'), 200)
      }
    },
    saveSelected() {
      this.links.onSave(this.selected)
      this.$emit('close')
    },
    linkCallback(callback, link) {
      if (!this.select) {
        if (link.file) this.getFile(link)
        else {
          const close = () => {
            this.$emit('close')
            this.$store.commit('clearSelected')
          }
          if (callback) {
            let cancel = false
            if (this.onSelect && this.onSelect(link) === false) {
              cancel = true
              close()
            }

            if (!cancel) {
              const opt = callback(link, this, this.$parent)

              if (!opt || (opt && opt.then)) close()
              else this.$emit('update', opt)
            }
          }
        }
      } else {
        if ((!this.selected.includes(link.name))) {
          this.selected.push(link.name)
        } else {
          const i = this.selected.findIndex(el => el === link.name)
          this.selected.splice(i, 1)
        }
      }
    },
    getFile(link) {
      const ref = this.$refs[`file-icondrop-link-${link.name}`][0]
      if (ref) ref.click()
    },
    handleFiles(link) {
      const ref = this.$refs[`file-icondrop-link-${link.name}`][0]
      if (ref && link.handleFiles) {
        const files = ref.files
        const promise = new Promise(resolve => {
          const reader = new FileReader()
          reader.onload = (evt) => {
            let obj = JSON.parse(evt.target.result)
            resolve(obj)
          }
          reader.readAsText(files[0])
        })

        link.handleFiles(files, promise)
      }
    },
    enterItems(el, done) {
      el.style.opacity = 0
      el.style.height = '0px'
      requestAnimationFrame(() => {
        el.style.opacity = 1
        el.style.height = '19px'
        setTimeout(() => done(), 200)
      })
    },
    leaveItems(el, done) {
      el.style.opacity = 0
      el.style.height = '0px'
      setTimeout(() => done(), 200)
    },
  },
  computed: {
    ...mapState({
      isOnShift: state => state.isOnShift,
    }),
    ...mapGetters(['deviceLayout']),
    keyboardActions() {
      let num = 0
      return this.getLinks.reduce((obj, l) => {
        obj[num] = () => this.linkClick(l)
        num++
        return obj
      }, {})
    },
    select() {
      return this.links && this.links.select
    },
    getLinks() {
      let arr = this.links
      if (this.links.links) arr = this.links.links
      if (this.links.allowSearch)
        return arr.filter(el => el.name.toLowerCase().includes(this.search.toLowerCase()))
      return arr
    },
  },
}

</script>

<style scoped>

.fade {
  opacity: .6;
}

.ListIcons {
  max-height: 430px;
  padding: 8px 0;
}

.overflow {
  overflow: auto !important;
}

.link {
  display: flex;
  align-items: center;
  transition-duration: .175s;
  white-space: nowrap;
  height: 19px;
  overflow: hidden;
  position: relative;
}

.mobile .link {
  height: 30px;
}

.link:hover, .active {
  color: var(--primary);
  background-color: rgba(87,160,222,.1);
}

.link:hover .check-icon {
  color: var(--primary) !important;
}

.notes {
  opacity: .7;
  font-size: .8em;
  margin-left: 13px;
}

.check-icon {
  position: absolute;
  right: 8px;
  top: 55%;
  transform: translateY(-50%);
}

.link.important {
  color: var(--red);
}

.link.important:hover {
  background-color: rgba(222, 89, 89, .1);
}

.blink {
  color: white !important;
  background-color: rgba(255,255,255,.1) !important;
}

.link .link-cont {
  display: flex;
  height: 100%;
  margin: 0 22px;
  align-items: center;
  justify-content: center;
}

.icon {
  position: relative;
  margin-right: 6px;
  bottom: -1.5px;
}

.photo {
  margin-right: 6px;
  transform: translate(-1px, -1px);
}

.search {
  margin-bottom: 10px;
  min-width: 250px;
  position: relative;
}

.header-link {
  margin: 8px 20px;
  width: 160px;
  transition: opacity .175s;
}

.input {
  width: 100%;
  box-sizing: border-box;
  background: none;
  border: none;
  border-radius: 0;
  font-size: 1em;
  padding: 4px;
  outline: none;
  border-bottom: 1px solid var(--fade);
}

.drop-division {
  margin: 10px 19px;
}

.division-line {
  border: 1px solid var(--light-gray);
}

.btn {
  margin: 4px 19px;
}

.absolute-btn {
  position: absolute;
  width: 100%;
  left: 0;
  bottom: 0px;
}

.abs-wrapper {
  position: relative;
  height: 35px;
  width: 100%;
  box-sizing: border-box;
}

.back-layer {
  bottom: 0;
  height: 45px;
  width: 100%;
  position: absolute;
}

.values {
  display: flex;
  flex-wrap: nowrap;
}

.abs-btn {
  position: absolute;
  left: 0;
  top: 0;
  display: block;
  transform: translateY(4px);
}

</style>
