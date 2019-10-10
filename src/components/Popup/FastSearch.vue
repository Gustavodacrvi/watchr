<template>
  <div class="FastSearch" @click="$store.commit('closeFastSearch')">
    <div class="cb rb card shadow" @click.stop>
      <div class="cont">
        <InputApp :focus='true' v-model="search"/>
        <div class="options">
          <div class="option rb cursor">
            <div class="icon-wrapper">
              <Icon icon='user' class="icon"/>
            </div>
            <span class="name">I am a freaking option motherfucker.</span>
          </div>
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
      search: ''
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
  max-height: 400px;
}


.cont {
  margin: 10px;
}

.options {
  margin-top: 20px;
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

</style>
