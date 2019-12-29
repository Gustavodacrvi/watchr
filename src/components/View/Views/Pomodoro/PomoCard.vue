<template>
  <div class="PomoCard shadow">
    <div class="wrapper">
      <div class="tac">
        {{ name }}
      </div>
      <div class="cont">
        <div class="short">
          {{shortInterval}}
        </div>
        <div class="long">
          {{longInterval}}
        </div>
        <div class="duration">
          {{duration}}
        </div>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  props: ['name', 'shortInterval', 'longInterval', 'duration']
}

</script>

<style scoped>

.PomoCard {
  width: 175px;
  height: 175px;
  background-color: var(--card);
  border-radius: 18px;
}

.wrapper {
  margin: 14px;
}

</style>
