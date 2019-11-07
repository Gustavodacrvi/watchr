<template>
  <div class="Lists">
    <Renderer
      type="list"
      icon="tasks"
      iconColor='var(--purple)'
      :disableSelection='true'
      :enableSort="true"
      :illustration="illustration"
      :list="getList"
      :active="active"
      :viewType="viewType"
      :mapProgress='getListProgress'
      :mapNumbers="(tasks) => tasks"
      :mapHelpIcon='getListIcon'
      @buttonAdd='buttonAdd'
      @update='update'
    />
    <div style="height: 100px"></div>
  </div>
</template>

<script>

import RendererVue from '../Renderer.vue'

import utilsList from '@/utils/list'

import { mapGetters, mapState } from 'vuex'

export default {
  components: {
    Renderer: RendererVue,
  },
  props: ['active', 'viewType'],
  methods: {
    update(ids) {
      this.$store.dispatch('list/updateOrder', ids)
    },
    buttonAdd(obj) {
      this.$store.dispatch('pushPopup', {comp: 'AddList', payload: {...obj}})
    },
    getListProgress(list) {
      return this.$store.getters['list/pieProgress'](this.tasks, list.id)
    },
    getListIcon(list) {
      let isShared = false
      let numberOfUsers = 0
      for (const key of Object.keys(list.users)) {
        if (list.users[key] === true) numberOfUsers++
        if (numberOfUsers > 1) {
          isShared = true
          break
        }
      }
      if (isShared) return 'users'
      return undefined
    },
  },
  computed: {
    ...mapState({
      tasks: state => state.task.tasks,
      user: state => state.user,
    }),
    ...mapGetters(['l']),
    sortedLists() {
      return this.$store.getters['list/sortedLists']
    },
    getList() {
      const lists = this.sortedLists
      for (const list of lists) {
        list.callback = () => {
          this.$router.push('/user?list=' + list.name)
        }
        if (list.deferDate) console.log(list.deferDate)
        list.options = utilsList.listOptions(list, this.$store, this.$store.getters['task/getListTasks'](this.tasks, list.id), this.l)
      }
      return lists
    },
    illustration() {
      let descr = this.l["You can add one by dropping the plus floating button in this region."]
      if (!this.isDesktop)
        descr = this.l["You can add one by clicking on the right corner icon."]
      return {
        descr,
        name: 'List',
        title: this.l["You don't have any lists."],
        width: '80px'
      }
    },
  },
}

</script>
