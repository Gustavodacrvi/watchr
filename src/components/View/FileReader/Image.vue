
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
  created() {
    this.url = URL.createObjectURL(this.blob)
  },
}

</script>

<style scoped>

.Image {
  max-height: 300px;
  max-width: 100%;
}

</style>
