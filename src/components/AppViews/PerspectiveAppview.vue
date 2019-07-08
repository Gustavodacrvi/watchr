<template>
  <div class='component'>
    <div class='header'>
      <dynamic-ft-icon
        :icon='pers.icon'
        :style='{color: pers.iconColor}'
        size='2x'
      />
      <span class='title'>
        {{ pers.name }}
      </span>
      <div class='right'>
        <drop-finder
          class='icon pointer txt'
          handle='search'
          size='lg'
          min-width='300px'
          v-model='search'
        />
      </div>
    </div>
    <p class='description txt'>
      {{ pers.description }}
    </p>
    <div class='tags-wrapper'>
      <div class='tags'>
        <transition-group name='fade'>
          <view-tag v-for='tag in getSmartLabels'
            :key='tag.name'
            :name='tag.name'
            :fixed='tag.fixed'
            icon='tag'
            back-color='#83B7E2'
          />
        </transition-group>
      </div>
      <transition name='fade'>
        <div class='tags' v-if="search && search !== ''">
          <view-tag
            icon='search'
            back-color='#88DDB7'
            :name='search'
            :fixed='false'
            @click="v => search = ''"
          />
        </div>
      </transition>
      <div class='tags'>
        <transition-group name='fade'>
          <view-tag v-for='tag in labels'
            :key='tag.name'
            :name='tag.name'
            :fixed='false'
            icon='tag'
            @click='deselect'
            back-color='#FF6B66'
          />
        </transition-group>
      </div>
    </div>
  </div>
</template>

<script lang='ts'>

import { Component, Vue, Watch } from 'vue-property-decorator'
import { State, Getter, namespace } from 'vuex-class'

import DynamicFontawesome from '@/components/DynamicFontawesome.vue'
import Tag from '@/components/AppViews/AppviewComponents/AppviewIcon.vue'
import DropdownFinder from '@/components/AppViews/AppviewComponents/DropdownFinder.vue'

import { SmartPerspective, Label } from '../../interfaces/app'

const labelVuex = namespace('label')

import { library } from '@fortawesome/fontawesome-svg-core'
import { faSearch } from '@fortawesome/free-solid-svg-icons'

library.add(faSearch)

@Component({
  components: {
    'dynamic-ft-icon': DynamicFontawesome,
    'view-tag': Tag,
    'drop-finder': DropdownFinder,
  },
})
export default class PerspectiveAppview extends Vue {
  @State('perspectiveData') pers!: SmartPerspective
  @Getter isDesktop!: boolean

  @labelVuex.Getter sortedLabels!: Label[]
  @labelVuex.Getter getLabelsByIds!: (ids: string[]) => Label[]

  labels: Label[] = []
  search: string = ''

  select(lab: Label) {
    if (!this.labels.find(el => el.id === lab.id))
      this.labels.push(lab)
  }
  deselect({name, icon}: {name: string, icon: string}) {
    if (icon === 'tag') {
      const index = this.labels.findIndex(el => el.name === name)
      this.labels.splice(index, 1)
    }
  }

  get getSmartLabels(): Label[] {
    const labels: any[] = []
    if (this.pers.name === 'Inbox')
      labels.push({
        name: 'Inbox',
        fixed: true,
      })
    return labels
  }
}

</script>

<style scoped>

.component {
  padding-top: 20px;
}

.header {
  position: relative;
}

.right {
  position: absolute;
  top: 50%;
  right: 0;
  transform: translateY(-50%);
}

.description {
  margin: 30px 0;
}

.tags-wrapper {
  margin-bottom: 30px;
}

.tags + .tags {
  margin-top: 6px;
}

.tag + .tag {
  margin-left: 4px;
}

.title {
  font-size: 1.5em;
  margin-left: 12px;
  color: #FF6B66;
}

</style>
