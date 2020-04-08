
<script>

import InfoEl from "./InfoEl.vue"

export default {
  functional: true,
  render(create, context) {
    const get = props => create(InfoEl, {props})

    const p = context.props
    const c = []

    if (p.listObj)
      c.push(get({
        name: p.listObj.name,
        icon: 'tasks',
        color: p.listObj.color,
      }))
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

    if (p.evening)
      c.push(get({
        name: '',
        icon: 'moon',
        color: 'var(--dark-purple)',
      }))
    if (p.timeStr)
      c.push(get({
        name: p.timeStr,
        icon: 'clock',
        color: 'var(--yellow)',
      }))
    if (p.taskDuration)
      c.push(get({
        name: p.taskDuration,
        icon: 'duration',
        color: 'var(--purple)',
      }))
    if (p.hasTags && p.tagNames && p.tagNames.length > 0)
      c.push(get({
        name: p.tagNames.reduce((acc, str) => acc + str + ', ', '').split("").reverse().join("").substr(2).split("").reverse().join(""),
        icon: 'tag',
        color: 'var(--red)',
      }))
    if (p.hasFiles)
      c.push(get({
        name: '',
        icon: 'file',
        color: 'var(--txt)',
      }))

    return create('div', {class: 'info'}, c)
  },
  props: [
    'isToday', 'isTomorrow',
    'timeStr', 'hasTags', 'tagNames', 'hasFiles', 'taskDuration', 'listObj',
    'folderObj', 'groupObj', 'evening',
  ]
}

</script>
