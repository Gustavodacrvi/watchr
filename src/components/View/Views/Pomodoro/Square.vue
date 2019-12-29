<template>
  <div class="Square">
    <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
	 width="24.563px" height="24.5px" viewBox="0 0 10.563 10.5" enable-background="new 0 0 10.563 10.5" xml:space="preserve">
    <polyline class="trans" fill="none" :stroke="checkColor" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" points="
      2.407,4.815 4.323,7.028 8.156,3.472 "/>
    <g>
      <path class="trans" fill="none" :stroke="boxColor" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="2.0214,2.0214" d="M10.063,9
        c0,0.552-0.448,1-1,1H1.5c-0.552,0-1-0.448-1-1V1.5c0-0.552,0.448-1,1-1h7.563c0.552,0,1,0.448,1,1V9z"/>
    </g>
    </svg>
  </div>
</template>

<script>

export default {
  props: ['check'],
  computed: {
    checkColor() {
      return this.check ? 'var(--dark-red)' : 'var(--light-gray)'
    },
    boxColor() {
      return this.check ? 'var(--white)' : 'var(--light-gray)'
    },
  },
}

</script>

<style scoped>

.Square {
  display: inline-block;
  margin-right: 9px;
}

.trans {
  transition-duration: .3s;
}

</style>
