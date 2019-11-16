
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
            @click="l.important ? blink(l.name) : linkCallback(l.callback, l)"
            @dblclick="l.important ? linkCallback(l.callback, l) : () => {}"
          >
            <div class="link-cont">
              <Icon v-if="l.icon"
                class="cursor icon"
                :icon="l.icon"
                :color="l.color"
              />
              <input v-if="l.file" :ref="`file-icondrop-link-${l.name}`" type="file" :accept="l.accept" style="display: none" @change='handleFiles(l)'>
              <span class="name">{{ priorityParser(l.name) }}</span>
            </div>
          </div>
          <div v-else-if="l.type === 'optionsList'" :key="l.name" class="header-link hide-trans">
            <div class="header-name">{{ l.name }}</div>
            <div class="values">
              <Icon v-for="l in l.options" :key="l.id" class="val icon cursor"
                width="25px"
                :icon="l.icon"
                :color="l.color"
                :primaryHover="true"
                @click="linkCallback(l.callback, l)"
              />
            </div>
          </div>
          <div v-else-if="l.type === 'hr'" :key="l.name"
            class="drop-division hide-trans"
          ><div class="division-line hide-trans"></div></div>
        </template>
      </transition-group>
    </div>
  </div>
</template>

<script>

import { mapGetters } from 'vuex'

import Icon from './../Icon.vue'

export default {
  props: ['content'],
  components: {
    Icon,
  },
  data() {
    return {
      links: this.content,
      search: '',
    }
  },
  methods: {
    blink(ref) {
      const el = this.$refs[ref][0]
      if (el) {
        el.classList.add('blink')
        setTimeout(() => el.classList.remove('blink'), 200)
      }
    },
    linkCallback(callback, link) {
      if (link.file) this.getFile(link)
      else {
        const close = () => {
          this.$emit('close')
          this.$store.commit('clearSelected')
        }
        if (callback) {
          const opt = callback(link, this, this.$parent)
          this.$emit('update', opt)
          if (!opt || (opt && opt.then)) close()
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
    priorityParser(name) {
      const str = this.l[name]
      if (str) return str
      return name
    },
    enterItems(el, done) {
      el.style.opacity = 0
      el.style.height = '0px'
      setTimeout(() => {
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
    ...mapGetters(['l']),
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

.ListIcons {
  max-height: 360px;
}

.overflow {
  overflow: auto !important;
}

.link {
  display: flex;
  align-items: center;
  transition-duration: .2s;
  white-space: nowrap;
  height: 35px;
}

.link:hover {
  color: var(--primary);
  background-color: rgba(87,160,222,.1);
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
  margin: 0 26px;
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
  transition: opacity .2s;
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
  border-bottom: 1px solid var(--gray);
}

.drop-division {
  margin: 10px 26px;
}

.division-line {
  border: 1px solid var(--light-gray);
}

</style>