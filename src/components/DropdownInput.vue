<template>
  <div class='dropdown-input'>
    <input v-if='tabindex' :tabindex='tabindex' class='margin input txt round-border gray' :placeholder='placeholder' type='text' autocomplete='off' :class='[theme, {wrong: hasError}]' v-model='value' @keypress='keyPressed'>
    <input v-else :tabindex='tabindex' class='margin input txt round-border gray' :placeholder='placeholder' type='text' autocomplete='off' :class='[theme, {wrong: hasError}]' v-model='value' @keypress='keyPressed'>
    <div class='dropdown round-border gray border' :class='theme'>
      <span class='option txt' :class='[theme,{active: option === selected}]' v-for='option in values' :key='option'>{{ option }}</span>
    </div>
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

  public value: string | null = this.input
  public selected: string = ''

  get hasError(): boolean {
    return this.value === ''
  }

  public keyPressed({key}: {key: string}): void {
    if (key === 'Enter' && this.selected === '') {
      this.$emit('enter')
    }
  }

  @Watch('input')
  onInput(): void {
    this.value = this.input
  }
  @Watch('value')
  onValue(): void {
    this.$emit('value', this.value)
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
  max-height: 300px;
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

