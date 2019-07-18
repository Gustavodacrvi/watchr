<template>
  <div class='txt'>
    {{ label }}
  </div>
</template>

<script lang='ts'>

import { Component, Vue, Prop } from 'vue-property-decorator'

@Component
export default class LabelPerspective extends Vue {
  @Prop(String) label!: string
}

</script>
