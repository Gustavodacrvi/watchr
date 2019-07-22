<template>
  <icon-dropdown
    :handle='handle'
    :size='size'
    :min-width='minWidth'
    :change-color-on-hover='changeColorOnHover'
    :float-top='floatTop'
  >
    <div class='drop'>
      <div class='input-wrapper scroll'>
        <input
          class='margin input txt round-border gray'
          type='text'
          autocomplete='off'
          placeholder='Search...'
          v-model='search'
          :class='inputTheme'
        >
        <template v-if='list && list.length > 0'>
          <transition-group name='fade'>
            <div v-for='el in filteredArray'
              :key='el.id'
              class='element txt round-border'
              :class='theme'
              @click='select(el)'
            >
              {{ el.name }}
            </div>
          </transition-group>
        </template>
      </div>
    </div>
  </icon-dropdown>
</template>

<script lang='ts'>

import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { State } from 'vuex-class'

import IconDropdown from '@/components/IconDropdown.vue'

@Component({
  components: {
    'icon-dropdown': IconDropdown,
  },
})
export default class DropdownFinder extends Vue {
  @State theme!: string

  @Prop({default: '', type: String}) value!: string
  @Prop({default: 'dark', type: String}) inputTheme!: string
  @Prop(Array) list!: Array<{id: string, name: string}>
  @Prop({required: true, type: String}) handle!: string
  @Prop({default: 'lg', type: String}) size!: string
  @Prop({default: '250px', type: String}) minWidth!: string
  @Prop({default: false, type: Boolean}) changeColorOnHover!: boolean
  @Prop({default: false, type: Boolean}) floatTop!: boolean

  search: string | null = null

  select(value: {id: string, name: string}) {
    this.$emit('select', value)
  }

  created() {
    this.search = this.value
  }

  get filteredArray(): Array<{id: string, name: string}> {
    if (this.search !== null)
      return this.list.filter(el => el.name.includes(this.search as any))
    return this.list
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

<style scoped src='@/assets/css/authPopUp.css'>
</style>

<style scoped>

.drop {
  margin: 6px;
}

.input-wrapper {
  cursor: initial !important;
  max-height: 200px;
  overflow: auto;
}

.input {
  padding: 8px;
}

.element {
  padding: 8px;
  cursor: pointer;
}

.element.dark:hover {
  background-color: #282828;
}

.element.light:hover {
  background-color: #E6E6E6;
}


</style>
