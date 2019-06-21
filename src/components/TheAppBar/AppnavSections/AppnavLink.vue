<template>
  <div class='list-el' :class='platform'>
    <v-touch :enabled='!isDesktop' @panleft='panLeftEvent' @panright='panRightEvent' @panend='panend' @panstart='panstart' :pan='{direction: "horizontal"}'>
      <div class='round-border visible'>
        <div class='back' v-if='!isDesktop'>
          <div class='back-icons'>
            <icon icon='thumbtack' size='1x' color='white'></icon>
            <icon icon='thumbtack' size='1x' color='white'></icon>
          </div>
        </div>
        <div class='content gray' ref='content' :class='[theme, {active: obj[content] === active, blinking: blinking}]'>
          <span class='left-icon' v-if='obj.icon'>
            <icon v-if='obj.iconColor' :icon='obj.icon' :color='obj.iconColor'></icon>
            <icon v-else :icon='obj.icon'></icon>
          </span>
          <span class='txt name'>{{ obj[content] }}</span>
          <span class='icons'>
            <icon v-if='obj[sublist] && obj[sublist].length > 0' icon='angle-right' :class='{showing: showing}' size='1x' @click='showing = !showing'></icon>
          </span>
        </div>
      </div>
    </v-touch>
    <transition name='fade'>
      <div v-if='showing && obj[sublist] && obj[sublist].length > 0' class='drop'>
        <link-render :sublist='sublist' :content='content' :active='active' :list='obj[sublist]' @update='update'></link-render>
      </div>
    </transition>
  </div>
</template>

<script lang='ts'>

import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { State, Getter } from 'vuex-class'

import FontAwesomeIcon from '@/components/FontAwesomeIcon.vue'

import VueTouch from 'vue-touch'
Vue.use(VueTouch, {name: 'v-touch'})

import { PanGesture } from '@/interfaces/app'

@Component({
  components: {
    'link-render': () => import('@/components/TheAppBar/AppnavSections/AppnavLinkrenderer.vue'),
    'icon': FontAwesomeIcon,
  },
})
export default class AppnavLink extends Vue {
  @State('theme') public readonly theme!: string
  @Getter('isDesktop') public readonly isDesktop!: boolean
  @Getter('platform') public readonly platform!: string
  @Prop({required: true}) public readonly obj!: any
  @Prop({required: true}) public readonly content!: string
  @Prop({required: true}) public readonly sublist!: string
  @Prop({required: true}) public readonly active!: string

  @Prop() public readonly leftpan!: PanGesture
  @Prop() public readonly rightpan!: PanGesture

  public showing: boolean = false
  public div: any = null
  public direction: string | null = null
  public blinking: boolean = false

  public mounted(): void {
    /* tslint:disable:no-string-literal */
    this.div = this.$refs['content']
  }

  public update({arr}: any): void {
    this.$emit('update', {arr, id: this.obj.id})
  }

  public panRightEvent(e: any): void {
    if (this.leftpan) {
      this.div.style.left = e.distance + 'px'
      this.div.style.right = 'unset'
      this.direction = 'right'
    }
  }
  public panLeftEvent(e: any): void {
    if (this.rightpan) {
      this.div.style.right = e.distance + 'px'
      this.div.style.left = 'unset'
      this.direction = 'left'
    }
  }
  public panstart(): void {
    this.div.style.transition = 'background-color .3s'
  }
  public panend(): void {
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
  public blink(): void {
    this.blinking = true
    setTimeout(() => {
      this.blinking = false
    }, 200)
  }
}

</script>

<style scoped>

.drop {
  margin-left: 10px;
}

.list-el {
  position: relative;
  margin-top: 2px;
}

.list-el .visible {
  position: relative;
  cursor: pointer;
  overflow: hidden;
  height: 40px;
}

.list-el .back {
  position: absolute;
  height: 93%;
  width: 99%;
  border-radius: 10px;
  left: 1px;
  bottom: 1px;
  display: flex;
  align-items: center;
  background-color: #AF92F7;
  transition: background-color .3s;
  z-index: 1;
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
  display: flex;
  z-index: 2;
  right: 0px;
  align-items: center;
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
  display: flex;
  align-items: center;
}

.list-el .content.light:hover, .list-el .content.light.active {
  background-color: #E6E6E6;
}

.list-el .content.dark:hover, .list-el .content.dark.active {
  background-color: #282828;
}

</style>

