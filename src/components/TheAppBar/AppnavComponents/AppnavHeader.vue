<template>
  <div>
    <transition name='fade' mode='out-in'>
      <div key='header' v-if='showTitle' class='header title'>
        <span class='title'>{{ name }}</span>
      </div>
      <div key='options' v-else class='header options'>
        <i v-for='i in icons'
          :key='i.name'
          :class='`icon pointer header-icon fas fa-${i.icon} fa-${i.size}`'
          @click='i.callback'
        ></i>
      </div>
    </transition>
  </div>
</template>

<script lang='ts'>

import { Component, Vue, Prop } from 'vue-property-decorator'

import { ListIcon } from '../../../interfaces/app'

@Component
export default class AppnavHeader extends Vue {
  @Prop({type: String, required: true}) name!: string
  @Prop({type: Boolean, required: true}) showTitle!: boolean
  @Prop({type: Array, required: true}) icons!: ListIcon[]
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
