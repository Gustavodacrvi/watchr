<template>
  <div v-show='show'
    class='element round-border'
    :class='[theme, {active: active === name}]'
    @mouseenter='onHover = true'
    @mouseleave='onHover = false'
  >
    <div v-if='icon && iconColor'
      class='left-icon'
      :class='{handle: showHandle && !isDesktop}'
    >
      <i :class='`txt fas fa-lg fa-${icon}`' :style='[{color: iconColor}, theme]'></i>
    </div>
    <div
      class='content'
      :class='{handle: showHandle && !isDesktop}'
      v-longpress='longPress'      
      @click='singleClick'
    >
      <span class='txt name' :class='[{showall: helpIcons.length === 0}, theme]'>{{ name }}</span>
    </div>
    <div class='options' :class='theme'>
      <span v-if='number' class='help-icon number'>{{ number }}</span>
      <template v-if='helpIcons && helpIcons.length > 0'>
        <span v-for='i in helpIcons'
          class='help-icon'
          :key='i.icon'
        >
          <i :class='[`txt fade fas fa-${i.icon} fa-${i.size}`, theme]'></i>
        </span>
      </template>
      <span v-if='showOptionsMobile || showOptionsDesktop && options.length > 0' class='help-icon'>
        <icon-dropdown
          handle='ellipsis-v'
          size='lg'
          :change-color-on-hover='true'
          :centralize='true'
          min-width='225px'
        >
          <div class='drop round-border'>
            <div v-for='i in options'
              class='el'
              :key='i.name'
              :class='theme'
              @click='optionClick(i.callback)'
            >
              <span class='el-icon'>
                <i :class='[`txt fas fa-${i.icon} fa-${i.size}`, theme]'></i>
              </span>
              <span class='el-name txt' :class='theme'>
                {{ i.name }}
              </span>
            </div>
          </div>
        </icon-dropdown>
      </span>
    </div>
  </div>
</template>

<script lang='ts'>

import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { State, Getter, Mutation } from 'vuex-class'

import IconDropdown from '@/components/IconDropdown.vue'

import { ListIcon } from '../../../interfaces/app'

import { longClickDirective } from 'vue-long-click'

if (document.body.clientWidth > 992)
  Vue.directive('longpress', longClickDirective({delay: 300, interval: 5000}))
else Vue.directive('longpress', longClickDirective({delay: 1500, interval: 5000}))

@Component({
  components: {
    'icon-dropdown': IconDropdown,
  },
})
export default class ListRenderer extends Vue {
  @Mutation closeAppBar!: () => void

  @Prop({default: true, type: Boolean}) show!: boolean
  @Prop({default: 0, type: Number}) number!: boolean
  @Prop(String) name!: string
  @Prop(String) id!: string
  @Prop(String) active!: string
  @Prop(String) icon!: string
  @Prop(String) iconColor!: string
  @Prop(String) route!: string
  @Prop(Array) options!: ListIcon[]
  @Prop(Array) helpIcons!: ListIcon[]
  @Prop(Boolean) showHandle!: boolean
  @Prop(Boolean) deselectAll!: boolean

  @State theme!: string
  @Getter isDesktop!: boolean

  onHover: boolean = false
  clicked: boolean = false
  justLongPressed: boolean = false

  longPress() {
    this.justLongPressed = true
    if (!this.showHandle)
      this.select()
  }
  singleClick() {
    if (this.showHandle && !this.justLongPressed)
      this.select()
    else if (!this.showHandle && !this.justLongPressed)
      this.go()
    this.justLongPressed = false
  }
  select() {
    this.clicked = !this.clicked
    const el: HTMLElement = this.$el as HTMLElement
    this.$emit('toggle', {
      el,
      select: this.clicked,
    })
  }
  optionClick(callback: (id: string) => void) {
    this.$emit('clearselected')
    callback(this.id)
  }
  go() {
    if (!this.showHandle)
      this.$router.push(`/user?${this.route}=${this.name}`)
    if (!this.isDesktop)
      this.closeAppBar()
  }

  get showOptionsMobile(): boolean {
    return !this.isDesktop && this.options && this.options.length > 0 && !this.showHandle
  }
  get showOptionsDesktop(): boolean {
    return this.isDesktop && this.onHover
  }

  @Watch('deselectAll')
  onChange() {
    this.clicked = false
  }
}

</script>

<style scoped>

.element {
  position: relative;
  display: flex;
  height: 33px;
  cursor: pointer;
  transition: background-color .25s;
}

.content {
  height: 100%;
  width: 200px;
  display: flex;
  align-items: center;
}

.name {
  margin-left: 6px;
  max-width: 120px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.showall {
  max-width: 190px !important;
}

.options {
  position: absolute;
  right: 0;
  display: flex;
  height: 100%;
}

.left-icon {
  flex-basis: 35px;
  height: 100%;
}

.help-icon {
  display: block;
  width: 20px;
  height: 100%;
}

.left-icon, .help-icon {
  display: flex;
  justify-content: center;
  align-items: center;
}

.element.dark:hover, .active.dark {
  background-color: #282828;
}

.element.light:hover, .active.light {
  background-color: #e3e3e3;
}

.element.sortable-selected.light {
  background-color: #83B7E2 !important;
}

.element.sortable-selected.dark {
  background-color: #3287cd !important;
}

.fade {
  opacity: .6;
}

.number {
  color: #83B7E2;
}

</style>

<style scoped src='@/assets/css/drop.css'>
</style>
