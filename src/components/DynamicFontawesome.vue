<template>
  <ft-icon v-if='fetched'
    v-bind='$props'
    v-on='$listeners'
  ></ft-icon>
</template>

<script lang='ts'>

import { Component, Vue } from 'vue-property-decorator'

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'

import appUtils from '@/utils/app'

@Component({
  props: FontAwesomeIcon.props,
})
export default class DynamicFontawesome extends Vue {
  fetched: boolean = false

  created() {
    const camel: string = appUtils.snakeToCamel('fa-' + this.$props.icon)
    import(`@fortawesome/free-solid-svg-icons/${camel}.js`).then((response: any) => {
      if (response && response.definition) {
        library.add(response.definition)
        this.fetched = true
      }
    })
  }
}

</script>
