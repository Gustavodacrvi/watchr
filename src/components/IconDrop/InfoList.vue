<template>
  <div
    class="InfoList"
    :style="{width}"
  >
    <div v-for="l in links" :key="l.name"
      class="option"
      :style="{backgroundColor: l.backgroundColor}"

      @click="callback(l)"
    >
      <span v-if="l.name"
        class="sect name-wrapper"

        :class="{hasIcon: l.icon}"
      >
        <span class="name">
          <span v-if="l.icon">
            <Icon class="icon"
              :icon='l.icon.name'
              :color='l.color'
              width='16px'
            />
          </span>
          {{ l.name }}
        </span>
        <span v-if="l.value">
          {{ l.value }}
        </span>
      </span>
      <span v-if="l.info"
        class="sect info"
      >
        {{ l.info }}
      </span>
    </div>
  </div>
</template>

<script>

export default {
  props: ['links', 'width'],
  methods: {
    callback(l) {
      const opt = l.callback(l, this, this.$parent)

      if (!opt || (opt && opt.then)) close()
      else this.$emit('update', opt)
    },
  },
}

</script>

<style scoped>

.option {
  display: flex;
  flex-direction: column;
  padding: 10px;
  user-select: none;
  cursor: pointer;
  transition-duration: .2s;
}

.option:hover {
  background-color: rgba(87,160,222,.1) !important;
  color: var(--primary);
}

.name-wrapper {
  white-space: nowrap;
  display: flex;
  justify-content: space-between;
}

.sect {
  padding: 2px;
}

.icon {
  margin-right: 8px;
  transform: translateY(3px);
}

.hasIcon {
  transform: translateY(-2px);
}

.info {
  font-size: .9em;
  opacity: .8;
}

.option:last-child .info {
  padding-bottom: 10px;
}

</style>
