<template>
  <input
    class='margin input txt round-border gray'
    :placeholder='placeholder'
    :type='type'
    autocomplete='off'
    :class='classArr'
    v-model.trim='model'
  >
</template>

<script lang='ts'>

import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { State, Mutation } from 'vuex-class'

@Component
export default class FormInput extends Vue {
  @State theme!: string
  @Prop({required: true, type: String}) value!: string | null
  @Prop({required: true, type: Number}) max!: number
  @Prop(String) type!: string | null
  @Prop(String) placeholder!: string

  model: string | null = null

  created() {
    this.model = this.value
  }

  get classArr(): any[] {
    if (this.model === null)
      return [this.theme]
    const length = this.model.length
    return [
      this.theme,
      {wrong: this.isWrong},
    ]
  }
  get isWrong() {
    if (this.model !== null) {
      const length = this.model.length
      return length === 0 || length > this.max
    }
  }

  @Watch('value')
  onValue() {
    this.model = this.value
  }
  @Watch('model')
  onModel() {
    this.$emit('input', this.model)
    this.$emit('state', !this.isWrong)
  }
}

</script>

<style scoped src='@/assets/css/authPopUp.css'>
</style>
