<template>
  <div>
    <transition name='fade' mode='out-in'>
      <div key='header' v-if='showTitle' class='header title' :class='{margin: !isDesktop}'>
        <span class='title'>{{ name }}</span>
      </div>
      <div key='options' v-else class='header options'>
        <i v-for='i in icons'
          :key='i.name'
          :class='[`icon txt pointer header-icon fas fa-${i.icon} fa-${i.size}`, theme]'
          @click='i.callback'
        ></i>
      </div>
    </transition>
  </div>
</template>

<script lang='ts'>

import { Component, Vue, Prop } from 'vue-property-decorator'
import { State, Getter } from 'vuex-class'

import { ListIcon } from '../../../interfaces/app'
import { IndexState, IndexGetters } from '../../../interfaces/store/index'

@Component
export default class AppnavHeader extends Vue {
  @State theme!: IndexState.theme
  @Getter isDesktop!: IndexGetters.IsDesktop

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

.header.margin {
  margin: 8px 0;
}

.header .title {
  color: #83B7E2;
  font-size: 1.1em;
}


</style>
