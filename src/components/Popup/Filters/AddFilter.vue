<template>
  <div class="AddFilter popup cb shadow rb" :class="platform">
    <DropInput
      back-color='var(--card)'
      placeholder="Filter name..."
      :value='name'
      @input='v => name = v'
      :focus="true"
      :disable-auto-select='true'
      :options='options'
      @select="select"
      @cancel="$emit('close')"
      @enter='addFilter'
    />
    <div class="options-wrapper">
      <div class="header">
        <div v-for="i in tabs" :key="i.icon"
          class="element cursor remove-highlight"
          @click="comp = i.icon"
          :class="{active: i.icon === comp}"
        >
          <Icon
            :icon='i.icon'
            :color='i.color'
          />
        </div>
      </div>
      <transition name="fade-t" mode="out-in">
        <component class="component-options" :is="comp"
          v-bind="{
            options: filterOptions[comp],
          }"
        />
      </transition>
    </div>
  </div>
</template>

<script>

import DropInputVue from '../../Auth/DropInput.vue'
import ButtonVue from '../../Auth/Button.vue'
import Icon from '@/components/Icon.vue'

import priority from './FilterTabs/priority.vue'
import tasks from './FilterTabs/tasks.vue'
import calendar from './FilterTabs/calendar.vue'

import { mapGetters, mapState } from 'vuex'

export default {
  components: {
    Icon, priority, tasks,
    calendar,
    DropInput: DropInputVue,
    ButtonApp: ButtonVue,
  },
  data() {
    return {
      name: '',
      options: [],

      comp: 'priority',
      tabs: [
        {
          icon: 'priority',
          color: 'var(--yellow)',
        },
        {
          icon: 'tasks',
          color: 'var(--primary)',
        },
      ],
      filterOptions: {
        priority: {
          inclusiveOR: [],
        },
        tasks: {
          inclusiveOR: [],
          exclusive: [],
        }
      },
    }
  },
  created() {
    if (this.isEditing) this.name = this.payload.name
  },
  computed: {
    ...mapGetters(['platform']),
    ...mapState({
      filters: state => state.filter.filters,
      popup: state => state.popup,
      payload: state => state.popup.payload,
    }),
    isEditing() {
      if (!this.payload) return false
      return this.payload.editing === true
    },
    title() {
      if (!this.isEditing) return 'Add filter'
      return 'Edit filter'
    },
  },
  methods: {
    addFilter() {
      const toast = (toast) => {
        this.$store.commit('pushToast', toast)
      }
      if (this.name) {
        const filter = this.filters.find(el => el.name === this.name)
        if (!filter && !this.isEditing) {
          this.$store.dispatch('filter/addFilter', {
            name: this.name,
            ...this.payload,
          })
          toast({
            name: `Filter added successfully!`,
            type: 'success',
            seconds: 2,
          })
          this.$store.dispatch('closePopup')
        } else if (!filter && this.isEditing) {
          this.$store.dispatch('filter/saveFilter', {
            name: this.name,
            id: this.payload.id,
          })
          toast({
            name: `Filter edited successfully!`,
            type: 'success',
            seconds: 2,
          })
        } else {
          toast({
            name: `This filter already exists!`,
            type: 'error',
            seconds: 3,
          })
        }
      } else {
        toast({
          name: 'Fill in all the required fields.',
          type: 'error',
          seconds: 3,
        })
      }
    },
    select(val) {
      this.name = val
      setTimeout(() => {
        this.options = []
      })
    }
  },
  watch: {
    name() {
      this.options = this.filters.filter(el => el.name.toLowerCase().includes(this.name.toLowerCase())).map(el => el.name)
    }
  }
}

</script>

<style scoped>

.options-wrapper {
  margin: 12px;
}

.header {
  display: flex;
  height: 35px;
  overflow: hidden;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
}

.element {
  flex-basis: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  transform: scale(1,1);
  transition-duration: .2s;
}

.element:hover {
  background-color: var(--light-gray);
}

.element:active, .element.active {
  background-color: var(--extra-light-gray);
}

.component-options {
  margin: 8px;
}

</style>

<style scoped src="@/assets/css/popupAuth.css">
</style>
