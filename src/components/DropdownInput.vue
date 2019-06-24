<template>
  <div class='dropdown-input'>
    <input v-bind='attrs'
      :tabindex='tabindex'
      class='margin input txt round-border gray'
      :placeholder='placeholder'
      type='text'
      autocomplete='off'
      :class='inputClass'
      v-model.trim='value'
      @keydown='keyDown'
      @keypress='keyPressed'
      @focus='focus'
      @blur='blur'
    >
    <transition name='fade'>
      <div v-if='showing && values.length > 0'
        class='dropdown round-border gray border scroll'
        :class='theme'
        ref='dropdown'
      >
        <transition-group name='fade'>
          <span v-for='option in values'
            :ref='option'
            class='option txt'
            :class='[theme,{active: selected === option}]'
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
  @State theme!: string
  @Prop({default: null, type: String}) input!: string
  @Prop({default: () => [], type: Array}) values!: string[]
  @Prop({type: String}) tabindex!: string
  @Prop({type: String}) placeholder!: string[]

  showing: boolean = true
  value: string | null = this.input
  selected: string = ''

  keyPressed({key}: {key: string}) {
    if (key === 'Enter' && this.selected === '')
      this.$emit('enter')
    else if (key === 'Enter')
      this.select(this.selected)
    this.$emit('update')
  }
  keyDown({key}: {key: string}) {
    if (key === 'ArrowDown' || key === 'ArrowUp')
      this.moveSelection(key)
    else if (key === 'ArrowLeft' || key === 'ArrowRight')
      this.selected = ''
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
    this.showing = true
    this.selected = ''
  }

  get hasError(): boolean {
    return this.value === ''
  }
  get inputClass() {
    return [
      this.theme,
      {wrong: this.hasError},
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
    this.value = this.input
  }
  @Watch('value')
  onValue() {
    this.selected = ''
    this.$emit('value', this.value)
    this.$emit('update')
  }
}

</script>

<style scoped src='@/assets/css/authPopUp.css'>
</style>

<style scoped>

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

.dropdown.light {
  background-color: #FEFEFE;
}

.option {
  display: block;
  padding: 10px;
  cursor: pointer;
  transition: background-color .3s;
}

.option.dark:hover, .option.dark.active {
  background-color: #292929;
}

.option.light:hover, .option.light.active {
  background-color: #fc7d7d;
  color: white;
}

.option.dark + .option.dark {
  border-top: .5px solid #292929;
}

.option.light + .option.light {
  border-top: .5px solid #D9D9D9;
}

</style>

