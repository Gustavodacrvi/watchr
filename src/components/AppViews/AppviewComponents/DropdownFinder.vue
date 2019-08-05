<template>
  <icon-dropdown
    :handle='handle'
    :size='size'
    :min-width='minWidth'
    :change-color-on-hover='changeColorOnHover'
    :float-top='floatTop'
    @click='pushCard'
  >
    <div v-if='isDesktop || disableCenteredCard' class='drop'>
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
import { State, Getter, Mutation } from 'vuex-class'

import IconDropdown from '@/components/IconDropdown.vue'

import { CenteredCard } from '../../../store'
import { ListIcon } from '../../../interfaces/app'

@Component({
  components: {
    'icon-dropdown': IconDropdown,
  },
})
export default class DropdownFinder extends Vue {
  @State theme!: string
  @State centeredCard!: CenteredCard
  @Mutation pushCenteredCard!: (obj: CenteredCard) => void
  @Getter isDesktop!: boolean

  @Prop({default: '', type: String}) value!: string
  @Prop({default: 'dark', type: String}) inputTheme!: string
  @Prop(Array) list!: Array<{id: string, name: string}>
  @Prop({required: true, type: String}) handle!: string
  @Prop({default: 'lg', type: String}) size!: string
  @Prop({default: '250px', type: String}) minWidth!: string
  @Prop(Boolean) changeColorOnHover!: boolean
  @Prop(Boolean) floatTop!: boolean
  @Prop(Boolean) disableCenteredCard!: boolean

  search: string | null = null

  created() {
    this.search = this.value
  }

  select(value: {id: string, name: string}) {
    this.$emit('select', value)
  }
  pushCard() {
    if (!this.disableCenteredCard && !this.isDesktop)
      this.pushCenteredCard({
        type: 'ListIcons',
        search: true,
        compName: '',
        listIcons: this.listIconFromList,
        flexBasis: '250px',
        maxHeight: '240px',
        listIconHandler: (name: string) => {
          const el = this.list.find(e => e.name === name)
          if (el)
            this.select(el)
        },
      })
  }
  get filteredArray(): Array<{id: string, name: string}> {
    if (this.search !== null)
      return this.list.filter(el => el.name.includes(this.search as any))
    return this.list
  }
  get listIconFromList(): ListIcon[] {
    const els: ListIcon[] = []
    for (const val of this.list)
      els.push({
        name: val.name,
        icon: '',
        iconColor: '',
        size: 'lg',
      })
    els.sort((a: any, b: any) => a.name.localeCompare(b.name))
    return els
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

.element:hover {
  background-color: #282828;
}

</style>
