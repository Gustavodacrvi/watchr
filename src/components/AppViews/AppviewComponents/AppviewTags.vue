<template>
  <div class='tags-wrapper'>
    <div class='tags' v-if='isDefaultPerspective'>
      <view-tag
        :name='pers.name'
        :fixed='true'
        icon='tag'
        back-color='#83B7E2'
      />
    </div>
    <transition name='fade'>
      <div class='tags' v-if="search && search !== ''">
        <view-tag
          icon='search'
          back-color='#88DDB7'
          :name='search'
          :fixed='false'
          @click="$emit('clearsearch')"
        />
      </div>
    </transition>
    <div class='tags' v-if='!isDefaultPerspective'>
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
</template>

<script lang='ts'>

import { Component, Vue, Prop } from 'vue-property-decorator'
import { State } from 'vuex-class'

import Tag from '@/components/AppViews/AppviewComponents/AppviewIcon.vue'
import { Label, SmartPerspective } from '../../../interfaces/app';

@Component({
  components: {
    'view-tag': Tag,
  },
})
export default class AppviewTags extends Vue {
  @State('perspectiveData') pers!: SmartPerspective

  @Prop(String) search!: string
  @Prop(Boolean) isDefaultPerspective!: boolean

  labels: Label[] = []

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
}

</script>

<style scoped>

.tags-wrapper {
  margin-bottom: 30px;
}

.tags + .tags {
  margin-top: 6px;
}

.tag + .tag {
  margin-left: 4px;
}

</style>
