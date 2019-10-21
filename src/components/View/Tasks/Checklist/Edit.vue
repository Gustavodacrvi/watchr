
<template>
  <transition name="trans" appear
    @enter='enter'
    @leave='leave'
  >
    <div class="Edit">
      <div class="wrapper rb">
        asdf
      </div>
    </div>
  </transition>
</template>

<script>

export default {
  methods: {
    leave(el) {
      const cont = el.getElementsByClassName('wrapper')[0]
      const s = el.style
      const c = cont.style
      const height = el.offsetHeight

      s.width = 0
      c.width = 0
      s.height = 0
      c.height = 0
      c.opacity = 0
    },
    enter(el) {
      const cont = el.getElementsByClassName('wrapper')[0]
      const s = el.style
      const c = cont.style
      const height = el.offsetHeight

      c.transitionDuration = '0s'
      s.transitionDuration = '0s'
      s.width = 0
      c.width = 0
      s.height = 0
      c.height = 0
      c.opacity = 0
      setTimeout(() => {
        c.transitionDuration = '.2s'
        s.transitionDuration = '.2s'
        if (height < 36) {
          s.height = '35px'
          c.height = '35px'
        }
        else {
          s.height = height + 'px'
          c.height = height + 'px'
        }
        c.opacity = 1
        s.width = '100%'
        c.width = '100%'
      })
    }
  }
}

</script>

<style scoped>

.trans-enter, .trans-leave-to {
  opacity: 0;
}

.trans-leave, .trans-enter-to {
  opacity: 1;
}

.Edit {
  display: flex;
  justify-content: center;
  align-items: center;
}

.wrapper {
  background-color: var(--dark);
}

</style>
