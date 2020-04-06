<template>
  <div
    class="ruler-element"
  >
    <div class="element-wrapper">
      <span v-if='startHour'
        class="timeline-time"
      >
        <span class="hour">
          {{startHour}}
        </span>
        <span class="timeline-info">
          <span>
            {{startMin}}
          </span>
          <span class="pm-am">
            {{timePmAm}}
          </span>
        </span>
      </span>
      <span v-else class='timeline-line'>
        
      </span>
    </div>
  </div>
</template>

<script>

export default {
  props: ['startHour', 'startMin', 'timePmAm']
}

</script>

<style scoped>

.ruler-element {
  width: 30px;
  flex-shrink: 0;
  height: 100%;
}

.element-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.timeline-time {
  display: flex;
  font-size: 1.2em;
}

.hour {
  font-size: 1.2em;
}

.timeline-info {
  font-size: .7em;
  color: var(--fade);
  margin-left: 2px;
  display: flex;
  flex-direction: column;
}

.timeline-line {
  display: block;
  height: 3px;
  width: 10px;
  border-radius: 4px;
  background-color: var(--fade);
}

.pm-am {
  font-size: .8em;
}

</style>
