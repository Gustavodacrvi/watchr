<template>
  <div class='wrapper-wrapper'>
    <div class='wrapper'>
      <div
        class='popup-margin'
        @click='closeCard'
      ></div>
      <div class='content'
        :style='`flex-basis: ${card.flexBasis}`'
      >
        <div v-if='card.isListIcon'
          class='gray round-border list-icons'
          :class='theme'
        >
          <div v-for='i in card.listIcons'
            class='el cancel-sortable-unselect'
            :key='i.name'
            :class='theme'
            @click='optionClick(i.name, i.callback)'
          >
            <span class='el-icon'>
              <i v-if='!i.iconColor' :class='[`txt fas fa-${i.icon} fa-${i.size}`, theme]'></i>
              <i v-else :class='[`txt fas fa-${i.icon} fa-${i.size}`, theme]' :style='{color: i.iconColor}'></i>
            </span>
            <span class='el-name txt' :class='theme'>
              {{ i.name }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang='ts'>

import { Component, Vue } from 'vue-property-decorator'
import { Mutation, State } from 'vuex-class'

import { ListIcon } from '../../interfaces/app'
import { CenteredCard } from '@/store/index'

@Component
export default class CenteredCardComp extends Vue {
  @State theme!: string
  @State('centeredCard') card!: CenteredCard | null
  @Mutation pushCenteredCard!: (card: CenteredCard | null) => void

  closeCard() {
    console.log(3)
    this.pushCenteredCard(null)
  }
}

</script>

<style scoped>

.wrapper-wrapper {
  position: absolute;
  width: 100%;
  background-color: rgba(0, 0, 0, .4);
  height: 100%;
  z-index: 999;
}

.list-icons {
  overflow: hidden;
}

.wrapper {
  height: 100%;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.popup-margin {
  height: 100%;
  width: 100%;
  top: 0;
  position: absolute;
  z-index: 1;
}

.content {
  position: relative;
  z-index: 2;
}

.el {
  padding: 6px;
}

</style>

<style scoped src='@/assets/css/drop.css'></style>

