
import mom from 'moment'

import { fire } from '@/store/'
import { cacheBatchedItems, setTask } from '@/utils/firestore'

export default {
  methods: {
    autoScheduleItems(vm, calendarDate, obj, tasks) {
      if (!calendarDate)
        return;
      const {time, buffer, fallback, overwrite} = obj
      
      const batch = fire.batch()
      
      const writes = []

      const init = mom(time, 'HH:mm')

      for (const t of tasks) {
        const duration = t.taskDuration || fallback
        const c = {...(t.calendar || {
          type: 'specific',
          editDate: calendarDate,
          begins: calendarDate,
    
          specific: calendarDate,
        })}
        if (c.time && !overwrite)
          continue
        
        c.time = init.format('HH:mm')

        const add = str => {
          const split = str.split(':')
  
          init.add(parseInt(split[0], 10), 'h')
          init.add(parseInt(split[1], 10), 'm')
        }

        add(duration)
        add(buffer)

        if (!mom(c.time, 'HH:mm').isValid() || !mom(duration, 'HH:mm').isValid())
          break

        setTask(batch, {
          taskDuration: duration,
          calendar: c,
        }, vm.$store.state, t.id, writes)
      }

      cacheBatchedItems(batch, writes)

      batch.commit()
      return init.format('HH:mm')
    },
  },
}
