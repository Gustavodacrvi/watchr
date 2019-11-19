
<template>
  <div class="Txt rb scroll-thin">
    <div class="cont scroll-thin">
      {{txt}}
    </div>
  </div>
</template>

<script>

export default {
  props: ['blob'],
  data() {
    return {
      txt: '',
    }
  },
  created() {
    const reader = new FileReader()
    reader.onload = (evt) => {
      this.txt = evt.target.result
    }
    reader.readAsText(this.blob)
  } 
}

</script>

<style scoped>

.Txt {
  overflow: auto;
  max-height: 300px;
}

.cont {
  padding: 8px;
  background-color: var(--dark);
  white-space: pre-line;
}

</style>
