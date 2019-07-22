<template>
  <div class='form-options'>
    <div class='header-wrapper round-border border-card' :class='[theme, {open: showing}]' @click='showing = !showing'>
      <div class='header'>
        <span class='txt' :class='theme'>
          {{ selected }}
        </span>
        <span class='icon'>
          <i class='fas fa-angle-right fa-sm' :class='{rotate: showing}'></i>
        </span>
      </div>
    </div>
    <transition name='fade'>
      <div v-if='showing'
        class='drop wrapper card round-border scroll'
        :class='theme'
        :style="{'max-height': maxHeight}"
      >
        <div class='inner'>
          <input v-if='enableSearch'
            class='margin input txt round-border gray'
            type='text'
            autocomplete='off'
            placeholder='Search...'
            v-model='search'
            :class='theme'
          >
          <div v-for='str in getOptions'
            class='el round-border'
            :class='[theme, {selected: str === selected}]'
            :key='str'
            @click="$emit('select', str);showing = false"
          >
            <span class='el-name' style='margin-left: 4px'>{{ str }}</span>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script lang='ts'>

import { Component, Vue, Prop } from 'vue-property-decorator'
import { State } from 'vuex-class'

import appUtils from '@/utils/app'

@Component
export default class FormOptions extends Vue {
  @State theme!: string

  @Prop({default: false, type: Boolean}) enableSearch!: boolean
  @Prop({default: false, type: Boolean}) parse!: boolean
  @Prop(String) selected!: string
  @Prop(String) maxHeight!: string
  @Prop(Array) options!: string[]

  showing: boolean = false
  search: string = ''

  created() {
    window.addEventListener('click', this.click)
  }
  beforeDestroy() {
    window.removeEventListener('click', this.click)
  }

  click(evt: any) {
    const el = this.$el
    if (!evt.path.includes(el))
      this.showing = false
  }

  get getOptions(): string[] {
    if (!this.parse)
      return this.options.filter(el => el.includes(this.search))
    return this.options.filter(el => el.includes(this.search)).map(el => appUtils.parseMomentTimeZone(el))
  }
}

</script>

<style scoped>

.header-wrapper.dark:hover, .header-wrapper.dark.open {
  background-color: #282828;
}

.header-wrapper.light:hover, .header-wrapper.light.open {
  background-color: #e3e3e3;
}

.form-options {
  position: relative;
}

.header-wrapper {
  cursor: pointer;
  transition: background-color .3s;
}

.drop.wrapper {
  overflow: auto !important;
}

.inner {
  margin: 6px;
}

.header {
  margin: 8px;
  position: relative;
}

.icon {
  position: absolute;
  right: 3px;
  top: 50%;
  transform: translateY(-50%);
}

.fas {
  transition: transform .3s; 
}

.rotate {
  transform: rotate(-90deg);
}

.drop {
  position: absolute;
  width: 100%;
  top: 115%;
}

</style>

<style scoped src='@/assets/css/authPopUp.css'>
</style>

<style scoped src='@/assets/css/drop.css'>
</style>
