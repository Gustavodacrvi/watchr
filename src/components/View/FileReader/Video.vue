
<template>
  <div class="Video">
    <video class="cont" controls>
      <source :src="url" :type="blob.type">
    </video>
  </div>
</template>

<script>

export default {
  props: ['blob'],
  data() {
    return {
      url: ''
    }
  },
  created() {
    this.url = URL.createObjectURL(this.blob)
  },
}

</script>

<style scoped>

.cont {
  max-width: 100%;
  max-height: 350px;
}

</style>
