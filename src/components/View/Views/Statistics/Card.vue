<template>
  <div class="Card cursor remove-highlight shadow cb">
    <Icon class="icon"
      :icon='icon'
      color='var(--gray)'
      width='150px'
    />
    <div class="wrapper">
      <h4>
        {{title}}
      </h4>
      <div class="cont">
        {{descr}}
      </div>
      <CircleBubble class="bubble"
        innerColor='var(--light-gray)'
        outerColor='var(--gray)'
        opacity='0'
      />
    </div>
  </div>
</template>

<script>

import Icon from '@/components/Icon.vue'

export default {
  components: {
    Icon,
  },
  props: ['title', 'descr', 'icon', 'color']
}

</script>

<style scoped>

.Card {
  position: relative;
  display: inline-block;
  flex-basis: 336px;
  transform: translateY(0px);
  transition-duration: .2s;
  overflow: hidden;
  border-radius: 14px;
}

.wrapper {
  padding: 24px;
  position: relative;
  overflow: hidden;
  transition-duration: .2s;
}

.cont {
  margin-top: 16px;
}

.icon {
  position: absolute;
  left: -20px;
  top: -30px;
  opacity: .1;
}

.Card:hover {
  transform: translateY(-3px);
  background-color: var(--light-gray);
}

</style>
