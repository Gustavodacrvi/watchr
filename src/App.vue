<template>
  <div id='app-wrapper'>
    <div id='app' class='background-color' :class='theme'>

    </div>
  </div>
</template>

<script lang='ts'>
import { Vue, Component } from 'vue-property-decorator'
import { State } from 'vuex-class'

@Component
export default class App extends Vue {
  @State('theme') private theme!: string
}
</script>


<style>

body {
  margin: 0;
}

#app-wrapper {
  position: absolute;
  height: 100%;
  width: 100%;
}

#app {
  position: relative;
  width: 100%;
  height: 100%;
}

.main-color {
  color: #A97CFC;
}

.background-color.light {
  background-color: #F8F7F6;
}

.background-color.dark {
  background-color: #1F1F1F;
}

.card.light {
  background-color: #FDFCFC;
  border: .5px solid #D9D9D9;
}

.card.dark {
  background-color: #282828;
}

.main-color-card.light {
  background-color: #A97CFC;
}

.main-color.dark {
  background-color: #282828;
}

.gray.light {
  background-color: #F0F0F0;
}

.gray.dark {
  background-color: #1C1C1C;
}

.round-border {
  border-radius: 8px;
}

</style>
