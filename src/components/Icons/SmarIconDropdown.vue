<template>
  <transition
    appear
    @enter='listEnter'
    @leave='listLeave'
  >
    <div v-if="show"
      class="list rb scroll-thin"
      ref='list'

      :style='{width}'
    >
      <transition-group name="option-t">
        <div v-for="o in list" :key="o.id"
          class="option rb"
          :class="{activeOption: activeId === o.id}"

          :data-id='o.id'

          @click="select(o)"
        >
          <div class="option-wrapper">
            <div class="option-icon-wrapper">
              <Icon class="option-icon"
                :icon='o.icon'
                :color='o.color'
                width='14px'
              />
            </div>
            <div class="option-name">
              {{ o.name }}
            </div>
          </div>
        </div>
      </transition-group>
    </div>
  </transition>
</template>

<script>

export default {
  props: ['show', 'list', 'width', 'activeId'],
  data() {
    return {
      activeListElement: null,
    }
  },
  methods: {
    select(option) {
      option.callback(this.$parent.$parent.model)
    },
    moveActive(key) {
      if (!this.list)
        return;
      if (!this.activeListElement)
        this.activeListElement = this.searchFiltered[0].id
      else {
        const i = this.searchFiltered.findIndex(el => {
          return el.id === this.activeListElement
        })
        const list = this.$refs.list

        const p = this.getRefsPositions(this.activeListElement)
        if (key === 'ArrowDown' && i + 1 < this.searchFiltered.length) {
          this.activeListElement = this.searchFiltered[i + 1].id

          if (p.act.top + p.act.height > p.list.height + p.list.scroll)
            list.scrollTop += p.act.height
        } else if (key === 'ArrowUp' && i !== 0) {
          this.activeListElement = this.searchFiltered[i - 1].id

          if (p.act.top < p.list.scroll)
            list.scrollTop -= p.act.height
        } else {
          if (key === 'ArrowUp' && this.searchFiltered[this.searchFiltered.length - 1].id) {
            list.scrollTop = p.list.height
            this.activeListElement = this.searchFiltered[this.searchFiltered.length - 1].id
          } else if (key === 'ArrowDown' && this.searchFiltered[0].id) {
            list.scrollTop = 0
            this.activeListElement = this.searchFiltered[0].id
          }
        }
      }
    },

    listEnter(el, done) {

      const s = el.style
      requestAnimationFrame(() => {
        const height = getComputedStyle(el).height

        s.transitionDuration = 0
        s.height = 0
        s.opacity = 0

        requestAnimationFrame(() => {
          s.transitionDuration = '.2s'
          s.height = height
          s.opacity = 1

          setTimeout(() => {
            s.height = 'auto'
            done()
          }, 200)

        })
      })

    },
    listLeave(el, done) {

      const s = el.style

      s.transitionDuration = 0
      s.height = getComputedStyle(el).height
      s.opacity = 1

      requestAnimationFrame(() => {
        s.transitionDuration = '.2s'
        s.height = 0
        s.opacity = 0

        setTimeout(done, 200)

      })
    },
  },
}

</script>

<style scoped>

.list {
  background-color: var(--card);
  border: 1px solid var(--light-gray);
  padding: 8px 0;
  position: absolute;
  overflow: auto;
  max-height: 250px;
  width: 145px;
  left: 0;
  top: 100%;
}

.option {
  margin: 0 6px;
  height: 25px;
  padding: 0 6px;
  transition-duration: .2s;
}

.option:hover, .activeOption {
  background-color: var(--light-gray);
}

.option-wrapper {
  display: flex;
  align-items: center;
  height: 100%;
}

.option-icon-wrapper {
  height: 100%;
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.option-icon {
  transform: translateY(1px);
}

.option-name {
  margin-left: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.option-t-enter, .option-t-leave-to {
  transition-duration: .2s;
  opacity: 0;
  height: 0;
}

.option-t-leave, .option-t-enter-to {
  transition-duration: .2s;
  opacity: 1;
  height: 25px;
}

</style>
