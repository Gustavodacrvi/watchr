<template>
  <div class="SlimModeNav" :class="{render}">
    <Sidebar
      :value='viewNameValue'
      width='100%'
      :slimMode='true'
      :sidebarHided='false'
      :pressingHandle='false'
      :disableSearch='true'
      :removeHandle='true'
      :removeBacklayer='true'
      :removeFooter='true'
    />
  </div>
</template>

<script>

import Sidebar from "@/components/Sidebar/Sidebar.vue"

export default {
  components: {
    Sidebar,
  },
  props: ['render', 'viewNameValue'], 
}

</script>

<style scoped>

.SlimModeNav {
  margin: 0;
  position: relative;
  transition: margin .4s;
  transform: translateY(0px);
  z-index: 5000;
}

.SlimModeNav.render {
  margin-bottom: 35px;
  transform: translateY(-20px);
}

.slim-sidebar {
  position: absolute;
  top: 0;
  width: 100%;
}

</style>
