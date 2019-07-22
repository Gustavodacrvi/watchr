<template>
  <span
    class='checkbox txt gray round-border'
    :class='[theme, {active: value}]'
    @click="$emit('input', !value)"
  >
    {{ name }}
  </span>
</template>

<script lang='ts'>

import { Component, Vue, Prop } from 'vue-property-decorator'
import { State } from 'vuex-class'

@Component
export default class FormCheckbox extends Vue {
  @State theme!: string

  @Prop(Boolean) value!: boolean
  @Prop(String) name!: string
}

</script>

<style scoped>

.checkbox {
  display: inline-block;
  padding: 8px;
  cursor: pointer;
  transition: background-color .3s, color .3s;
}

.checkbox + .checkbox {
  margin-left: 6px;
}

.checkbox:hover {
  color: #83B7E2;
}

.active.light {
  background-color: #ffbfbd !important;
  color: #83B7E2;
}

.active.dark {
  background-color: #3B2B2A !important;
  color: #83B7E2;
}

</style>
