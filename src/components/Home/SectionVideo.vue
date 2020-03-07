<template>
  <div class="SectionVideo">
    <div class="section">
      <div class="section-main-heading">
        <h2>Magic Button</h2>
      </div>

      <div class="section-wrapper">
        <div class="section-cont">
          <div v-for="o in cont"
            class="section-section"
            :key="o.heading"
          >
            <div class="section-heading">
              <span class="ball-wrapper">
                <Icon class="play" width='24px' icon='play' color='var(--primary)'/>
              </span>
              <h3 class="h3">{{ o.heading }}</h3>
            </div>
            <p class="section-paragraph">
              {{ o.txt }}
            </p>
          </div>
        </div>
        <div class="section-cont">
          right section
        </div>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  props: ['cont']
}

</script>

<style scoped>

.SectionVideo {
  display: flex;
  margin-top: 7em;
  justify-content: center;
}

.section {
  flex-basis: 1100px;
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

.h3 {
  margin-left: 10px;
}

.section-wrapper {
  display: flex;
  height: 400px;
}

.section-cont {
  flex-basis: 100%;
}

.ball-wrapper {
  border-radius: 6px;
  padding: 4px 5px 0px 4px;
  transition-duration: .2s;
  transform: scale(1,1);
}

.ball-wrapper:hover {
  background-color: rgba(106, 156, 180, .2);
}

.ball-wrapper:active {
  transform: scale(.9,.9);
}

.play {
  transform: translate(.5px);
}

</style>
