
<script>

import InfoEl from "./InfoEl.vue"

export default {
  functional: true,
  render(create, p) {
    const get = props => create(InfoEl, props)

    const c = []

    if (p.deadlineStr)
      c.push(get({
        name: p.deadlineStr,
        icon: 'deadline',
        color: 'var(--red)',
      }))
    if (p.calendarStr && p.isToday && p.isTomorrow)
      c.push(get({
        name: p.calendarStr,
        icon: 'calendar',
        color: 'var(--green)',
      }))
    if (p.timeStr)
      c.push(get({
        name: p.timeStr,
        icon: 'duration',
        color: 'var(--green)',
      }))
    if (p.hasTags)
      c.push(get({
        name: '',
        icon: 'file',
        color: 'var(--txt)',
      }))

    return create('div', {class: 'info'}, c)
  },
  props: [
    'isToday', 'isTomorrow', 'isRepeatingTask', 'calendarStr', 'deadlineStr',
    'timeStr', 'hasTags', 'haveFiles'
  ]
}

</script>

<style scoped>

.txt-wrapper {
  display: inline-flex;
  align-items: center;
}

.txt-wrapper + .txt-wrapper {
  margin-left: 6px;
}

.txt-icon {
  transform: translateY(1px);
}

.txt-name {
  margin-left: 4px;
}

</style>
