<template>
  <div class='tags-wrapper'>
    <div class='tags'>
      <transition-group name='fade'>
        <view-tag key='fixed' v-if='fixedTag'
          :name='fixedTag.name'
          :fixed='true'
          :icon='fixedTag.icon'
          :back-color='fixedTag.backColor'
        />
        <view-tag key='priority' v-if="priority && priority !== ''"
          icon='exclamation'
          back-color='#70ff66'
          :name='priority'
          :fixed='false'
          @click="$emit('clearpriority')"
        />
        <view-tag key='search' v-if="search && search !== ''"
          icon='search'
          back-color='#88DDB7'
          :name='search'
          :fixed='false'
          @click="$emit('clearsearch')"
        />
      </transition-group>
    </div>
    <div class='tags'>
      <view-tag v-for='lab in labels'
        :key='lab.id'
        icon='tag'
        back-color='#83B7E2'
        :name='lab.name'
        :fixed='false'
        @click="$emit('removelabel', lab.id)"
      />
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
  @Prop(String) search!: string
  @Prop(Object) fixedTag!: object
  @Prop(String) priority!: string
  @Prop(Array) labels!: Label[]
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
