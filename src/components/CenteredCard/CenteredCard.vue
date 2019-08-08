<template>
  <div class='wrapper-wrapper'>
    <div class='wrapper'>
      <div
        class='popup-margin'
        @click='closeCard'
      ></div>
      <div class='content'
        :style='`flex-basis: ${card.flexBasis};max-height: ${card.maxHeight}`'
      >
        <div v-if='card.type === "ListIcons"'
          class='background-color round-border list-icons dark'
        >
          <div v-if='card.search' class='margin'>
            <input
              class='input txt round-border gray dark'
              type='text'
              autocomplete='off'
              placeholder='Search...'
              v-model='search'
            >
          </div>
          <div v-for='i in list'
            class='el cancel-sortable-unselect dark'
            :key='i.name'
            @click='card.listIconHandler(i.name, i.callback);pushCenteredCard(null)'
          >
            <span v-if='i.icon' class='el-icon'>
              <i v-if='!i.iconColor' :class='`txt dark fas fa-${i.icon} fa-${i.size}`'></i>
              <i v-else :class='`txt fas fa-${i.icon} fa-${i.size} dark`' :style='{color: i.iconColor}'></i>
            </span>
            <span v-else style='width: 10px'  ></span>
            <span class='el-name txt dark'>
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

  search: string = ''

  closeCard() {
    this.pushCenteredCard(null)
  }
  get list(): ListIcon[] {
    if (!this.card) return []
    if (!this.search) return this.card.listIcons
    return this.card.listIcons.filter((el: any) => el.name.includes(this.search.toLowerCase()))
  }
}

</script>

<style scoped>

.wrapper-wrapper {
  position: fixed;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, .4);
  z-index: 999;
}

.list-icons {
  overflow: hidden;
}

.margin {
  margin: 8px;
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
  position: fixed;
  z-index: 1;
}

.content {
  position: relative;
  z-index: 2;
  overflow: auto;
}

.el {
  padding: 6px;
}

</style>

<style scoped src='@/assets/css/drop.css'>
</style>

<style scoped src='@/assets/css/authPopUp.css'>
</style>
