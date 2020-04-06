
<script>

import ActualIcon from './Icon.vue'

export default {
  functional: true,
  render(createElement, context) {
    const isDesktopDevice = window.screen.width >= 820
    return createElement(
      'span',
      {
        ...context.data,
        nativeOn: undefined,
        on: {...context.data.nativeOn, ...context.data.on},
        staticClass: context.data.staticClass + ' Icon',
        attrs: {
          ...context.data.attrs,
          [context.parent.$options._scopeId]: '',
        },
      },
      [
        createElement(
          'span',
          {
            class: ['icon', 'remove-highlight'],
            style: {
              width: (context.props.width ? context.props.width : (isDesktopDevice ? '12px' : '20px')),
              color: context.props.color,
            },
          },
          [
            createElement(
              ActualIcon,
              {
                props: {
                  icon: context.props.icon,
                },
              },
            )
          ]
        )
      ]
    )
  },
  props: ['width', 'color', 'icon'],
}

</script>

<style scoped>

.icon {
  display: inline-block;
  position: relative;
}

.Icon {
  position: relative;
  display: inline-block;
}

.primary-hover .icon:hover {
  transition-duration: .2s;
  color: var(--primary) !important;
}

</style>
