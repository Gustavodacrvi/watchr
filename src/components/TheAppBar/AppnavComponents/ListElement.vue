<template>
  <div
    class='element round-border'
    :class='[theme, {active: active === name}]'
    @mouseenter='onHover = true'
    @mouseleave='onHover = false'
  >
    <div v-if='icon && iconColor'
      class='left-icon'
      :class='{handle: showHandle && !isDesktop}'
      @click='toggleElement'
    >
      <dynamic-ft-icon
        class='txt'
        size='lg'
        :icon='icon'
        :style='{color: iconColor}'
      />
    </div>
    <div
      class='content'
      :class='{handle: showHandle && !isDesktop}'
      @click='toggleElement'
    >
      <span class='txt name'>{{ name }}</span>
    </div>
    <div class='options'>
      <template v-if='helpIcons && helpIcons.length > 0'>
        <span v-for='i in helpIcons'
          class='help-icon'
          :key='i.icon'
        >
          <dynamic-ft-icon
            class='txt fade'
            :icon='i.icon'
            :size='i.size'
          />
        </span>
      </template>
      <span v-if='showOptionsMobile || showOptionsDesktop && options.length > 0' class='help-icon'>
      <icon-dropdown
        handle='ellipsis-v'
        size='lg'
        :change-color-on-hover='true'
        min-width='200px'
      >
        <div class='drop round-border'>
          <div v-for='i in options'
            class='el'
            :key='i.name'
            :class='theme'
            @click='optionClick(i.callback)'
          >
            <span class='el-icon'>
              <dynamic-ft-icon
                class='txt'
                :icon='i.icon'
                :size='i.size'
              />
            </span>
            <span class='el-name txt'>
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
import { State, Getter } from 'vuex-class'

import FontAwesome from '@/components/DynamicFontawesome.vue'
import IconDropdown from '@/components/IconDropdown.vue'

import { library } from '@fortawesome/fontawesome-svg-core'
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons'

library.add(faEllipsisV)

import { ListIcon } from '../../../interfaces/app'

@Component({
  components: {
    'dynamic-ft-icon': FontAwesome,
    'icon-dropdown': IconDropdown,
  },
})
export default class ListRenderer extends Vue {
  @Prop(String) name!: string
  @Prop(String) id!: string
  @Prop(String) active!: string
  @Prop(String) icon!: string
  @Prop(String) iconColor!: string
  @Prop(Array) options!: ListIcon[]
  @Prop(Array) helpIcons!: ListIcon[]
  @Prop(Boolean) showHandle!: boolean
  @Prop(Boolean) deselectAll!: boolean

  @State theme!: string
  @Getter isDesktop!: boolean

  onHover: boolean = false
  clicked: boolean = false

  toggleElement() {
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
  flex-basis: 100%;
  display: flex;
  align-items: center;
}

.name {
  margin-left: 6px;
}

.options {
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

.icon-dropdown, .left-icon, .help-icon {
  display: flex;
  justify-content: center;
  align-items: center;
}

.element.dark:hover, .sortable-selected.dark, .active.dark {
  background-color: #282828;
}

.element.light:hover, .sortable-selected.light, .active.light {
  background-color: #e3e3e3;
}

.fade {
  opacity: .6;
}

</style>

<style scoped src='@/assets/css/drop.css'>
</style>
