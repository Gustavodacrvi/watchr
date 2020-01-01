<template>
  <div class="RecentData popup scroll-thin cb shadow rb" :class="platform">
    <div class="tac title">
      <h3 class="pc">{{ l['Recent Data'] }}</h3>
    </div>
    <div class="cont">
      <div class="numbers">
        <div class="row">
          <div class="cell">
            <span class="num">
              0
            </span>
            <span class="label">
              Daily Pomos
            </span>
          </div>
          <div class="cell">
            <span class="num">
              0
            </span>
            <span class="label">
              Weekly Pomos
            </span>
          </div>
          <div class="cell">
            <span class="num">
              0
            </span>
            <span class="label">
              Total Pomos
            </span>
          </div>
        </div>
        <div class="row">
          <div class="cell">
            <span class="num">
              0
            </span>
            <span class="label">
              Daily Focus(h)
            </span>
          </div>
          <div class="cell">
            <span class="num">
              0
            </span>
            <span class="label">
              Weekly Focus(h)
            </span>
          </div>
          <div class="cell">
            <span class="num">
              0
            </span>
            <span class="label">
              Total Focus(h)
            </span>
          </div>
        </div>
        <div class="row">
          <div class="cell">
            <span class="num">
              0
            </span>
            <span class="label">
              Daily Rest(h)
            </span>
          </div>
          <div class="cell">
            <span class="num">
              0
            </span>
            <span class="label">
              Weekly Rest(h)
            </span>
          </div>
          <div class="cell">
            <span class="num">
              0
            </span>
            <span class="label">
              Total Rest(h)
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

import { mapGetters } from 'vuex'

export default {
  computed: {
    ...mapGetters(['l', 'platform']),
  },
}

</script>

<style scoped src="@/assets/css/popupAuth.css">
</style>

<style scoped>

.RecentData {
  overflow: auto;
}

.desktop {
  max-height: 500px;
}

.cont {
  margin: 18px;
  margin-top: 0;
}

.numbers {
  display: flex;
  flex-direction: column;
  height: 300px;
  flex-wrap: nowrap;
}

.row {
  display: flex;
  align-items: center;
  justify-content: space-around;
  flex-wrap: nowrap;
}

.cell {
  display: flex;
  justify-content: space-around;
  flex-direction: column;
  height: 70px;
  flex-basis: 130px;
  text-align: center;
}

.num {
  font-size: 2em;
}

.label {
  font-size: .8em;
}

.mobile .label {
  font-size: .65em;
}

</style>
