<template>
  <input
    class='margin input txt round-border gray'
    :placeholder='placeholder'
    :type='type'
    autocomplete='off'
    :class='[classArr, inputTheme ? inputTheme : theme]'
    v-model.trim='model'
    @keydown='onKeydown'
  >
</template>

<script lang='ts'>

import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { State, Mutation } from 'vuex-class'

@Component
export default class FormInput extends Vue {
  @State theme!: string

  @Prop({default: true}) value!: string | null
  @Prop({required: true, type: Number}) max!: number
  @Prop(String) type!: string | null
  @Prop(String) inputTheme!: string | null
  @Prop(String) placeholder!: string
  @Prop(Boolean) disabled!: boolean
  @Prop(Boolean) focus!: boolean
  @Prop(Boolean) keydown!: boolean

  model: string | null = null

  created() {
    this.model = this.value
  }
  mounted() {
    if (this.focus) {
      const el = this.$el as any
      el.focus()
    }
  }

  onKeydown(key: any) {
    if (this.keydown && key.key === 'Enter') this.$emit('enter')
  }

  get classArr(): any[] {
    if (this.model === null)
      return [this.theme]
    const length = this.model.length
    return [
      this.theme,
      {wrong: this.isWrong && !this.disabled},
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
