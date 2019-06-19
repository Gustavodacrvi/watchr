<template>
  <div class='dropdown-input'>
    <input v-if='tabindex' :tabindex='tabindex' class='margin input txt round-border gray' :placeholder='placeholder' type='text' autocomplete='off' :class='[theme, {wrong: hasError}]' v-model='value' @keydown='keyDown' @keypress='keyPressed' @focus='showing = true' @blur='showing = false'>
    <input v-else :tabindex='tabindex' class='margin input txt round-border gray' :placeholder='placeholder' type='text' autocomplete='off' :class='[theme, {wrong: hasError}]' v-model='value' @keydown='keyDown' @keypress='keyPressed'  @focus='showing = true' @blur='showing = false'>
    <transition name='fade'>
      <div v-if='showing' class='dropdown round-border gray border' :class='theme'>
        <transition-group name='fade'>
          <span class='option txt' :class='[theme,{active: option === selected}]' v-for='option in values' :key='option' @click='select(option)'>{{ option }}</span>
        </transition-group>
      </div>
    </transition>
  </div>
</template>

<script lang='ts'>

import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { State } from 'vuex-class'

@Component
export default class DropdownInput extends Vue {
  @State('theme') public readonly theme!: string
  @Prop({default: null, type: String}) public readonly input!: string
  @Prop({default: () => [], type: Array}) public readonly values!: string[]
  @Prop({type: String}) public readonly tabindex!: string[]
  @Prop({type: String}) public readonly placeholder!: string[]

  public showing: boolean = true
  public value: string | null = this.input
  public selected: string = ''

  get hasError(): boolean {
    return this.value === ''
  }

  public keyPressed({key}: {key: string}): void {
    if (key === 'Enter' && this.selected === '') {
      this.$emit('enter')
    } else if (key === 'Enter') {
      this.select(this.selected)
    }
    this.$emit('update')
  }
  public keyDown({key}: {key: string}): void {
    this.moveSelection(key)
  }
  public moveSelection(key: string): void {
    const index = this.values.findIndex((el: string) => {
      return el === this.selected
    })
    if (key === 'ArrowDown') {
      if (this.selected === '') {
        this.selected = this.values[0]
      } else {
        if (index + 1 < this.values.length) {
          this.selected = this.values[index + 1]
        } else {
          this.selected = ''
        }
      }
    } else if (key === 'ArrowUp') {
      if (this.selected === this.values[0]) {
        this.selected = ''
      } else {
        if (index !== 0) {
          this.selected = this.values[index - 1]
        }
      }
    }
  }
  public select(str: string): void {
    this.$emit('select', str)
    this.selected = ''
  }

  @Watch('input')
  public onInput(): void {
    this.value = this.input
  }
  @Watch('value')
  public onValue(): void {
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
  overflow: hidden;
}

.option {
  display: block;
  padding: 10px;
  cursor: pointer;
  transition: background-color .3s;
}

.option:hover, .option.active {
  background-color: #292929;
}

.option.dark + .option.dark {
  border-top: .5px solid #292929;
}

.option.light + .option.light {
  border-top: .5px solid #D9D9D9;
}

</style>

