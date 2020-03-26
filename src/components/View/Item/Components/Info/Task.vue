
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
        color: p.listObj.color || 'var(--txt)',
      }))
    if (p.folderObj)
      c.push(get({
        name: p.folderObj.name,
        icon: 'folder',
        color: p.folderObj.color || 'var(--txt)',
      }))
    if (p.groupObj)
      c.push(get({
        name: p.groupObj.name,
        icon: 'group',
        color: p.groupObj.color || 'var(--txt)',
      }))
    
    if (p.deadlineStr)
      c.push(get({
        name: p.deadlineStr,
        icon: 'deadline',
        color: 'var(--red)',
      }))
    if (p.calendarStr && !p.isToday && !p.isTomorrow)
      c.push(get({
        name: p.calendarStr,
        icon: p.isRepeatingTask ? 'repeat' : 'calendar',
        color: p.isRepeatingTask ? 'var(--txt)' : 'var(--green)',
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
    'isToday', 'isTomorrow', 'isRepeatingTask', 'calendarStr', 'deadlineStr',
    'timeStr', 'hasTags', 'tagNames', 'hasFiles', 'taskDuration', 'listObj',
    'folderObj', 'groupObj'
  ]
}

</script>
