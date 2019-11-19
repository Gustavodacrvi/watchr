
<template>
  <div class="Audio">
    <audio controls>
      <source :src="url" :type="blob.type">
    </audio>
  </div>
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
  }
}

</script>

<style scoped>

</style>
