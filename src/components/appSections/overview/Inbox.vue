<template>
  <div>
    <app-title :lvl='1'>Inbox</app-title>
    <p class='description'>All of your inbox tasks will be shown here. Inbox tasks aren't scheduled neither periodic and don't have tags, intervals or projects. </p>
    <div>
      <icon class='right icon-group-icon pointer circle' ico='circle' sz='medium-medium' ></icon>
      <icon class='right icon-group-icon pointer' ico='filter' sz='medium-medium' ></icon>
      <icon class='left icon-group-icon pointer' ico='search' sz='medium-medium' ></icon>
    </div>
    <adder></adder>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Title from '@/components/appComponents/Title.vue';
import Icon from '@/components/generalComponents/Icon.vue';
import Adder from '@/components/appComponents/Adder.vue';

export default Vue.extend({
  components: {
    'app-title': Title,
    'icon': Icon,
    'adder': Adder,
  },
});
</script>

<style scoped>

.description {
  padding: 18px 0;
}

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
