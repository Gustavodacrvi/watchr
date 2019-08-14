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
      <view-tag v-for='tag in smartPers'
        :key='tag'
        icon='layer-group'
        back-color='#6b66ff'
        :name='tag'
        :fixed='false'
        @click="$emit('removesmartpers', tag)"
      />
    </div>
    <div class='tags'>
      <view-tag v-for='lab in getLabels'
        :key='lab.id'
        icon='tag'
        back-color='#FF6B66'
        :name='lab.name'
        :fixed='false'
        @click="$emit('removelabel', lab.id)"
      />
    </div>
    <div class='tags'>
      <transition name='fade'>
        <view-tag v-if='calendar'
          icon='calendar-day'
          back-color='#9CE283'
          :name='calendar'
          :fixed='false'
          @click="$emit('removecalendar')"
        />
      </transition>
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
  @Prop(String) calendar!: string
  @Prop(Array) labels!: Label[]
  @Prop(Array) smartPers!: Label[]

  get getLabels(): Label[] {
    return this.labels.sort((lab1, lab2) => lab1.name.localeCompare(lab2.name))
  }
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
