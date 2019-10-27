
<template>
  <div class="ProfileInfo cursor rb">
    <div class="img-wrapper">
      <ProfileImg class="img" :src='photoURL'/>
    </div>
    <div class="info">
      <span v-if="displayName">{{ displayName }}</span>
      <span>{{ email }}</span>
    </div>
  </div>
</template>

<script>

import ProfileImgVue from './ProfileImg.vue'

export default {
  props: ['displayName', 'photoURL', 'src', 'email'],
  components: {
    ProfileImg: ProfileImgVue,
  },
}

</script>

<style scoped>

.ProfileInfo {
  height: 40px;
  display: flex;
  transition-duration: .2s;
}

.ProfileInfo:hover {
  background-color: var(--light-gray);
}

.img-wrapper {
  height: 100%;
  flex-basis: 35px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.info {
  height: 100%;
  flex-basis: 100%;
  margin-left: 8px;
  display: flex;
  justify-content: space-around;
  flex-direction: column;
}

.img {
  width: 25px;
  height: 25px;
}

</style>
