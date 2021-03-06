
import mom from 'moment'
import utilsMoment from "./moment"
import utilsTask from "./task"
import timelineUtils from "@/utils/timeline"
import firebase from 'firebase/app'

import Vue from 'vue'
import IconDrop from '@/components/IconDrop/IconDrop.vue'

import LoadingComponent from '../components/Illustrations/LoadingComponent.vue'
import ErrorComponent from '../components/Illustrations/ErrorComponent.vue'

let contextMenuRunned = false

export default {
  folderOptions(vm, callback) {
    const links = []
    const folders = vm.$store.getters['folder/sortedFoldersByName']
    
    for (const fold of folders) {
      links.push({
        name: fold.name,
        icon: 'folder',
        callback: () => callback({
          folder: fold.id,
          group: null,
          list: null,
          heading: null,
        }),
      })
    }
    return {
      allowSearch: true,
      links,
    }
  },
  tagsOptions(vm, defaultTags, callback, returnIds = false) {
    const tags = vm.$store.getters['tag/sortedTagsByName']
    return {
      onSave: !returnIds ? callback : names => callback(
        (tags || []).filter(t => names.includes(t.name)).map(el => el.id),
      ),
      links: tags.map(t => ({...t, icon: 'tag'})),
      select: true,
      selected: defaultTags || [],
      allowSearch: true,
    }
  },
  groupOptions(vm, callback) {
    const links = []
    const groups = vm.$store.getters['group/sortedGroupsByName']
    
    for (const gro of groups) {
      links.push({
        name: gro.name,
        icon: 'group',
        callback: () => callback({
          folder: null,
          group: gro.id,
          list: null,
          heading: null,
        }),
      })
    }
    return {
      allowSearch: true,
      links,
    }
  },
  listsOptions(vm, callback) {
    const links = []
    const lists = vm.$store.getters['list/sortedListsByName']
    for (const list of lists) {
      links.push({
        name: list.name,
        icon: 'tasks',
        callback: () => {
          const arr = [{
            name: 'List root',
            callback: () => callback({
              list: list.id,
              heading: null,
              group: null,
              folder: null,
            })
          }]
          for (const h of list.headings) {
            arr.push({
              name: h.name,
              icon: 'heading',
              callback: () => callback({
                list: list.id,
                heading: h.id,
                group: null,
                folder: null,
              })
            })
          }
          return arr
        }
      })
    }
    return {
      allowSearch: true,
      links,
    }
  },
  moveItemsBetweenLists(source, newList, ids, indicies) {
    const items = []
    for (const id of ids) {
      for (let i = 0;i < source.length;i++) {
        const t = source[i]
        if (t.id === id) {
          items.push(t)
          source.splice(i, 1)
          break
        }
      }
    }

    for (let i = 0; i < ids.length;i++) {
      newList.splice(indicies[i], 0, items[i])
    }
  },
  getInfoFromAddSortableEvt(evt, itemClass) {
    const items = evt.items
    if (items.length === 0) items.push(evt.item)
    const type = items[0].dataset.type
    for (let i = 0; i < items.length;i++) {
      const s = items[i].style
      s.transitionDuration = 0
      s.height = '0px'
      s.overflow = 'hidden'
      items[i].remove()
    }

    const repeated = items.map(el => el.dataset.id)
    const ids = []
    const set = new Set()
    for (const id of repeated) {
      if (!set.has(id)) {
        ids.push(id)
        set.add(id)
      }
    }

    let targetElement = null
    if (itemClass && evt.originalEvent.toElement) {
      targetElement = evt.originalEvent.toElement

      while (true) {
        if (targetElement && targetElement.classList && targetElement.classList.contains(itemClass))
         break
        else {
          if (!targetElement.parentNode) {
            targetElement = null
            break
          }
          targetElement = targetElement.parentNode
        }
      }
    }

    const oldIndicies = evt.oldIndicies
    if (oldIndicies.length === 0)
      oldIndicies.push({
        multiDragElement: evt.item,
        index: evt.oldIndex
      })
    
    const indicies = evt.newIndicies.map(el => el.index)
    if (indicies.length === 0) indicies.push(evt.newIndex)
    return {type, ids, items, indicies, oldIndicies, targetElement}
  },
  removeSortableItemsOnRemove(items, indicies, root, deSelectItem) {
    for (let i = 0; i < indicies.length;i++) {
      const s = items[i].style
      s.transitionDuration = 0
      s.transition = 'none'
      s.height = '0px'
      s.maxHeight = '0px'
      s.overflow = 'hidden'
      root.insertBefore(items[i], root.children[indicies[i]])
    }

    if (deSelectItem)
      items.forEach(deSelectItem)
  },
  
  sortListByName(lists, property = 'name') {
    return lists.slice().sort((a, b) => a[property].toLowerCase().localeCompare(b[property].toLowerCase()))
  },
  getAutoSchedulerIconDropObject(saveAutoSchedule, userInfo) {
    return {
      name: 'Auto schedule',
      icon: 'magic',
      callback: () => this.getScheduleIconDropObject(null, saveAutoSchedule, userInfo)
    }
  },
  getScheduleIconDropObject(info, saveAutoSchedule, userInfo) {


    if (!info)
      info = {
        time: timelineUtils.formatMin(
          timelineUtils.round(5,
            timelineUtils.getFullMin(mom().format('HH:mm')),
            true,
          ),
        ),
        buffer: localStorage.getItem('watchr.autoSchedule.buffer') || '00:05',
        fallback: localStorage.getItem('watchr.autoSchedule.fallback') || '00:10',
      }

    const {time, buffer, fallback, overwrite} = info

    const formatTime = time => mom(time, 'HH:mm').format(userInfo.disablePmFormat ? 'HH:mm' : 'LT')

    return {
      comp: 'InfoList',
      content: {
        width: '290px',
        links: [
          {
            name: 'Start schedule from',
            value: formatTime(time),
            info: 'The start time of the timeline.',
            callback: () => ({
              comp: 'TimePicker',
              content: {
                msg: 'Start schedule from:',
                callback: newTime => this.getScheduleIconDropObject({
                  time: newTime, buffer, fallback, overwrite,
                }, saveAutoSchedule, userInfo)
              }
            })
          },
          {
            name: 'Buffer time',
            value: this.formatQuantity(buffer),
            info: 'Add some breathing room after each item for short breaks or minor delays.',
            callback: () => ({
              comp: 'DurationPicker',
              content: {
                callback: newBuffer => this.getScheduleIconDropObject({
                  time, buffer: newBuffer, fallback, overwrite,
                }, saveAutoSchedule, userInfo)
              }
            })
          },
          {
            name: 'Assume duration of',
            value: this.formatQuantity(fallback),
            info: 'Items without a specific duration will adopt this value for the purpose of auto-scheduling.',
            callback: () => ({
              comp: 'DurationPicker',
              content: {
                callback: newFallback => this.getScheduleIconDropObject({
                  time, buffer, fallback: newFallback, overwrite,
                }, saveAutoSchedule, userInfo)
              }
            })
          },
          {
            name: 'Overwrite task time',
            icon: {
              name: overwrite ? 'box-check' : 'box',
            },
            callback: () => this.getScheduleIconDropObject({
              time, buffer, fallback, overwrite: !overwrite,
            }, saveAutoSchedule, userInfo),
          },
          {
            icon: {
              color: 'var(--yellow)',
              name: 'magic',
            },
            name: 'Start auto-schedule',
            callback: () => {
              localStorage.setItem('watchr.autoSchedule.buffer', info.buffer)
              localStorage.setItem('watchr.autoSchedule.fallback', info.fallback)
              saveAutoSchedule({...info})
              return null
            },
          },
        ],
      }
    }
  },
  matchCalendarHelperList(search, onlySpecific = true) {
    const specificKeywords = [
      'next week', 'next month', 'end of month', 'end of week',
      'end of year', 'mid month', 'next year', 'next sunday', 'next monday',
      'next tuesday', 'next wednesday', 'next thursday', 'next friday', 'next saturday',
    ]

    const periodic = [
      'every day', 'every day after', 'every sunday', 'every monday', 'every tuesday', 'every wednesday', 'every thursday', 'every friday', 'every saturday',
    ]

    const filter = str => str.toLowerCase().includes(search.toLowerCase())

    let arr = specificKeywords.filter(filter).map(str => ({
      id: str,
      name: str,
      icon: 'calendar',
      trigger: 'enter',
    }))

    if (!onlySpecific)
      arr = [
        ...arr,
        ...periodic.filter(filter).map(str => ({
          id: str,
          name: str,
          icon: 'repeat',
          trigger: 'enter',
        }))
      ]

    return arr
  },
  calendarObjNaturalCalendarInput(str, disablePmFormat) {
    const tod = mom()
    const TOD_STR = tod.format('Y-M-D')
    const format = disablePmFormat ? 'HH:mm' : 'LT'
    
    const matches = []
    let cal = null
    
    const get = obj => ({
      editDate: TOD_STR,
      begins: TOD_STR,
      ...obj,
    })
    const spec = str => get({
      type: 'specific',
      specific: str,
    })

    const setMonth = (num, calend) => {
      if (calend && calend.type === 'specific') {
        const time = mom(calend.specific, 'Y-M-D')
        time.month(num)
        return spec(time.format('Y-M-D'))
      }
    }

    const getWeekSpecific = week => spec(utilsMoment.nextWeekDay(tod, week, 'ddd', true).format('Y-M-D'))

    const parseUserGeneratedDate = (str, forma) => {
      const date = mom(str.replace(/\//gi, '-').replace(/\./gi, '-'), forma, true)
      return date.isValid() ? spec(date.format('Y-M-D')) : null
    }

    const specificMatches = [
      {
        match: ' next week',
        get: () => spec(tod.clone().add(1, 'week').startOf('week').add(1, 'd').format('Y-M-D'))
      },
      {
        match: ' next month',
        get: () => spec(tod.clone().add(1, 'month').startOf('month').format('Y-M-D')),
      },
      {
        match: ' end of month',
        get: () => spec(tod.clone().endOf('month').format('Y-M-D')),
      },
      {
        match: ' end of week',
        get: () => spec(tod.clone().endOf('week').format('Y-M-D')),
      },
      {
        match: ' end of year',
        get: () => spec(tod.clone().endOf('year').format('Y-M-D')),
      },
      {
        match: ' mid month',
        get: () => spec(tod.clone().month(Math.floor(tod.daysInMonth() / 2)).format('Y-M-D')),
      },
      {
        match: ' next year',
        get: () => spec(tod.clone().add(1, 'year').startOf('year').format('Y-M-D')),
      },
      {
        match: ' in (\\d+) (\\w+)',
        get: (match, str) => {
          
          const split = str.split(' ')
          const num = parseInt(split[1], 10)
          const type = split[split.length - 1]

          const types = [
            'hours', 'days', 'weeks',
            'months', 'years',
          ]

          let calend
          if (num && type && types.includes(type)) {
            if (type !== 'hours') {
              calend = spec(tod.clone().add(num, type).format('Y-M-D'))
            } else {
              const mo = tod.clone().add(num, 'hours')
              calend = spec(mo.format('Y-M-D'))
              calend.time = mo.format('HH:mm')
            }
            matches.push(str)
            return calend
          }
          return null
        },
      },
      {
        match: ' (((0[1-9]|[12][0-9]|30)[-/.]?(0[13-9]|1[012])|31[-/.]?(0[13578]|1[02])|(0[1-9]|1[0-9]|2[0-8])[-/.]?02)[-/.]?[0-9]{4}|29[-/.]?02[-/.]?([0-9]{2}(([2468][048]|[02468][48])|[13579][26])|([13579][26]|[02468][048]|0[0-9]|1[0-6])00))',
        get: (m, str) => parseUserGeneratedDate(str, 'DD-MM-YYYY'),
      },
      {
        match: ' (((0[13-9]|1[012])[-/]?(0[1-9]|[12][0-9]|30)|(0[13578]|1[02])[-/]?31|02[-/]?(0[1-9]|1[0-9]|2[0-8]))[-/]?[0-9]{4}|02[-/]?29[-/]?([0-9]{2}(([2468][048]|[02468][48])|[13579][26])|([13579][26]|[02468][048]|0[0-9]|1[0-6])00))',
        get: (m, str) => parseUserGeneratedDate(str, 'MM-DD-YYYY'),
      },
      {
        match: ' ([0-9]{4}[-/]?((0[13-9]|1[012])[-/]?(0[1-9]|[12][0-9]|30)|(0[13578]|1[02])[-/]?31|02[-/]?(0[1-9]|1[0-9]|2[0-8]))|([0-9]{2}(([2468][048]|[02468][48])|[13579][26])|([13579][26]|[02468][048])00)[-/]?02[-/]?29)',
        get: (m, str) => parseUserGeneratedDate(str, 'YYYY-MM-DD'),
      },
      {
        match: '\\s([0-3][0-9])th',
        get: (match, str) => {
          const time = mom('' + parseInt(str, 10), 'D')

          let calend
          if (time.isValid()) {
            if (time.isAfter(tod, 'day'))
              calend = spec(time.format('Y-M-D'))
            else
              calend = spec(time.add(1, 'month').format('Y-M-D'))
            matches.push(str)
            return calend
          }
          return null
        },
      },
      {
        match: ' (january|jan)(?!(\\w+))',
        ignoreOtherMatches: true,
        get: (m, s, calend) => setMonth(0, calend),
      },
      {
        match: ' (february|feb)(?!(\\w+))',
        ignoreOtherMatches: true,
        get: (m, s, calend) => setMonth(1, calend),
      },
      {
        match: ' (march|mar)(?!(\\w+))',
        ignoreOtherMatches: true,
        get: (m, s, calend) => setMonth(2, calend),
      },
      {
        match: ' (april|apr)(?!(\\w+))',
        ignoreOtherMatches: true,
        get: (m, s, calend) => setMonth(3, calend),
      },
      {
        match: ' (may)(?!(\\w+))',
        ignoreOtherMatches: true,
        get: (m, s, calend) => setMonth(4, calend),
      },
      {
        match: ' (june|jun)(?!(\\w+))',
        ignoreOtherMatches: true,
        get: (m, s, calend) => setMonth(5, calend),
      },
      {
        match: ' (july|jul)(?!(\\w+))',
        ignoreOtherMatches: true,
        get: (m, s, calend) => setMonth(6, calend),
      },
      {
        match: ' (august|aug)(?!(\\w+))',
        ignoreOtherMatches: true,
        get: (m, s, calend) => setMonth(7, calend),
      },
      {
        match: ' (september|sep)(?!(\\w+))',
        ignoreOtherMatches: true,
        get: (m, s, calend) => setMonth(8, calend),
      },
      {
        match: ' (october|oct)(?!(\\w+))',
        ignoreOtherMatches: true,
        get: (m, s, calend) => setMonth(9, calend),
      },
      {
        match: ' (november|nov)(?!(\\w+))',
        ignoreOtherMatches: true,
        get: (m, s, calend) => setMonth(10, calend),
      },
      {
        match: ' (december|dec)(?!(\\w+))',
        ignoreOtherMatches: true,
        get: (m, s, calend) => setMonth(11, calend),
      },
      {
        match: ' ([0-9][0-9][0-9][0-9])',
        ignoreOtherMatches: true,
        get: (m, str, calend) => {
          if (calend && calend.type === 'specific') {
            let time = mom(str, 'Y')
            
            if (time.isValid()) {
              time = mom(calend.specific, 'Y-M-D')
              time.year(parseInt(str, 10))
              matches.push(str)
              return spec(time.format('Y-M-D'))
            }
          }
        },
      },

      {
        match: ' (sunday|sun)(?!(\\w+))',
        get: () => getWeekSpecific('Sun'),
      },
      {
        match: ' (monday|mon)(?!(\\w+))',
        get: () => getWeekSpecific('Mon'),
      },
      {
        match: ' (tuesday|tue)(?!(\\w+))',
        get: () => getWeekSpecific('Tue'),
      },
      {
        match: ' (wednesday|wed)(?!(\\w+))',
        get: () => getWeekSpecific('Wed'),
      },
      {
        match: ' (thursday|thu)(?!(\\w+))',
        get: () => getWeekSpecific('Thu'),
      },
      {
        match: ' (friday|fri)(?!(\\w+))',
        get: () => getWeekSpecific('Fri'),
      },
      {
        match: ' (saturday|sat)(?!(\\w+))',
        get: () => getWeekSpecific('Sat'),
      },

      {
        match: ' (today|tod)(?!(\\w+))',
        get: () => spec(TOD_STR),
      },
      {
        match: ' (tomorrow|tom|(next day))(?!(\\w+))',
        get: () => spec(tod.clone().add(1, 'd').format('Y-M-D')),
      },
    ]

    const getSpecificInputFromStr = str => {
      for (const el of specificMatches) {
        const match = str.match(new RegExp(el.match, 'gi'))
        if (match) {
          const first = (match[0] && match[0].trim()) || ''
          const obj = el.get(match, first)
          if (obj)
            return obj
        }
      }
    }

    let periodic = false
    let matchedSpecific = false
    
    const keywords = [
      {
        match: /\severy (\d+) days/gi,
        unshift: true,
        get: (m, str) => {
          const daily = parseInt(str.split(' ')[1], 10)
          if (daily) {
            periodic = true
            cal = {
              type: 'daily',
              daily,

              editDate: TOD_STR,
              begins: TOD_STR,
            }
          }
        },
      },
      {
        match: /\severy day/gi,
        unshift: true,
        get: (m, str) => {
          periodic = true
          cal = {
            type: 'daily',
            daily: 1,

            editDate: TOD_STR,
            begins: TOD_STR,
          }
        },
      },
      {
        match: /\severy day after/gi,
        unshift: true,
        get: (m, str) => {
          periodic = true
          cal = {
            type: 'after completion',
            afterCompletion: 1,

            editDate: TOD_STR,
            begins: TOD_STR,
          }
        },
      },
      {
        match: / every (\d+) days after/gi,
        unshift: true,
        get: (m, str) => {
          const daily = parseInt(str.split(' ')[1], 10)
          if (daily) {
            periodic = true
            cal = {
              type: 'after completion',
              afterCompletion: daily,

              editDate: TOD_STR,
              begins: TOD_STR,
            }
          } else return false
        },
      },
      {
        match: /\severy( (\d+) weeks)?( on)? ((Sunday|Sun|Monday|Mon|Tuesday|Tue|Wednesday|Wed|Thursday|Thu|Friday|Fri|Saturday|Sat),?(\s)?)+/gi,
        unshift: true,
        get: (m, str) => {
          const split = str.split(' ').filter(el => el)

          const weeks = parseInt(split[1], 10)
          const isNumber = !isNaN(weeks)

          let begin = 4

          if (!str.includes(' on'))
            begin--
          if (!str.includes(' weeks'))
            begin--
          if (!isNumber)
            begin--

          split.splice(0, begin)

          const weekList = split.map(el => el.replace(',', '').slice(0, 2))

          if ((weeks || !isNumber) && weekList) {
            periodic = true
            cal = {
              type: 'weekly',
              weekly: {
                every: !isNumber ? 1 : weeks,
                days: weekList.map(w => parseInt(mom(w, 'ddd').format('e'), 10)),
              },
              
              editDate: TOD_STR,
              begins: TOD_STR,   
            }
          } else return false
        }
      },
      {
        match: /\severy (\d+) months( on)?( the)? (last|[1-7])(st|nd|rd|th)? (day|Sunday|Sun|Monday|Mon|Tuesday|Tue|Wednesday|Wed|Thursday|Thu|Friday|Fri|Saturday|Sat)/gi,
        unshift: true,
        get: (m, str) => {
          const split = str.split(' ').filter(el => el)
          
          const months = parseInt(split[1], 10)

          let weekDayPos = 3

          if (str.includes(' on'))
            weekDayPos++
          if (str.includes(' the'))
            weekDayPos++

          const monthDay = split[weekDayPos]
          const weekDay = split[weekDayPos + 1]

          const isPossibleWeekdayOverflow = (weekDay !== 'day' && (monthDay > 3))

          if (months && monthDay && weekDay && !isPossibleWeekdayOverflow) {
            periodic = true
            cal = {
              type: 'monthly',
              monthly: {
                every: months,
                place: monthDay,
                type: weekDay === 'day' ? 'day' : parseInt(mom(weekDay.slice(0, 2), 'ddd').format('e'), 10),
              },
              
              editDate: TOD_STR,
              begins: TOD_STR,   
            }
          } else return false
        },
      },
      {
        match: /\severy (\d+) years( on)? ((January|Jan|February|Feb|March|Mar|April|Apr|May|June|Jun|July|Jul|August|Aug|September|Sep|October|Oct|November|Nov|December|Dec),?(\s)?)+( on)?( the)? (last|[1-7])(st|nd|rd|th)? (day|Sunday|Sun|Monday|Mon|Tuesday|Tue|Wednesday|Wed|Thursday|Thu|Friday|Fri|Saturday|Sat)/gi,
        unshift: true,
        get: (m, str) => {
          const split = str.split(' ').filter(el => el)
          
          const years = parseInt(split[1], 10)

          split.splice(0, split[3] === 'on' ? 4 : 3)

          const months = []
          for (const m of split) {
            if (
              m === 'on' || m === 'the' || m === 'last' ||
              (parseInt(m, 10) > 0 && parseInt(m, 10) < 8)
              )
              break
            else months.push(m.replace(',', '').replace(' ', ''))
          }

          split.splice(0, months.length)

          let i = split.findIndex(el => el === 'on')
          if (i > -1)
            split.splice(i, 1)

          i = split.findIndex(el => el === 'the')
          if (i > -1)
            split.splice(i, 1)

          const monthDay = split[0]

          split.splice(0, 1)

          const weekDay = split[0]

          if (years && months && months.length > 0 && monthDay && weekDay) {
            periodic = true
            cal = {
              editDate: TOD_STR,
              begins: TOD_STR,

              type: 'yearly',
              yearly: {
                every: years,
                months: months.map(w => parseInt(mom(w, 'MMM').format('M'), 10)),
                place: monthDay,
                type: weekDay === 'day' ? 'day' : parseInt(mom(weekDay.slice(0, 2), 'ddd').format('e'), 10),
              }
            }
          } else return false
        },
      },
      {
        match: / (ends|defer)( on)? (.*)/gi,
        get: (m, str) => {
          if (periodic && cal) {
            const obj = getSpecificInputFromStr(str)
            if (obj && obj.specific) {
              cal.ends = {
                type: 'on date',
                onDate: obj.specific,
              }
            }
          } else return false
        },
      },
      {
        match: / (\d+) times/gi,
        get: (m, str) => {
          if (periodic && cal) {
            const days = parseInt(str.split(' ')[0], 10)
            if (days)
              cal.ends = {
                type: 'times',
                times: days,
              }
          } else return false
        },
      },
      {
        match: / (begins|due)( on)? (.*)/gi,
        get: (m, str) => {
          if (periodic && cal) {
            const obj = getSpecificInputFromStr(str)
            if (obj && obj.specific) {
              cal.begins = obj.specific
            }
          } else return false
        },
      },
      ...(specificMatches.map(el => ({
            match: new RegExp(el.match, 'gi'),
            get: (m, s) => {
              if (!periodic && (!matchedSpecific || el.ignoreOtherMatches)) {
                cal = el.get(m, s, cal)
                matchedSpecific = true
              }
            }
          }))
        ),
      {
        match: / (someday|som)(?!(\w+))/gi,
        get: () => cal = get({type: 'someday'})
      },
      {
        match: / (anytime|any)(?!(\w+))/gi,
        get: () => cal = get({type: 'anytime'})
      },
      {
        match: !disablePmFormat ? /\s(at )?(([2-9]|1[0-2]?)|(1[0-2]|0?[1-9]):([0-5][0-9]))(pm|am)/gi : /\s(at )?(2[0-3]|[01]?[0-9]):([0-5]?[0-9])/gi, // match 1am - 12am, 1pm - 12pm
        get: (match, str) => {
          const time = mom(str, format)
          if (time.isValid()) {
            const hour = time.format('HH:mm')
            matches.push(str)
            if (cal) {
              cal.time = hour
            } else {
              if (time.isSameOrBefore(tod, 'minute')) {
                cal = spec(tod.clone().add(1, 'd').format('Y-M-D'))
                cal.time = hour
              } else {
                cal = spec(TOD_STR)
                cal.time = hour
              }
            }
          } else return false
        },
      },
      {
        match: / (evening|eve)(?!(\w+))/gi,
        get: () => {
          if (cal) {
            cal.evening = true
            return cal 
          } else return false
        }
      },
      {
        match: / (no date)(?!(\w+))/gi,
        get: () => cal = null,
      },
      {
        match: / (inbox)(?!(\w+))/gi,
        get: () => cal = null,
      },
    ]
    
    for (const obj of keywords) {
      const match = str.match(obj.match)
      if (match) {
        const first = (match[0] && match[0].trim()) || ''

        if (obj.get(match, first) !== false) {
          if (!obj.unshift)
            matches.push(first)
          else
            matches.unshift(first)
        }
      }
    }

    return {calendar: cal, matches}
  },
  matchDuration(search, matches = []) {
    const getMatch = (regex, format) => {
      let match = search.match(regex)
      const getNum = str => parseInt(str, 10)
      
      if (match) {
        
        if (match[0])
          matches.push(match[0])
        match = getNum(match)
  
        if (!mom(match, format).isValid())
          return '00'
      } else return '00'
      return getNum(match)
    }

    
    const hourMatch = getMatch(/(\d)(\d)?( )?(hour|h)/gi, 'HH')
    const minMatch = getMatch(/(\d)(\d)?( )?(minute|min|m)/gi, 'mm')

    const time = mom(
      `${hourMatch}:${minMatch}`, 'HH:mm'
    )

    if (((hourMatch !== '00') || (minMatch !== '00')) && time.isValid())
      return time.format('HH:mm')
    return null
  },
  parseHTMLStr(str) {
    const escapeHTML = str => {
      let div = document.createElement("div")
      div.innerHTML = str
      return div.textContent || div.innerText || ""
    }
    
    return escapeHTML(str)
          .replace(/\[(https?:\/\/[^\]\s]+)(?: ([^\]]*))?\]/gi, "<a class='parsed-link' target='_blank' oncontextmenu='event.stopPropagation()' onclick='event.stopPropagation()' href='$1'>$2</a>")
          .replace(/__(.*?)__/gi, "<b>$1</b>")
          .replace(/\*(.*?)\*/gi, "<i>$1</i>")
          .replace(/\{(.*?)(?: ([^\}]*))?\}/gi, "<span style='color: $1'>$2</span>")
  },
  asyncComp(comp, allowComp = true) {
    return () => ({
      component: comp,
      loading: allowComp ? LoadingComponent : undefined,
      error: allowComp ? ErrorComponent : undefined,
      delay: 300,
      timeout: 75000,
    })
  },
  addIdsToObjectFromKeys(obj) {
    if (obj)
      for (const k in obj)
        if (obj.hasOwnProperty(k) && obj[k])
          obj[k] = {...obj[k], id: k}
    return obj
  },
  getUserProfileData(user) {
    return {
      displayName: user.displayName,
      email: user.email,
      uid: user.uid || user.userId,
      photoURL: user.photoURL,
    }
  },
  updateVuexObject(state, objName, source, filter) {
    const target = state[objName]
    const targetKeys = Object.keys(target)
    const sourceKeys = Object.keys(source)

    this.addIdsToObjectFromKeys(source)

    for (const k of sourceKeys)
      if (!target[k])
        return Vue.set(state, objName, {...source})
        
    for (const k of targetKeys)
      if (!source[k])
        return Vue.set(state, objName, {...source})

    sourceKeys.forEach(k => {
      if (target[k] && (!filter || filter(target[k])))
        this.findChangesBetweenObjs(target[k], source[k],
          (key, val) => Vue.set(target[k], key, val)
        )
    })
  },
  findChangesBetweenObjs(oldObj, newObj, onFoundChange, ignoreKeys) {
    if (oldObj && newObj) {
      const keys = Object.keys(newObj)
      for (const k of keys) {
        if (ignoreKeys && ignoreKeys.includes(k))
          continue
        const old = oldObj[k]
        const val = newObj[k]
        const type = typeof val
        let change = false

        switch (type) {
          case 'object': {
            change = JSON.stringify(val) !== JSON.stringify(old)
            break
          }
          default: {
            change = old !== val
          }
        }

        if (change) {
          if (onFoundChange)
            onFoundChange(k, val)
          else {
            if (type === 'object') {
              if (val && Array.isArray(val))
                Vue.set(oldObj, k, val)
              else if (val) {
                const old = {...oldObj}
                let final = Object.assign(old || {}, val)
                Object.keys(final).forEach(key => {
                  const bothObjects = typeof final[key] === 'object' && typeof val[key] === 'object'

                  if (bothObjects)
                    final[key] = Object.assign(final[key] || {}, old[key] || {}, val[key] || {})
                  else
                    final[key] = val[key]
                })
                Vue.set(oldObj, k, final)
              }
              else Vue.set(oldObj, k, null)
            } else {
              Vue.set(oldObj, k, val)
            }
          }
        }
      }
    }
  },
  getDataFromFirestoreSnapshot(state, changes, arrName) {
    changes.forEach(change => {
      const newDoc = {...change.doc.data(), id: change.doc.id}

      if (change.type === 'added') {
        const el = state[arrName].find(el => el.id === change.doc.id)
        if (!el)
          state[arrName].push(newDoc)
      } else if (change.type === 'removed') {
        const index = state[arrName].findIndex(el => el.id === change.doc.id)
        state[arrName].splice(index, 1)
      } else {
        const i = state[arrName].findIndex(el => el.id === change.doc.id)
        
        this.findChangesBetweenObjs(state[arrName][i], newDoc, (key, val) => Vue.set(state[arrName][i], key, val))
      }
    })
  },
  getUid() {
    return firebase.firestore().collection('tasks').doc().id
  },
  parseMomentToObject(m) {
    return {
      day: m.format('D'),
      month: m.format('MMM').toLowerCase(),
      year: m.format('Y'),
    }
  },
  transitionColor(oldNum, newNum, offset, max) {
    return (newNum * offset / max) + oldNum - (oldNum * offset / max)
  },
  getHumanReadableDate(str) {
    const tod = mom()
    const sameDay = (mom1, mom2) => {
      return mom1.isSame(mom2, 'day')
    }
    
    let date = mom(str, 'Y-M-D')
    if (sameDay(tod, date)) return 'Today'
    if (sameDay(mom().add(1, 'day'), date)) return 'Tomorrow'
    if (!tod.isSame(date, 'year')) return date.format('MMM Do, ddd, Y')
    if (!tod.isSame(date, 'month')) return date.format('MMM Do, ddd')

    if (date.diff(tod, 'days') <= 7) return date.format('ddd')
    return date.format('Do, ddd')
  },
  parseTime(time, userInfo) {
    if (userInfo.disablePmFormat)
      return time
    return mom(time, 'H:m').format('h:m A')
  },
  parseCalendarObjectToString(obj, userInfo, forceShowInfo = false, allowHours = true) {
    let str = ''

    const c = obj

    if (c.type === 'someday') return "Someday"
    if (c.type === 'anytime') return "Anytime"

    switch (c.type) {
      case 'specific': {
        const date = this.getHumanReadableDate(c.specific)
        if (forceShowInfo || date !== 'Today')
          str += date
        break
      }
      case 'after completion': {
        str += `${c.afterCompletion} days after`
        break
      }
      case 'daily': {
        str += `Every ${c.daily} days`
        break
      }
      case 'weekly': {
        if (c.weekly.every > 1)
          str += `Every ${c.weekly.every} weeks on `
        else str += 'Every '
        let i = 0
        for (const w of c.weekly.days) {
          str += mom(w, 'e').format('ddd')

          if ((i + 1) !== c.weekly.days.length)
            str += ', '
          i++
        }
        break
      }
      case 'monthly': {
        str += `Every ${c.monthly.every} months on the ${c.monthly.place} ${c.monthly.type === 'day' ? c.monthly.type : mom(c.monthly.type, 'e').format('ddd')}`
        break
      }
      case 'yearly': {
        str += `Every ${c.yearly.every} years on the ${c.yearly.place} ${c.yearly.type === 'day' ? c.yearly.type : mom(c.yearly.type, 'e').format('ddd')} of `
        let i = 0
        for (const w of c.yearly.months) {
          str += mom(w, 'M').format('MMM')

          if ((i + 1) !== c.yearly.months.length)
            str += ', '
          i++
        }
        break
      }
    }

    if (c.time && allowHours) str += ` at ${this.parseTime(c.time, userInfo)}`

    if (c.begins && c.begins !== c.editDate && (forceShowInfo || mom(c.begins, 'Y-M-D').isSameOrAfter(mom(), 'day'))) {
      str += `, begins on ${this.getHumanReadableDate(c.begins)}`
    }

    if (c.ends) {
      if (c.ends.type === 'on date') {
        str += `, ends on ${this.getHumanReadableDate(c.ends.onDate)}`
      } else {
        str += `, ends after ${c.ends.times} times`
      }
    }

    return str
  },
  download(filename, text) {
    let element = document.createElement('a')
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text))
    element.setAttribute('download', filename)
  
    element.style.display = 'none'
    document.body.appendChild(element)
  
    element.click()
  
    document.body.removeChild(element)
  },
  downloadBlobFromURL(url, getProgress) {
    return new Promise((solve, reject) => {
      const xhr = new XMLHttpRequest()
      if (getProgress)
        xhr.onprogress = getProgress
      xhr.responseType = 'blob'
      xhr.onload = () => solve(xhr.response)
      xhr.onerror = () => reject()
      xhr.open('GET', url)
      xhr.send()
    })
  },
  exportListTemplate({list, tasks}) {
    const ts = []
    for (const t of tasks) ts.push({...t,
      userId: undefined,
      completeDate: null,
      completed: false,
    })
    
    const template = {
      list: {...list, userId: null, options: undefined},
      tasks: ts,
    }

    this.download(list.name + '.json', JSON.stringify(template))
  },
  bindOptionsToEventListener(node, options, vm, event, onSelect = () => {}) {
    node.addEventListener(event ? event : 'contextmenu', evt => {
      evt.preventDefault()
      if (!contextMenuRunned) {
        const y = evt.pageY + 'px'
        const x = evt.pageX + 'px'
        const old = document.getElementById('contextmenu')
        const body = document.getElementById('app')
        if (old) body.removeChild(old)

        const Constructor = Vue.extend(IconDrop)
        const ins = new Constructor({
          parent: vm,
          propsData: {
            options, defaultShowing: true, id: 'contextmenu',
            root: true, hideHandle: true, onSelect,
          }
        })
        const vueEl = document.createElement('div')
        vueEl.setAttribute('id', 'click-contextmenu')
        body.appendChild(vueEl)
        ins.$mount('#click-contextmenu')

        const drop = document.getElementById('contextmenu')
        const s = drop.style
        s.position = 'absolute'
        s.left = x
        s.top = y
        
        setTimeout(() => contextMenuRunned = false)
      }
    })
  },
  getRelevantUserData(userAuth) {
    if (!userAuth.email)
      return {
        userId: userAuth,
        isAnonymous: true,
      }
    let obj = {
      userId: userAuth.uid,
      email: userAuth.email,
      photoURL: userAuth.photoURL,
      displayName: userAuth.displayName,
      isAnonymous: false,
    }
    return obj
  },
  formatQuantity(time) {
    const split = mom(time, 'HH:mm').format('H:m').split(':')

    const hours = split[0] + 'h'
    const minutes = split[1] + 'm'

    if (split[0] === '0' && split[1] === '0')
      return '0m'
    if (split[0] === '0')
      return minutes
    if (split[1] === '0')
      return hours
    return `${hours} ${minutes}`
  },
  isItemCompleted(item, moment) {
    const c = item.calendar
    if (!c || c.type === 'someday' || c.type === 'anytime' || c.type === 'specific') return item.completed
    
    let tod = mom(moment, 'Y-M-D')
    if (!tod.isValid()) tod = mom()
    if (c.type === 'after completion') {
      if (!c.lastCompleteDate) return false
      const last = mom(c.lastCompleteDate, 'Y-M-D')
      const dayDiff = tod.diff(last, 'days')
      return dayDiff < c.afterCompletion
    }
    if (c.type === 'daily') {
      const lastComplete = mom(c.lastCompleteDate, 'Y-M-D')
      const diff = tod.diff(lastComplete, 'days')
      return lastComplete.isSameOrAfter(tod, 'day') ||
              diff < c.daily
    }

    if (c.type === 'weekly' || c.type === 'monthly' || c.type === 'yearly' || c.type === 'yearly') {
      return mom(c.lastCompleteDate, 'Y-M-D').isSameOrAfter(tod, 'day')
    }
    
    return false
  },
  saveByShortcut(vm, isEditing, key, preventDefault, save, specificMessage = []) {
    const p = preventDefault
    const {isOnShift, isOnAlt} = vm

    if (!isEditing)
      switch (key) {
        case 'Delete': {
          save('delete')
          vm.$store.commit('clearSelected')
          break
        }
        case '.': {
          save('toggleCompletion')
          break
        }
        case ',': {
          save('toggleCancel')
          break
        }
      }
    
    if (isOnShift && !isEditing) {
      switch (key) {
        case 'S': {
          save('save', {
            calendar: {
              type: 'someday'
            }
          })
          break
        }
        case 'A': {
          save('save', {
            calendar: {
              type: 'anytime'
            }
          })
          break
        }
        case 'T': {
          const TOD_STR = mom().format('Y-M-D')
          save('save', {
            calendar: {
              type: 'specific',
              editDate: TOD_STR,
              begins: TOD_STR,
        
              specific: TOD_STR,
            }
          })
          break
        }
      }
    }

    if (isOnShift && isOnAlt)
      switch (key) {
        case 'L': {
          save('logbook')
          break
        }
      }

  },
}
