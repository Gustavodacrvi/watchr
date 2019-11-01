
<template>
  <div class="ProfileInfo cursor rb"
    @mouseenter="hover = true"
    @mouseleave="hover = false"
  >
    <div class="img-wrapper">
      <ProfileImg class="img" :src='photoURL'/>
    </div>
    <div class="info">
      <span v-if="displayName && !listName">{{ displayName }}</span>
      <span v-else>{{ listName }}</span>
      <div>
        <span v-if="displayName && listName">{{ displayName }} </span>
        <span>{{ email }}</span>
        <transition name="fade-t">
          <span v-if="status === 'pending'" class="tag">{{ l['pending'] }}</span>
          <span v-else-if="status === 'rejected'" class="tag rejected">{{ l['rejected'] }}</span>
        </transition>
      </div>
      <div class="icon-wrapper">
        <transition name="fade-t">
          <Icon v-if="showIcon && !options" key="icon"
            icon="trash"
            @click="remove"
            :primaryHover="true"
          />
          <IconDrop v-else-if="showIcon && options"
            handle='settings-v'
            :options='options'
          />
        </transition>
      </div>
    </div>
  </div>
</template>

<script>

import ProfileImgVue from './ProfileImg.vue'
import IconVue from '../Icon.vue'
import IconDropVue from '../IconDrop.vue'

import { mapGetters } from 'vuex'

export default {
  props: ['displayName', 'photoURL', 'email', 'status', 'userId', 'listName', 'options'],
  components: {
    ProfileImg: ProfileImgVue,
    Icon: IconVue,
    IconDrop: IconDropVue,
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
  width: 30px;
  height: 30px;
  margin-left: 4px;
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

.tag.rejected {
  background-color: var(--red);
}

.icon-wrapper {
  position: absolute;
  right: 10px;
  top: 55%;
  transform: translateY(-50%);
}

.IconDrop {
  transform: translate(8px, 14px);
}

</style>
