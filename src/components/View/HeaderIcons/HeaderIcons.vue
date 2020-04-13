<template>
  <div class="HeaderIcons"
    :style="style"
  >
    <div class="wrapper">
      <HeaderIcon
        v-bind='calendarSmartIconObj'

        @save='save'
      />
    </div>
  </div>
</template>

<script>

import HeaderIcon from './HeaderIcon.vue'

import editBuilderMixin from "@/mixins/editBuilder.js"

export default {
  mixins: [editBuilderMixin],
  components: {
    HeaderIcon,
  },
  props: ['width'],
  methods: {
    save(model) {
      console.log(model)
    },
  },
  computed: {
    style() {
      return {
        left: this.width + 'px',
        width: `calc(100% - ${this.width}px)`,
      }
    },
  },
}

</script>

<style scoped>

.HeaderIcons {
  position: fixed;
  height: 45px;
  border: none;
  bottom: 0;
  display: flex;
  justify-content: center;
  border-top: 1px solid var(--extra-light-gray);
  background-color: var(--back-color);
  transition-duration: .2s;
}

.wrapper {
  position: relative;
  display: flex;
  align-items: center;
  height: 100%;
  margin: 0 50px;
  flex-basis: 850px;
}

</style>
