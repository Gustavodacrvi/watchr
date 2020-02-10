
<template>
  <div class="ListIcons scroll-thin" :class="{overflow: links.allowSearch}">
    <div class="links" ref='main-content'>
      <div v-if="links.allowSearch" class="search hide-trans">
        <input class="input"
          :value="search"
          @input="v => search = v.target.value"
        >
      </div>
      <transition-group
        @enter='enterItems'
        @leave='leaveItems'
      >
        <template v-for="l in getLinks">
          <div v-if="!l.type" class="link cursor hide-trans"
            :class="{important: l.important}"
            :key="l.name"
            :ref="l.name"
            @click="linkClick(l)"
            @dblclick="l.important ? linkCallback(l.callback, l) : () => {}"
          >
            <div class="link-cont">
              <Icon v-if="l.icon"
                class="cursor icon"
                :icon="l.icon"
                :color="l.color"
              />
              <input v-if="l.file" :ref="`file-icondrop-link-${l.name}`" type="file" :accept="l.accept" style="display: none" @change='handleFiles(l)'>
              <span class="name" v-html="l.name"></span>
              <Icon v-if="select && selected.includes(l.name)"
                class='check-icon'
                icon='check'
              />
            </div>
            <CircleBubble
              innerColor='rgba(87,160,222,.1)'
              outerColor='var(--primary)'
              opacity='0'
            />
          </div>
          <div v-else-if="l.type === 'optionsList'" :key="l.name" class="header-link hide-trans">
            <div class="header-name">{{ l.name }}</div>
            <div class="values">
              <Icon v-for="l in l.options" :key="l.id" class="val primary-hover icon cursor"
                width="25px"
                :icon="l.icon"
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
              <ButtonApp
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
      <div style="height: 40px"></div>
      <div class="absolute-btn">
        <div class="abs-wrapper">
          <div class="back-layer"></div>
          <ButtonApp class="abs-btn"
            type='tiny'
            value='Save'
            @click='saveSelected'
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>

import Icon from './../Icon.vue'
import ButtonApp from '@/components/Auth/Button.vue'

import { mapGetters } from 'vuex'


export default {
  props: ['content'],
  components: {
    Icon, ButtonApp,
  },
  data() {
    return {
      links: this.content,
      search: '',
      selected: [],
    }
  },
  created() {
    if (this.select && this.links.selected)
      this.selected = this.links.selected.slice()
  },
  methods: {
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
            const opt = callback(link, this, this.$parent)
            if (!opt || (opt && opt.then)) close()
            else this.$emit('update', opt)
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
        el.style.height = '35px'
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
  max-height: 395px;
}

.overflow {
  overflow: auto !important;
}

.link {
  display: flex;
  align-items: center;
  transition-duration: .15s;
  white-space: nowrap;
  height: 32px;
  border-radius: 8px;
  margin: 0 18px;
  overflow: hidden;
  position: relative;
}

.link:hover {
  color: var(--primary);
  background-color: rgba(87,160,222,.1);
}

.link:hover .check-icon {
  color: var(--primary) !important;
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
  margin: 0 12px;
  align-items: center;
  justify-content: center;
}

.icon {
  position: relative;
  margin-right: 8px;
  bottom: -1.5px;
}

.search {
  margin: 0 12px;
  margin-bottom: 18px;
  min-width: 250px;
  position: relative;
}

.header-link {
  margin: 8px 26px;  
  width: 160px;
  transition: opacity .15s;
}

.input {
  width: 100%;
  box-sizing: border-box;
  background: none;
  border: none;
  border-radius: 0;
  font-size: 1em;
  padding: 8px;
  outline: none;
  border-bottom: 1px solid var(--fade);
}

.drop-division {
  margin: 10px 26px;
}

.division-line {
  border: 1px solid var(--light-gray);
}

.btn {
  margin: 4px 26px;
}

.absolute-btn {
  position: absolute;
  width: 100%;
  left: 0;
  bottom: 6px;
  padding: 0 18px;
}

.abs-wrapper {
  position: relative;
  height: 45px;
  width: 100%;
  box-sizing: border-box;
}

.back-layer {
  bottom: 0;
  height: 55px;
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
  margin-bottom: 6px;
}

</style>
