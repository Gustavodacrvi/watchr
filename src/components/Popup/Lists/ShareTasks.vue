<template>
  <div class="AddTag popup cb shadow rb" :class="platform">
    <div class="title tac">
      <h2 class="pc">{{ l['Share List'] }}</h2>
    </div>
    <div class="content">
      <div class="header">
        <span class="opt cursor" :class="{active: section === 'Colab'}" @click="activate('Colab')">{{ l['Collaborators'] }}</span>
        <span class="opt cursor" :class="{active: section === 'From'}" @click="activate('From')">{{ l['Invite from list'] }}</span>
        <span class="line"></span>
      </div>
    </div>
  </div>
</template>

<script>

import DropInputVue from '../../Auth/DropInput.vue'
import ButtonVue from '../../Auth/Button.vue'

import { mapGetters, mapState } from 'vuex'

export default {
  components: {
    DropInput: DropInputVue,
    ButtonApp: ButtonVue,
  },
  data() {
    return {
      section: 'Colab',
      search: '',
      options: [],
    }
  },
  mounted() {
    this.moveLine()
  },
  computed: {
    ...mapGetters(['platform', 'l']),
    ...mapState({
      lists: state => state.list.lists,
      listId: state => state.popup.payload,
    }),
    list() {
      return this.lists.find(el => el.id === this.listId)
    },
  },
  methods: {
    select(val) {

    },
    activate(name) {
      this.section = name
    },
    moveLine() {
      const act = this.$el.getElementsByClassName('active')[0]
      const line = this.$el.getElementsByClassName('line')[0]
      const s = line.style

      s.width = act.offsetWidth + 'px'
      s.left = act.offsetLeft + 'px'
    },
  },
  watch: {
    name() {

    },
    section() {
      setTimeout(() => {
        this.moveLine()
      })
    }
  }
}

</script>

<style scoped>

.header {
  height: 45px;
  display: flex;
  align-items: center;
  position: relative;
}

.line {
  position: absolute;
  height: 2px;
  background-color: var(--primary);
  bottom: 0;
  left: 0;
  border-radius: 4px;
  transition-duration: .2s;
}

.opt {
  flex-basis: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  border-bottom: 1px solid var(--light-gray);
  height: 100%;
  border-top-left-radius: 6px;
  border-top-right-radius: 6px;
  color: var(--gray);
  transition-duration: .2s;
}

.opt:hover {
  background-color: var(--light-gray);
  color: var(--white);
}

.opt.active {
  color: var(--primary);
}

</style>

<style scoped src="@/assets/css/popupAuth.css">
</style>
