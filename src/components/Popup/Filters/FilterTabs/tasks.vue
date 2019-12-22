<template>
  <div class="tasks">
    <div>
      {{ l['Must be in at list one of the lists:'] }}
      <Options
        :options='options.inclusiveOR.map(el => el.name)'
        :active='getinclusiveORActive.name'
        min-width='175px'
        @select="removeListFromInclusive"
      />
      <IconDrop class='add cursor remove-highlight'
        handle='plus'
        :options='inclusiveOrOptions'
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
  },
  computed: {
    ...mapGetters({
      l: 'l',
      sortedLists: 'list/sortedLists',
    }),
    getinclusiveORActive() {
      if (this.options.inclusiveOR.length === 0)
        return this.l['No lists selected']
      return this.options.inclusiveOR[this.options.inclusiveOR.length - 1]
    },
    inclusiveOrOptions() {
      return {
        comp: 'ListIcons',
        content: {
          allowSearch: true,
          links: this.sortedLists.map(list => {
            list.callback = () => {
              if (!this.options.inclusiveOR.find(el => el.id === list.id))
                this.options.inclusiveOR.push(list)
            }
            return list
          }),
        }
      }
    },
  },
}

</script>

<style scoped>

.add {
  display: inline-block;
  transform: translateY(4px);
  margin-left: 8px;
}

</style>
