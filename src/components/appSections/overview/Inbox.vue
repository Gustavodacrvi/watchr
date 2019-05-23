<template>
  <div>
    <app-title class='' :lvl='1'>Inbox</app-title>
    <div>
      <icon class='right icon-group-icon pointer circle' ico='circle' sz='medium' ></icon>
      <icon class='right icon-group-icon pointer' ico='filter' sz='medium' ></icon>
      <icon class='left icon-group-icon pointer' ico='search' sz='medium' ></icon>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Title from '@/components/appComponents/Title.vue';
import Icon from '@/components/generalComponents/Icon.vue';

export default Vue.extend({
  components: {
    'app-title': Title,
    'icon': Icon,
  },
});
</script>

<style scoped>


.icon {
  margin: 2px;
}

.right {
  float: right;
}

.left {
  float: left;
}

</style>
