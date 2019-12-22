<template>
  <div class="tasks">
    <div class="mar">
      {{ l['Must be in at least one of the lists:'] }}
      <Options
        :options='options.inclusiveOR.map(el => el.name)'
        :active='getinclusiveORActive'
        min-width='175px'
        @select="removeListFromInclusive"
      />
      <IconDrop class='add cursor remove-highlight'
        handle='plus'
        :options='inclusiveOrOptions'
      />
    </div>
    <div class="mar">
      {{ l["Can't be in any of the lists:"] }}
      <Options
        :options='options.exclusive.map(el => el.name)'
        :active='getExclusiveActive'
        min-width='175px'
        @select="removeListFromExclusive"
      />
      <IconDrop class='add cursor remove-highlight'
        handle='plus'
        :options='exclusiveOptions'
      />
    </div>
  </div>
</template>

<script>

import Checkbox from '@/components/Auth/Checkbox.vue'
import Options from '@/components/Auth/Options.vue'
import Icon from '@/components/Icon.vue'

import IconDrop from '@/components/IconDrop/IconDrop.vue'

import { mapGetters } from 'vuex'

export default {
  components: {
    Checkbox, Options, IconDrop,
  },
  props: ['options'],
  methods: {
    removeListFromInclusive(list) {
      const index = this.options.inclusiveOR.findIndex(str => str === list)
      this.options.inclusiveOR.splice(index, 1)
    },
    removeListFromExclusive(list) {
      const index = this.options.exclusive.findIndex(str => str === list)
      this.options.exclusive.splice(index, 1)
    },
  },
  computed: {
    ...mapGetters({
      l: 'l',
      sortedLists: 'list/sortedLists',
    }),
    getinclusiveORActive() {
      if (this.options.inclusiveOR.length === 0)
        return this.l['No lists selected']
      return this.options.inclusiveOR[this.options.inclusiveOR.length - 1].name
    },
    getExclusiveActive() {
      if (this.options.exclusive.length === 0)
        return this.l['No lists selected']
      return this.options.exclusive[this.options.exclusive.length - 1].name
    },
    inclusiveOrOptions() {
      return {
        comp: 'ListIcons',
        content: {
          allowSearch: true,
          links: this.sortedLists.map(list => ({
            ...list,
            callback: () => {
              if (!this.options.inclusiveOR.find(el => el.id === list.id))
                this.options.inclusiveOR.push(list)
            }
          })),
        }
      }
    },
    exclusiveOptions() {
      return {
        comp: 'ListIcons',
        content: {
          allowSearch: true,
          links: this.sortedLists.map(list => ({
            ...list,
            callback: () => {
              if (!this.options.exclusive.find(el => el.id === list.id))
                this.options.exclusive.push(list)
            }
          })),
        }
      }
    },
  },
}

</script>

<style scoped>

.mar {
  margin-top: 6px;
}

.add {
  display: inline-block;
  transform: translateY(4px);
  margin-left: 8px;
}

</style>
