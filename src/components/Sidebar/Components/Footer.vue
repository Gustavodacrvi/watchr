<template>
  <div class="footer" :class="{slimMode, showing}">
    <div class="inner-footer">
      <div class="wrapper">
        <div class="drop" v-if="showIconDropdown && showing">
          <Icon v-for="i in sideIcons" :key='i.icon'
            class="sect-icon cursor remove-highlight primary-hover"
            :icon='i.icon'
            width='12px'
            
            :number='i.number'
            color='var(--fade)'
            @click="i.callback"
          />
          <transition name="icon-t">
            <IconDrop
              width='12px'
              class="right"
              handle='settings-h'
              
              handleColor='var(--fade)'
              :options="getSectionOptions"
            />
          </transition>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

import IconDrop from '../../IconDrop/IconDrop.vue'

import { mapGetters } from 'vuex'

export default {
  components: {
    IconDrop,
  },
  props: ['showIconDropdown', 'sideIcons', 'render', 'getSectionOptions', 'slimMode'],
  data() {
    return {
      showing: this.render,
      timeout: null,
    }
  },
  computed: {
    ...mapGetters(['isDesktopDevice', 'isDesktopBreakPoint']),
  },
  watch: {
    render() {
      if (this.timeout) {
        clearTimeout(this.timeout)
        this.timeout = null
      }
      if (this.render)
        this.timeout = setTimeout(() => {
          this.showing = true
        }, 500)
      else
        this.showing = false
    },
  },
}

</script>

<style scoped>

.footer {
  position: fixed;
  left: 0;
  bottom: 0;
  height: 40px;
  border: none;
  z-index: 100;
  border-top: 1px solid var(--light-gray);
}

.scheduler-toggler {
  position: relative;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
}

.slimMode {
  position: sticky;
  padding: 0;
  width: calc(100% + (26px * 2)) !important;
  transform: translateX(-26px);
  background-color: purple;
  bottom: 0;
}

.sect-icon {
  margin-right: 12px;
}

.footer.mobile {
  bottom: 15px;
  height: 53px;
  width: 100%;
  margin-left: 0;
  border: none;
  padding: 0;
}

.wrapper {
  height: 100%;
  margin: 0 25px;
  position: relative;
}

.inner-footer {
  position: relative;
  background-color: none;
  box-shadow: none;
  transition-duration: 0;
  height: 100%;
}

.footer.showing .inner-footer {
  background-color: var(--sidebar-color);
}

.slimMode .inner-footer {
  background-color: var(--card);
}

.mobile .footer.showing .inner-footer {
  background-color: var(--back-color);
}

.drop {
  position: absolute;
  right: 17px;
  display: flex;
  transform: translate(26px, 14px);
}

.footer.mobile .drop {
  right: unset;
  bottom: 24px;
}

.mobile .drop {
  right: unset;
  left: 0;
}

</style>
