<template>
  <div class='dropdown-input'>
    <input v-if='tabindex' :tabindex='tabindex' class='margin input txt round-border gray' :placeholder='placeholder' type='text' autocomplete='off' :class='[theme, {wrong: hasError}]' v-model='value'>
    <input v-else :tabindex='tabindex' class='margin input txt round-border gray' :placeholder='placeholder' type='text' autocomplete='off' :class='[theme, {wrong: hasError}]' v-model='value'>
  </div>
</template>

<script lang='ts'>

import { Vue, Component, Prop } from 'vue-property-decorator'
import { State } from 'vuex-class'

@Component
export default class DropdownInput extends Vue {
  @Prop({default: () => [], type: Array}) public readonly values!: string[]
  @Prop({type: String}) public readonly tabindex!: string[]
  @Prop({type: String}) public readonly placeholder!: string[]
  @State('theme') public readonly theme!: string

  public value: string | null = null
  public selected: string = ''

  get hasError(): boolean {
    return this.value === ''
  }

  public keyPressed({key}: {key: string}): void {
    if (key === 'Enter' && this.selected === '') {
      this.$emit('enter')
    }
  }
}

</script>

<style scoped src='@/assets/css/authPopUp.css'>
</style>
