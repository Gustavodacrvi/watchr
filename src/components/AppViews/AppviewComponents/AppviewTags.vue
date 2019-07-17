<template>
  <div class='tags-wrapper'>
    <transition name='fade'>
      <div class='tags'>
        <view-tag v-if='fixedPers'
          :name='fixedPers'
          :fixed='true'
          icon='layer-group'
          back-color='#83B7E2'
        />
        <view-tag v-if="priority && priority !== ''"
          icon='exclamation'
          back-color='#70ff66'
          :name='priority'
          :fixed='false'
          @click="$emit('clearpriority')"
        />
        <view-tag v-if="search && search !== ''"
          icon='search'
          back-color='#88DDB7'
          :name='search'
          :fixed='false'
          @click="$emit('clearsearch')"
        />
      </div>
    </transition>
    <div v-if='labels && labels.length > 0' class='tags'>
      <transition-group name='fade'>
        <view-tag v-for='lab in labels'
          :key='lab.id'
          icon='tag'
          back-color='#FF6B66'
          :name='lab.name'
          :fixed='false'
          @click="$emit('removelabel', lab.id)"
        />
      </transition-group>
    </div>
  </div>
</template>

<script lang='ts'>

import { Component, Vue, Prop } from 'vue-property-decorator'
import { State } from 'vuex-class'

import Tag from '@/components/AppViews/AppviewComponents/AppviewTag.vue'

import { Label } from '../../../interfaces/app'

@Component({
  components: {
    'view-tag': Tag,
  },
})
export default class AppviewTags extends Vue {
  @Prop({default: undefined, type: String}) search!: string
  @Prop({default: undefined, type: String}) fixedPers!: string
  @Prop({default: undefined, type: String}) priority!: string
  @Prop({default: undefined, type: Array}) labels!: Label[]
}

</script>

<style scoped>

.toggle-icon {
  float: right;
  margin-bottom: 5px;
}

.tags + .tags {
  margin-top: 6px;
}

.tag + .tag {
  margin-left: 4px;
}

</style>
