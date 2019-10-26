
<template>
  <div class="ViewProfile">
    <div v-if="isDesktop" class="cont desktop">
      <div class="menu-wrapper">
        <div class="menu">
          <div v-for="o in links"
            :key="o.name"
            class="btn rb cursor"
            :class="[o.name, {active: isActive(o.name), 'not-active': !isActive(o.name)}]"
            @click="activate(o.name)"
          >
            <div class="icon-wrapper">
              <div>
                <Icon :icon="o.icon" width="20px"/>
              </div>
            </div>
            <span>{{ l[o.name] }}</span>
          </div>
          <div class="back rb cb"></div>
        </div>
      </div>
      <div class="view">
        açlskjdf
      </div>
    </div>
    <div v-else class="cont mobile">
      <div class="menu-wrapper">
        <div class="scroll">
          <span v-for="str in mobileLinks"
            :key="str"
            class="btn rb cursor"
            :class="[str, {active: isActive(str), 'not-active': !isActive(str)}]"
            @click="mobileActivate(str)"
          >{{ str }}</span>
          <span class="back-mobile rb cb"></span>
        </div>
        <div></div>
      </div>
    </div>
  </div>
</template>

<script>

import IconVue from '@/components/Icon.vue'

import { mapGetters } from 'vuex'

export default {
  components: {
    Icon: IconVue,
  },
  data() {
    return {
      links: [
        {
          name: 'Profile',
          icon: 'user',
          num: 1,
        },
      ],
      section: 'Profile',
    }
  },
  mounted() {
    setTimeout(() => {
      this.mobileActivate()
    }, 10)
  },
  methods: {
    isActive(name) {
      return name === this.section
    },
    activate(name) {
      this.section = name
      const el = this.$el.getElementsByClassName(name)[0]
      this.back().style.top = el.offsetTop + 'px'
    },
    mobileActivate(str) {
      if (str)
        this.section = str
      const el = this.$el.getElementsByClassName(this.section)[0]
      const back = this.$el.getElementsByClassName('back-mobile')[0]
      const s = back.style
      s.left = el.offsetLeft + 'px'
      s.height = el.offsetHeight + 'px'
      s.width = el.offsetWidth + 'px'
    },
    back() {
      return this.$el.getElementsByClassName('back')[0]
    }
  },
  computed: {
    mobileLinks() {
      return this.links.map(el => el.name)
    },
    view() {
      return this.links.find(el => el.name === this.section)
    },
    ...mapGetters(['isDesktop', 'l']),
  },
}

</script>

<style scoped>

.ViewProfile {
  display: flex;
  height: 100%;
  justify-content: center;
  position: relative;
  z-index: 800;
}

.cont.desktop {
  flex-basis: 1150px;
  height: 100%;
  display: flex;
  align-items: stretch;
}

.desktop .menu-wrapper {
  flex-basis: 400px;
  height: 100%;
}

.desktop .menu {
  position: relative;
  margin: 0 18px;
}

.desktop .view {
  flex-basis: 100%;
  height: 100%;
}

.btn {
  position: relative;
  z-index: 2;
  color: var(--gray);
  height: 35px;
  display: flex;
  align-items: center;
  transition-duration: .2s;
}

.active {
  color: var(--primary);
}

.desktop .icon-wrapper {
  height: 100%;
  flex-basis: 35px;
  transform: translateY(2px);
  display: flex;
  justify-content: center;
  align-items: center;
}

.desktop .back {
  position: absolute;
  top: 0;
  height: 35px;
  width: 100%;
  transition-duration: .2s;
  z-index: 1;
}

.cont.mobile {
  width: 100%;
  margin: 16px;
  margin-top: 0;
}

.mobile .scroll {
  display: flex;
  overflow-x: auto;
  position: relative;
}

.mobile .btn {
  min-width: min-content;
  display: flex;
  padding: 0 14px;
  transform: scale(1,1);
}

.back-mobile {
  position: absolute;
  top: 0;
  transition-duration: .2s;
}

.btn.not-active:hover {
  background-color: var(--dark);
}

.btn.not-active:active {
  transform: scale(.95,.95);
}

</style>
