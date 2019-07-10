<template>
  <div class='tags-wrapper'>
    <dynamic-ft-icon
      class='toggle-icon pointer icon'
      icon='bars'
      size='lg'
      @click='showing = !showing'
    />
    <transition name='fade'>
      <div v-if='showing' class='tags'>
        <view-tag v-if='fixedTag'
          :name='fixedTag'
          :fixed='true'
          icon='tag'
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
  </div>
</template>

<script lang='ts'>

import { Component, Vue, Prop } from 'vue-property-decorator'
import { State } from 'vuex-class'

import Tag from '@/components/AppViews/AppviewComponents/AppviewTag.vue'
import FontAwesome from '@/components/DynamicFontawesome.vue'

@Component({
  components: {
    'view-tag': Tag,
    'dynamic-ft-icon': FontAwesome,
  },
})
export default class AppviewTags extends Vue {
  @Prop(String) fixedTag!: string
  @Prop(String) search!: string
  @Prop(String) priority!: string

  showing: boolean = true
}

</script>

<style scoped>

.toggle-icon {
  float: right;
  margin-bottom: 5px;
}

.tags {
  margin-bottom: 25px;
}

.tags + .tags {
  margin-top: 6px;
}

.tag + .tag {
  margin-left: 4px;
}

</style>
