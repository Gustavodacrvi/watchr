<template>
  <div class="FastSearch" @click="$store.commit('closeFastSearch')">
    <div class="cb rb card shadow scroll-thin" @click.stop>
      <div class="cont">
        <InputApp :focus='true' v-model="search"/>
        <div>
          <transition-group name="trans"
            @enter='enter'
            @leave='leave'
            class="options"
            tag="div"
          >
            <div v-for="(o, i) in options"
              :key="o.name + o.icon + i"
              class="option rb cursor"
            >
              <div class="icon-wrapper">
                <Icon icon='user' class="icon"/>
              </div>
              <span class="name">I am a freaking option motherfucker.</span>
            </div>
          </transition-group>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

import InputVue from '@/components/Auth/Input.vue'
import IconVue from '@/components/Icon.vue'

export default {
  components: {
    InputApp: InputVue,
    Icon: IconVue,
  },
  data() {
    return {
      search: '',
      options: [
        {
          name: 'freaking ttest',
          icon: 'user'
        }
      ]
    }
  },
  created() {
    setInterval(() => {
      if (this.options.length)
        this.options = []
      else this.options = [
        {
          name: 'freaking test',
          icon: 'user'
        }
      ]
    }, 1000)
  },
  methods: {
    enter(el) {
      const s = el.style

      s.transitionDuration = 0
      s.height = 0
      setTimeout(() => {
        s.transitionDuration = '.2s'
        s.height = '35px'
      })
    },
    leave(el) {
      const s = el.style

      s.height = 0
    },
  },
  computed: {
    optionss() {
      return [
        {
          name: 'freaking test',
          icon: 'user',
        }
      ]
    }
  }
}

</script>

<style scoped>

.FastSearch {
  position: fixed;
  width: 100%;
  height: 100%;
  z-index: 499;
  display: flex;
  align-items: flex-start;
  justify-content: center;
}

.card {
  flex-basis: 600px;
  margin: 0 15px;
  margin-top: 60px;
  overflow: auto;
  max-height: 400px;
}

.cont {
  margin: 10px;
}

.options {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
}

.option {
  height: 35px;
  width: 100%;
  display: flex;
  background-color: none;
  transition-duration: .2s;
}

.option:hover, .active {
  background-color: var(--light-gray);
}

.icon-wrapper {
  flex-basis: 35px;
  height: 100%;
  position: relative;
}

.icon {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%,-50%);
}

.name {
  display: flex;
  align-items: center;
  flex-basis: 100%;
}

.trans-lenter, .trans-leave-to {
  opacity: 0;
}

.trans-leave, .trans-lenter-to {
  opacity: 1;
}

</style>
