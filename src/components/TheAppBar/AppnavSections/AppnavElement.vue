<template>
  <div class='list-el' :class='[platform, theme]'>
    <v-touch :enabled='!isDesktop' @panleft='panLeftEvent' @panright='panRightEvent' @panend='panend' @panstart='panstart' :pan='{direction: "horizontal"}'>
      <div class='round-border visible'>
        <div class='back' v-if='!isDesktop'>
          <div class='back-icons'>
            <ft-icon-dynamic class='margin icon txt pointer' :icon='obj.icon' size='1x' :style="{color: 'white'}"></ft-icon-dynamic>
          </div>
        </div>
        <div class='content gray' ref='content' :class='[theme, {active: obj[content] === active, blinking: blinking}]'>
          <span class='left-icon' v-if='obj.icon'>
            <ft-icon-dynamic v-if='obj.iconColor' class='margin icon txt pointer' :icon='obj.icon' :style="{color: obj.iconColor}"></ft-icon-dynamic>
            <ft-icon-dynamic v-else class='margin icon txt pointer' :icon='obj.icon'></ft-icon-dynamic>
          </span>
          <span class='txt name'>{{ obj[content] }}</span>
          <span class='icons'>
            <span v-for='i in icons' :key='i.icon' class='nav-icon'>
              <ft-icon-dynamic class='angle-right margin icon txt pointer' :icon='i.icon' :size='i.size' :class='{sublist: showingSublists}'></ft-icon-dynamic>
            </span>
            <span v-if='obj[sublist] && obj[sublist].length > 0' class='nav-icon' @click='showingSublists = !showingSublists'>
              <ft-icon-dynamic class='angle-right margin icon txt pointer' icon='angle-right' :class='{sublist: showingSublists}' size='1x'></ft-icon-dynamic>
            </span>
            <span v-if='options && options.length > 0' class='nav-icon'>
              <icon-drop minwidth='150px' handle='ellipsis-v' :expand='true' :click='true'>
                <div class='dropdown round-border'>
                  <div class='wrapper'>
                    <div v-for='i in options' :key='i.name' class='drop-el' @click='i.callback(obj)' :class='theme'>
                      <span class='drop-icon'>
                        <ft-icon-dynamic class='margin icon txt pointer' :icon='i.icon' :size='i.size' :style="{color: i.color}"></ft-icon-dynamic>
                      </span>
                      <span class='drop-name txt'>{{ i.name }}</span>
                    </div>
                  </div>
                </div>
              </icon-drop>
            </span>
          </span>
        </div>
      </div>
    </v-touch>
    <transition name='fade'>
      <div v-if='showingSublists && obj[sublist] && obj[sublist].length > 0' class='drop'>
        <list-render :sublist='sublist' :content='content' :active='active' :list='obj[sublist]' @update='update' :options='optionsrender' :icons='iconsrender'></list-render>
      </div>
    </transition>
  </div>
</template>

<script lang='ts'>

import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { State, Getter } from 'vuex-class'

import DynamicFontawesome from '@/components/DynamicFontawesome.vue'
import IconDropdown from '@/components/IconDropdown.vue'

import VueTouch from 'vue-touch'
Vue.use(VueTouch, {name: 'v-touch'})

import { library } from '@fortawesome/fontawesome-svg-core'
import { faEllipsisV, faAngleRight, faThumbtack, faDownload } from '@fortawesome/free-solid-svg-icons'

library.add(faEllipsisV, faAngleRight, faThumbtack)

import { PanGesture, ListIcon } from '@/interfaces/app'

@Component({
  components: {
    'icon-drop': IconDropdown,
    'ft-icon-dynamic': DynamicFontawesome,
    'list-render': () => import('@/components/TheAppBar/AppnavSections/AppnavListrenderer.vue'),
  },
})
export default class AppnavLink extends Vue {
  @Prop({required: true, type: Object}) obj!: any
  @Prop({required: true, type: String}) content!: string
  @Prop({required: true, type: String}) sublist!: string
  @Prop({required: true, type: String}) active!: string
  @Prop(Array) icons!: ListIcon[]
  @Prop(Array) options!: ListIcon[]
  @Prop(Object) leftpan!: PanGesture
  @Prop(Object) rightpan!: PanGesture
  @Prop({default: () => [], type: Function}) iconsrender!: (obj: any) => ListIcon[]
  @Prop({default: () => [], type: Function}) optionsrender!: (obj: any) => ListIcon[]

