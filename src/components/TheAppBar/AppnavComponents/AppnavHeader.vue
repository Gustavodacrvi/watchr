<template>
  <div>
    <div v-show='showTitle' class='header title'>
      <span class='title'>{{ name }}</span>
    </div>
    <div v-show='!showTitle' class='header options'>
      <dynamic-ft-icon v-for='i in icons'
        class='icon pointer header-icon'
        :key='i.name'
        :icon='i.icon'
        :size='i.size'
        @click='i.callback(selected)'
      />
    </div>
  </div>
</template>

<script lang='ts'>

import { Component, Vue, Prop } from 'vue-property-decorator'

import FontAwesome from '@/components/DynamicFontawesome.vue'

import { ListIcon } from '../../../interfaces/app'

@Component({
  components: {
    'dynamic-ft-icon': FontAwesome,
  },
})
export default class AppnavHeader extends Vue {
  @Prop({type: String, required: true}) name!: string
  @Prop({type: Boolean, required: true}) showTitle!: boolean
  @Prop({type: Array, required: true}) icons!: ListIcon[]
  @Prop({type: Array, required: true}) selected!: string[]
}

</script>

<style scoped>


.header {
  height: 32px;
  display: flex;
  align-items: center;
}

.header.options {
  justify-content: flex-start;
}

.header-icon + .header-icon {
  margin-left: 6px;
}

.header.title {
  justify-content: center;
}

.header .title {
  color: #fc7d7d;
  font-size: 1.1em;
}


</style>
