<template>
  <div>
    <div class='header title'>
      <span class='title'>LABELS</span>
    </div>
    <list-renderer
      :list='labels'
    />
  </div>
</template>

<script lang='ts'>

import { Component, Vue } from 'vue-property-decorator'
import { namespace } from 'vuex-class'

import ListRenderer from '@/components/TheAppBar/AppnavComponents/ListRenderer.vue'
import { Label } from '../../../interfaces/app';

const label = namespace('label')

@Component({
  components: {
    'list-renderer': ListRenderer,
  },
})
export default class LabelAppnav extends Vue {
  @label.State labels!: Label[]
}

</script>

<style scoped src='@/assets/css/appnavSections.css'>
</style>
