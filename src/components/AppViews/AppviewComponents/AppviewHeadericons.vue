<template>
  <div class='right'>
    <transition name='fade'>
      <span v-if='showTaskOptions && isDesktop' class='header-option'>
        <icon-options
          handle='exclamation'
          size='lg'
          min-width='200px'
          title='Change priority'
          :options='priorityOptions'
          @click='multiplePriority'
        />
      </span>
    </transition>
    <transition name='fade'>
      <span v-if='showTaskOptions && isDesktop' class='header-option'>
        <i
          class='fas icon pointer trash fa-trash fa-lg'
          title='Delete tasks'
          @click="$emit('delete')"
        ></i>
      </span>
    </transition>
    <span style='width: 35px'></span>
    <span v-if='allowSearch' class='header-option'>
      <drop-finder
        class='icon pointer txt'
        handle='search'
        size='lg'
        min-width='300px'
        title='Search tasks'
        v-model='search'
      />
    </span>
    <span v-if='allowPriority' class='header-option'>
      <icon-options
        handle='exclamation'
        size='lg'
        min-width='200px'
        title='Priority'
        :options='priorityOptions'
        @click='selectPriority'
      />
    </span>
    <span v-if='allowLabels' class='header-option'>
      <drop-finder
        handle='tags'
        size='lg'
        min-width='300px'
        title='Labels'
        :list='labels'
        @select='selectLabel'
      />
    </span>
    <span v-if='allowSettings' class='header-option'>
      <icon-options
        handle='ellipsis-h'
        size='lg'
        min-width='300px'
        :options='settingsOptions'
        @click='selectSettingsOption'
      />
    </span>
  </div>
</template>

<script lang='ts'>

import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { Getter, namespace } from 'vuex-class'

import DropdownFinder from '@/components/AppViews/AppviewComponents/DropdownFinder.vue'
import IconOptions from '@/components/AppViews/AppviewComponents/AppviewIconoptions.vue'

const labelsVuex = namespace('label')

import { ListIcon, Label } from '../../../interfaces/app'

@Component({
  components: {
    'drop-finder': DropdownFinder,
    'icon-options': IconOptions,
  },
})
export default class AppviewHeadericons extends Vue {
  @Getter isDesktop!: boolean

  @labelsVuex.State labels!: Label[]

  @Prop(String) value!: string
  @Prop(Boolean) showTaskOptions!: boolean
  @Prop(Boolean) allowSearch!: boolean
  @Prop(Boolean) allowSettings!: boolean
  @Prop(Boolean) allowLabels!: boolean
  @Prop(Boolean) allowPriority!: boolean

  search: string = ''
  priorityOptions: ListIcon[] = [
   {
      name: 'High priority',
      icon: 'exclamation',
      iconColor: '#FF6B66',
      size: 'lg',
    },
    {
      name: 'Medium priority',
      icon: 'exclamation',
      iconColor: '#fff566',
      size: 'lg',
    },
    {
      name: 'Low priority',
      icon: 'exclamation',
      iconColor: '#70ff66',
      size: 'lg',
    },
  ]
  settingsOptions: ListIcon[] = [
   {
      name: 'Sort tasks by name',
      icon: 'sort-alpha-down',
      iconColor: '',
      size: 'lg',
    },
    {
      name: 'Sort tasks by priority',
      icon: 'exclamation',
      iconColor: '',
      size: 'lg',
    },
  ]

  created() {
    this.search = this.value
  }

  selectSettingsOption(value: string) {
    this.$emit('settings', value)
  }
  selectPriority(value: string) {
    this.$emit('priority', value)
  }
  multiplePriority(value: string) {
    this.$emit('selectedpriority', value)
  }
  selectLabel(label: Label) {
    this.$emit('label', label)
  }

  @Watch('search')
  onChange() {
    this.$emit('input', this.search)
  }
  @Watch('value')
  onChange2() {
    this.search = this.value
  }
}

</script>

<style scoped src='@/assets/css/appView.css'>
</style>
