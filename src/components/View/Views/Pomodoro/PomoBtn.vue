<template>
  <div class="PomoBtn">
    <button class="btn cursor remove-highlight" :class="{running, rest}" @click="click">
      {{ btnMsg }}
      <CircleBubble
        innerColor='var(--white)'
        outerColor='white'
        opacity='0'
      />
    </button>
    <button v-if="rest && !running" class="btn cursor remove-highlight" @click="skipRest">
      {{ l['Skip interval'] }}
      <CircleBubble
        innerColor='var(--white)'
        outerColor='white'
        opacity='0'
      />
    </button>
  </div>
</template>

<script>

import { mapState, mapGetters } from 'vuex'

export default {
  methods: {
    click() {
      this.$store.dispatch('pomo/toggle')
    },
    skipRest() {
      this.$store.dispatch('pomo/skipRest')
    },
  },
  computed: {
    ...mapState({
      running: state => state.pomo.running,
      rest: state => state.pomo.rest,
    }),
    ...mapGetters(['l']),
    btnMsg() {
      if (this.running) return this.l['Stop']
      if (this.rest)
        return this.rest === 'short' ? this.l['Short rest'] : this.l['Long rest']
      return this.l['Start']
    },
  }
}

</script>

<style scoped>

.PomoBtn {
  display: flex;
  justify-content: center;
}

.btn {
  position: relative;
  padding: 16px 38px;
  background-color: var(--dark-red);
  border-radius: 500px;
  color: white;
  box-shadow: 0 0 40px rgba(234, 58, 52, .4);
  transition-duration: .2s;
  overflow: hidden;
  border: none;
}

.btn + .btn {
  margin-left: 10px;
}

.running {
  background-color: transparent;
  border: 1px solid var(--dark-red);
  color: var(--dark-red);
}

.rest {
  box-shadow: 0 0 24px rgba(89, 160, 222, .2);
  background-color: var(--primary);
  color: white;
}

.rest.running {
  background-color: transparent;
  border: 1px solid var(--primary);
  color: var(--primary);
}

.running:hover {
  color: white;
}

.tiny .btn {
  padding: 8px 18px;
}

</style>
