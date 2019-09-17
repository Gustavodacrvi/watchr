<template>
  <div class='dropdown-input'>
    <input v-if='!allowTextArea' v-bind='attrs'
      class='margin input txt round-border gray'
      :placeholder='placeholder'
      type='text'
      autocomplete='off'
      :class='[inputClass, inputTheme, focusClass]'
      v-model.trim='value'
      @keydown='keyDown'
      @keypress='keyPressed'
      @focus='focus'
      @blur='blur'
      @keyup="keyUp"
    >
    <textarea v-else v-bind='attrs'
      class='margin input txt round-border gray area'
      :placeholder='placeholder'
      rows='1'
      type='text'
      autocomplete='off'
      :class='[inputClass, inputTheme, focusClass]'
      v-model.trim='value'
      @keydown='keyDown'
      @keypress='keyPressed'
      @focus='focus'
      @blur='blur'
      @keyup="keyUp"
    ></textarea>
    <transition name='fade'>
      <div v-if='showing && values.length > 0'
        class='dropdown round-border gray border dark scroll'
        ref='dropdown'
      >
        <transition-group>
          <span v-for='option in values'
            :ref='option'
            class='option txt dark'
            :class='[{active: selected === option}, theme]'
            :key='option'
            @click='select(option)'
          >{{ option }}</span>
        </transition-group>
      </div>
    </transition>
  </div>
</template>

<script lang='ts'>

import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { State } from 'vuex-class'
import { IndexState } from '../interfaces/store/index'

interface RefsPositions {
  drop: {
    height: number
    scroll: number,
  }
  act: {
    top: number
    height: number,
  }
}

@Component
export default class DropdownInput extends Vue {
  @State theme!: IndexState.theme

  @Prop(String) focusClass!: string
  @Prop(Boolean) disabled!: boolean
  @Prop({default: true, type: Boolean}) allowTextArea!: boolean
  @Prop({default: 'dark', type: String}) inputTheme!: string
  @Prop({default: null, type: String}) input!: string
  @Prop({default: () => [], type: Array}) values!: string[]
  @Prop({type: String}) tabindex!: string
  @Prop({type: String}) placeholder!: string[]

  showing: boolean = true
  control: boolean = false
  value: string | null = this.input
  selected: string = ''

  created() {
    this.selectFirstOne()
  }
  mounted() {
    this.fixTextAreadHeight()
  }

  selectFirstOne() {
    if (this.values[0])
      this.selected = this.values[0]
  }
  autoGrowTextarea(el: any) {
    el.style.height = '5px'
    el.style.height = (el.scrollHeight) + 'px'
  }
  keyPressed({key}: {key: string}) {
    this.fixTextAreadHeight()
    if (key === 'Enter' && this.selected === '')
      this.$emit('enter')
    else if (key === 'Enter')
      this.select(this.selected)
    this.$emit('update')
  }
  fixTextAreadHeight() {
    setTimeout(() => {
      this.autoGrowTextarea(this.$el.getElementsByClassName('area')[0])
    }, 5)
  }
  keyUp({key}: {key: string}) {
    if (key === 'Control') this.control = false
  }
  keyDown({key}: {key: string}) {
    this.fixTextAreadHeight()
    if (key === 'ArrowDown' || key === 'ArrowUp')
      this.moveSelection(key)
    else if (key === 'Control') this.control = true
    else if (key === 'ArrowLeft' || key === 'ArrowRight') {
      this.selected = ''
      if (this.control) {
        if (key === 'ArrowLeft') this.$emit('goup')
        if (key === 'ArrowRight') this.$emit('godown')
      }
    }
  }
  getRefsPositions(ref: string): RefsPositions {
    /* tslint:disable:no-string-literal */
    const drop: any = this.$refs.dropdown
    let active: any = this.$refs[ref]
    active = active[0]
    const activeHeight: number = active.clientHeight
    const activeTop: number = active.offsetTop
    const dropHeight: number = drop.clientHeight
    const scroll: number = drop.scrollTop

    return {
      act: {
        height: activeHeight,
        top: activeTop,
      },
      drop: {
        height: dropHeight,
        scroll,
      },
    }
  }
  moveSelection(key: string) {
    if (this.selected === '')
      this.selected = this.values[0]
    else {
      const index = this.values.findIndex((el: string) => {
        return el === this.selected
      })
      /* tslint:disable:no-string-literal */
      const drop: any = this.$refs['dropdown']

      if (key === 'ArrowDown' && index + 1 < this.values.length) {
        this.selected = this.values[index + 1]
        const p = this.getRefsPositions(this.selected)

        if (p.act.top + p.act.height > p.drop.height + p.drop.scroll)
          drop.scrollTop += p.act.height
      } else if (key === 'ArrowUp' && index !== 0) {
        this.selected = this.values[index - 1]
        const p = this.getRefsPositions(this.selected)

        if (p.act.top < p.drop.scroll)
          drop.scrollTop -= p.act.height
      } else if (index + 1 !== this.values.length)
        this.selected = ''
    }
  }
  select(str: string) {
    this.$emit('select', str)
    this.selected = ''
  }
  blur(): void {
    this.showing = false
    this.selected = ''
  }
  focus() {
    this.$emit('focus')
    this.showing = true
    this.selected = ''
  }

  get hasError(): boolean {
    return this.value === ''
  }
  get inputClass() {
    return [
      this.theme,
      {wrong: this.hasError && !this.disabled},
    ]
  }
  get attrs() {
    if (this.tabindex)
      return {
        ['tabindex']: this.tabindex,
      }
  }

  @Watch('input')
  onInput() {
    setTimeout(() => {
      this.value = this.input
      this.fixTextAreadHeight()
    }, 80)
  }
  @Watch('value')
  onValue() {
    this.selected = ''
    this.$emit('value', this.value)
    this.$emit('update')
  }
  @Watch('values')
  onValues() {
    this.selectFirstOne()
  }
}

</script>

<style scoped src='@/assets/css/authPopUp.css'>
</style>

<style scoped>

.area {
  resize: none;
  overflow: hidden;
  min-height: 38px;
  max-height: 100%;
}

.dropdown-input {
  position: relative;
}

.dropdown {
  position: absolute;
  top: 100%;
  width: 100%;
  max-height: 250px;
  overflow: auto;
}

.option {
  display: block;
  padding: 10px;
  cursor: pointer;
  transition: background-color .3s ease-in;
}

.option:hover, .option.active {
  transition: background-color .3s ease-out;
  background-color: #292929;
}

.option + .option {
  border-top: .5px solid #292929;
}

</style>

