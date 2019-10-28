
<template>
  <div class="ProfileInfo cursor rb">
    <div class="img-wrapper">
      <ProfileImg class="img" :src='photoURL'/>
    </div>
    <div class="info">
      <span v-if="displayName">{{ displayName }}</span>
      <div>
        <span>{{ email }}</span>
        <span v-if="pending" class="tag">{{ l['pending'] }}</span>
      </div>
    </div>
  </div>
</template>

<script>

import ProfileImgVue from './ProfileImg.vue'

import { mapGetters } from 'vuex'

export default {
  props: ['displayName', 'photoURL', 'src', 'email', 'pending'],
  components: {
    ProfileImg: ProfileImgVue,
  },
  computed: {
    ...mapGetters(['l']),
  }
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

.tag {
  margin-left: 6px;
  background-color: var(--primary);
  color: white;
  display: inline-block;
  padding: 2px;
  font-size: .8em;
  border-radius: 6px;
  transform: translateY(-10px);
}

</style>
