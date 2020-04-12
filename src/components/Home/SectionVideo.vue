<template>
  <div class="SectionVideo section-wrapper">
    <div class="section">
      <div class="section-main-heading">
        <slot></slot>
      </div>

      <div class="section-cont-wrapper" :class="{invert}">
        <div class="section-cont">
          <div v-for="o in cont"
            class="section-section"
            :key="o.heading"
          >
            <div class="section-heading">
              <span v-if="o.name" class="ball-wrapper" @click="play(o.name)">
                <Icon class="play" width='24px' icon='play' color='var(--primary)'/>
              </span>
              <h3 class="h3">
                <span v-html="o.heading"></span>
              </h3>
            </div>
            <p class="section-paragraph">
              <span v-html='o.txt'></span>
            </p>
          </div>
        </div>
        <div class="video-section">
          <VideoMockup
            :url='getUrl'
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>

import VideoMockup from "@/components/View/RenderComponents/VideoMockup.vue"

export default {
  components: {
    VideoMockup,
  },
  props: ['cont', 'invert'],
  data() {
    return {
      url: null,
    }
  },
  methods: {
    play(url) {
      this.url = url
    },
  },
  computed: {
    getUrl() {
      return `/video/${this.url || this.cont[0].name}.mp4`
    },
  },
}

</script>

<style scoped>

.SectionVideo {
  display: flex;
  margin-top: 7em;
  justify-content: center;
}

.SectionVideo + .SectionVideo {
  margin-top: 2em;
}

.section {
  flex-basis: 1000px;
  margin: 0 12px;
}

.section-main-heading {
  font-size: 1.35em;
  margin: 3.5em 0;
  text-align: center;
}

.section-heading {
  font-size: 1.2em;
  margin: 2.5em 0;
  display: flex;
  align-items: center;
}

.section-cont-wrapper {
  display: flex;
}

.section-cont-wrapper.invert {
  flex-direction: row-reverse;
}

.section-cont {
  flex-basis: 45%;
}

.video-section {
  flex-basis: 55%;
}

.ball-wrapper {
  margin-right: 10px;
  border-radius: 4px;
  padding: 4px 5px 0px 4px;
  transition-duration: .15s;
  transform: scale(1,1);
}

.ball-wrapper:hover {
  background-color: rgba(106, 156, 180, .2);
  cursor: pointer;
}

.ball-wrapper:active {
  transform: scale(.9,.9);
}

.play {
  transform: translate(.5px);
}

@media (max-width: 820px) {
  .section-cont-wrapper {
    flex-direction: column;
  }
}

</style>
