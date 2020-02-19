
<script>

import DisplayIcon from './DisplayIcon.vue'
import WholeIcon from './WholeIcon.vue'

export default {
  functional: true,
  render(createElement, context) {
    return context.props.title || context.props.box || context.props.progress !== undefined || context.props.file || context.props.number
      ? createElement(WholeIcon, {...context.data, props: context.props}) :
        createElement(DisplayIcon, {...context.data, props: context.props})
  },
  props: ['icon', 'width', 'color', 'box',

  'progress', 'number', 'title', 'file'
  ],
}

</script>
