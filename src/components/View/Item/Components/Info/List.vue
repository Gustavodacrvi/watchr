<script>

import InfoEl from "./InfoEl.vue"

export default {
  functional: true,
  render(create, context) {
    const get = props => create(InfoEl, {props})

    const p = context.props
    const c = []

    if (p.folderObj)
      c.push(get({
        name: p.folderObj.name,
        icon: 'folder',
        color: p.folderObj.color,
      }))
    if (p.groupObj)
      c.push(get({
        name: p.groupObj.name,
        icon: 'group',
        color: p.groupObj.color,
      }))
    if (p.hasTags && p.tagNames && p.tagNames.length > 0)
      c.push(get({
        name: p.tagNames.reduce((acc, str) => acc + str + ', ', '').split("").reverse().join("").substr(2).split("").reverse().join(""),
        icon: 'tag',
        color: 'var(--red)',
      }))

    return create('div', {class: 'info'}, c)
  },
  props: [
    'tagNames', 'hasTags', 'folderObj', 'groupObj',
  ]
}

</script>