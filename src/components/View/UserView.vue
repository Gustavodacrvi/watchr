
<template>
  <div class="UserView" :class="[{appbarHided}, platform]">
    <div v-if="isDesktop" class="nav-shadow"></div>
    <div v-if="isDesktop" class="nav" :style="getNavTopPosition">
      <Appbar class="Appbar"
        :value="value"
        :view-type="viewType"
        :appbarHided='appbarHided'
        @appbar="toggleAppbar"
        @section="v => section = v"
      />
    </div>
    <div class="cont" :class="platform">
      <ViewControler
        :isSmart="isSmart"
        :viewType='viewType'
        :viewName='value'
      />
    </div>
  </div>
</template>

<script>

const UPDATE_STRING = '2.0.1.6'

import AppbarVue from '../Appbar/Appbar.vue'
import ViewControlerVue from '../View/ViewControler.vue'

import { mapGetters } from 'vuex'

export default {
  components: {
    Appbar: AppbarVue,
    ViewControler: ViewControlerVue
  },
  data() {
    return {
      viewType: null,
      value: null,
      appbarHided: false,
      scrollTop: null,
      test: false,
    }
  },
  created() {
    setTimeout(() => this.test = true, 2000)
    this.updateViewType()
    this.getScrollTop()
    window.addEventListener('scroll', this.getScrollTop)
  },
  mounted() {
    setTimeout(() => {
      const str = localStorage.getItem('updatestring')
      if (str !== UPDATE_STRING && str !== '')
        this.$store.dispatch('pushPopup', {comp: 'Update'})
      localStorage.setItem('updatestring', UPDATE_STRING)
    }, 1000)
  },
  methods: {
    getScrollTop() {
      this.scrollTop = window.scrollY
    },
    toggleAppbar(isHided) {
      this.appbarHided = isHided
    },
    updateViewType() {
      const query = this.$route.query
      const keys = Object.keys(query)
      let viewType = keys[0]
      let value = query[viewType]
      if (viewType === undefined || value === undefined)
        this.$router.replace('/user?list=Today')
      this.value = value
      this.viewType = viewType
    }
  },
  computed: {
    ...mapGetters(['platform', 'isDesktop']),
    getNavTopPosition() {
      const app = document.getElementById('app')
      const scroll = this.scrollTop
      if (app) {
        const winHeight = app.offsetHeight
        let top = (75 - scroll) + 'px'
        let height = ((winHeight - 100) + scroll) + 'px'
        if (scroll > 50) {
          top = '30px'
          height = (winHeight - 100 + 45) + 'px'
        }

        return {
          top,
          height,
        }
      }
    },
    isSmart() {
      if (this.viewType !== 'list') return false
      switch (this.value) {
        case 'Today': return true
        case 'Upcoming': return true
        case 'Tomorrow': return true
        case 'Completed': return true
        case 'Inbox': return true
      }
      return false
    },
  },
  watch: {
    $route() {
      this.updateViewType()
    }
  }
}

</script>

<style scoped>

.UserView {
  margin: 8px 60px;
  display: flex;
  justify-content: center;
  transition-delay: .4s;
  flex-grow: 1;
}

.UserView.mobile {
  margin: 0;
}

.nav-shadow {
  flex-basis: 300px;
  max-width: 300px;
  flex-grow: 0;
  flex-shrink: 0;
  transition-duration: .6s;
  transition-delay: 0s;
}

.nav {
  position: fixed;
  width: 300px;
  left: 60px;
  z-index: 4;
}

.cont {
  position: relative;
  flex-basis: 100%;
  flex-grow: 1;
  transition-delay: .4s;
  transition-duration: .6s;
  z-index: 5;
}

.cont.desktop {
  margin-left: 60px;
}

.appbarHided .nav-shadow {
  flex-basis: 0;
  max-width: 0;
  transition-delay: .6s;
  transition-duration: .6s;
}

.appbarHided .cont {
  flex-basis: 925px;
  flex-grow: 0;
}

</style>
