<template>
  <div class="Toast">
    <div class="toast cb rb">
      <span class="name">This is the freaking content mother fucker.</span>
    </div>
  </div>
</template>

<script>

/* 
  {
    name: 'Fudeu muito',
    time: seconds,
    callback: () => void,
    type: '' | 'error' | 'success'
  }
*/

import { mapState } from 'vuex'

export default {
  data() {
    return {
      toast: null,
    }
  },
  computed: {
    ...mapState(['toasts']),
  },
}

</script>

<style scoped>

.Toast {
  position: absolute;
  height: 100%;
  width: 100%;
  z-index: 150;
}

.toast {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  bottom: 34px;
}

.name {
  display: inline-block;
  padding: 12px;
}

</style>
