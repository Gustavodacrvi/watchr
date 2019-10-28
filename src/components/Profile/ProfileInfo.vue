
<template>
  <div class="ProfileInfo cursor rb"
    @mouseenter="hover = true"
    @mouseleave="hover = false"
  >
    <div class="img-wrapper">
      <ProfileImg class="img" :src='photoURL'/>
    </div>
    <div class="info">
      <span v-if="displayName">{{ displayName }}</span>
      <div>
        <span>{{ email }}</span>
        <span v-if="pending" class="tag">{{ l['pending'] }}</span>
      </div>
      <transition name="fade-t">
        <Icon v-if="showIcon"
          class="icon"
          icon="trash"
          @click="remove"
          :primaryHover="true"
        />
      </transition>
    </div>
  </div>
</template>

<script>

import ProfileImgVue from './ProfileImg.vue'
import IconVue from '../Icon.vue'

import { mapGetters } from 'vuex'

export default {
  props: ['displayName', 'photoURL', 'src', 'email', 'pending', 'userId'],
  components: {
    ProfileImg: ProfileImgVue,
    Icon: IconVue,
  },
  data() {
    return {
      hover: false,
    }
  },
  methods: {
    remove() {
      this.$emit('remove')
    }
  },
  computed: {
    ...mapGetters(['l', 'isDesktop']),
    showIcon() {
      return !this.isDesktop || this.hover
    }
  }
}

</script>

<style scoped>

.ProfileInfo {
  position: relative;
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

.icon {
  position: absolute;
  right: 10px;
  top: 55%;
  transform: translateY(-50%);
}

</style>
