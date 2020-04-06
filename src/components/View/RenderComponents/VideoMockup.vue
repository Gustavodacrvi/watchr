<template>
  <div class="video-wrapper">
    <div class="video" @click="play()">
      <video
        ref='video'
        class="video-tag"
        crossOrigin="anonymous"

        :src="url"
        type='video/mp4'

        preload
      >
        <source>
        Your browser does not support videos.
      </video>
    </div>
  </div>
</template>

<script>

export default {
  props: ['url'],
  methods: {
    play() {
      this.$refs.video.play()
    },
  },
  watch: {
    url() {
      this.$nextTick(() => {
        this.play()
      })
    },
  },
}

</script>

<style scoped>

.video-wrapper, .video {
  width: 100%;
}

.video-wrapper {
  padding: 50px;
}

.video {
  box-shadow: 0 0 18px var(--dark-void);
  border: 1px solid var(--void);
  overflow: hidden;
  min-height: 724px;
  border-radius: 12px;
  transition-duration: .175s;
  transform: scale(1,1);
}

.video:hover {
  transform: scale(1.007,1.007);
  box-shadow: 0 0 38px var(--dark-void);
}

.video:active {
  transform: scale(.98,.98);
}

.video-tag {
  width: 100%;
  object-fit: cover;
}

</style>
