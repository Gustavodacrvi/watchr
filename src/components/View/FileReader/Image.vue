
<template>
  <img class="Image" :src="url">
</template>

<script>

export default {
  props: ['blob'],
  data() {
    return {
      url: '',
    }
  },
  mounted() {
    this.url = URL.createObjectURL(this.blob)
  },
  computed: {
    imgUrl() {
      return `url("${this.url}")`
    }
  }
}

</script>

<style scoped>

.Image {
  max-height: 300px;
  max-width: 100%;
}

</style>
