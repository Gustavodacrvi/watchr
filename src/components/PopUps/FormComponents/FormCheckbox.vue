<template>
  <span
    class='checkbox txt gray round-border'
    :class='[theme, {active: value, "non-active": !value}]'
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
  border: none;
  transition: border .3s, color .3s, background-color .3s;;
}

.checkbox + .checkbox {
  margin-left: 6px;
}

.checkbox:hover {
  color: #83B7E2;
  background-color: #83B7E2;
}

.checkbox.active:hover {
  color: white !important;
}

.active {
  color: #83B7E2;
  border: 1px solid #83B7E2;
}

</style>