  @State theme!: string
  @Getter isDesktop!: boolean
  @Getter platform!: string

  showingSublists: boolean = false
  div: any = null
  direction: string | null = null
  blinking: boolean = false

  mounted() {
    this.div = this.$refs.content
  }

  update({arr}: any) {
    this.$emit('update', {arr, id: this.obj.id})
  }
  panRightEvent(e: any) {
    if (this.leftpan) {
      this.div.style.left = e.distance + 'px'
      this.div.style.right = 'unset'
      this.direction = 'right'
    }
  }
  panLeftEvent(e: any) {
    if (this.rightpan) {
      this.div.style.right = e.distance + 'px'
      this.div.style.left = 'unset'
      this.direction = 'left'
    }
  }
  panstart() {
    this.div.style.transition = 'background-color .3s'
  }
  panend() {
    this.div.style.transition = 'background-color .3s, right .3s, left .3s'
    if (this.direction === 'left' && this.rightpan) {
      if (parseInt(this.div.style.right, 10) > this.rightpan.distance) {
        this.$emit('panevent', {type: 'right', id: this.obj.id})
        this.blink()
      }

      this.div.style.right = '0px'
    } else if (this.direction === 'right' && this.leftpan) {
      if (parseInt(this.div.style.left, 10) > this.leftpan.distance) {
        this.$emit('panevent', {type: 'left', id: this.obj.id})
        this.blink()
      }
      this.div.style.left = '0px'
    }
  }
  blink(): void {
    const BLINK_TRANSITION_DURATION = 200
    this.blinking = true
    setTimeout(() => {
      this.blinking = false
    }, BLINK_TRANSITION_DURATION)
  }
}

</script>

<style scoped>

.nav-icon, .list-el .back, .list-el .content, .list-el .icons, .drop-el {
  display: flex;
  align-items: center;
}

.drop {
  margin-left: 10px;
}

.list-el {
  position: relative;
  margin-top: 2px;
}

.angle-right {
  transition: transform .3s;
}

.angle-right.sublist {
  transform: rotate(90deg);
}

.nav-icon {
  justify-content: flex-end;
  height: 100%;
  width: 20px;
  cursor: pointer;
}

.nav-icon:hover .fas {
  color: #fc7d7d !important;
}

.list-el .visible {
  position: relative;
  cursor: pointer;
  height: 35px;
}

.list-el .back {
  position: absolute;
  height: 93%;
  width: 99%;
  border-radius: 10px;
  left: 1px;
  bottom: 1px;
  background-color: #fc7d7d;
  transition: background-color .3s;
}

.list-el .blinking {
  background-color: white !important;
}

.back-icons {
  margin: 10px;
  width: 100%;
  display: flex;
  justify-content: space-between;
}

.list-el .content {
  position: relative;
  right: 0px;
  height: 100%;
  width: 100%;
  border-radius: 10px;
  transition: background-color .3s;
}

.list-el .left-icon {
  text-align: center;
  width: 30px;
}

.list-el .name {
  margin-left: 6px;
}

.list-el .icons {
  position: absolute;
  height: 100%;
  right: 8px;
}

.list-el .content.light:hover, .list-el .content.light.active, .sortable-selected.light .content {
  background-color: #E6E6E6 !important;
}

.list-el .content.dark:hover, .list-el .content.dark.active,  .sortable-selected.dark .content {
  background-color: #282828 !important;
}

.dropdown {
  overflow: hidden;
}

.drop-el {
  height: 35px;
  width: 100%;
  transition: background-color .3s;
}

.drop-icon {
  width: 39px;
  text-align: center;
}

.drop-name {
  white-space: nowrap;
  margin-right: 12px;
}

.drop-el.light:hover {
  background-color: #E6E6E6;
}

.drop-el.dark:hover {
  background-color: #282828;
}

</style>

