<template>
  <div class="SlimModeNav" :class="{render}">
    asçlkjdf
    {{render}}
  </div>  
</template>

<script>

export default {
  props: ['render'], 
}

</script>

<style scoped>

.SlimModeNav {
  margin: 0;
  transition: margin .4s;
  transform: translateY(0px);
}

.SlimModeNav.render {
  margin-bottom: 35px;
  transform: translateY(-20px);
}


</style>
