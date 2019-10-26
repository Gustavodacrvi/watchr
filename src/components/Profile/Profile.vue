<template>
  <div class="Profile">
    <ProfileImg class="img" src="https://cdn.vox-cdn.com/thumbor/2o-DDN0i7YmpkuvHTfgHzIRgrMk=/0x19:660x459/1200x800/filters:focal(0x19:660x459)/cdn.vox-cdn.com/uploads/chorus_image/image/49742777/Screen_Shot_2016-05-31_at_5.06.18_PM.0.0.png"/>
  </div>
</template>

<script>

import ProfileImgVue from './ProfileImg.vue'

export default {
  components: {
    ProfileImg: ProfileImgVue,
  }
}

</script>

<style scoped>

.img {
  width: 125px;
  height: 125px;
}

</style>
