
<script>

import inbox from '@/assets/icons/inbox.svg'
import calendar from '@/assets/icons/calendar.svg'
import sun from '@/assets/icons/sun.svg'
import star from '@/assets/icons/star.svg'
import user from '@/assets/icons/user.svg'
import userPlus from '@/assets/icons/user-plus.svg'
import out from '@/assets/icons/out.svg'
import arrow from '@/assets/icons/arrow.svg'
import settingsH from '@/assets/icons/settings-h.svg'
import settingsV from '@/assets/icons/settings-v.svg'
import sort from '@/assets/icons/sort.svg'
import tag from '@/assets/icons/tag.svg'
import sortName from '@/assets/icons/sort-name.svg'
import priority from '@/assets/icons/priority.svg'
import menu from '@/assets/icons/menu.svg'
import tasks from '@/assets/icons/tasks.svg'
import pen from '@/assets/icons/pen.svg'
import trash from '@/assets/icons/trash.svg'
import fire from '@/assets/icons/fire.svg'
import tinyCircle from '@/assets/icons/tiny-circle.svg'
import bloqued from '@/assets/icons/bloqued.svg'
import arrowTiny from '@/assets/icons/arrow-tiny.svg'
import circle from '@/assets/icons/circle.svg'
import copy from '@/assets/icons/copy.svg'
import plus from '@/assets/icons/plus.svg'
import circleCheck from '@/assets/icons/circle-check.svg'
import globe from '@/assets/icons/globe.svg'
import heading from '@/assets/icons/heading.svg'
import envelope from '@/assets/icons/envelope.svg'
import search from '@/assets/icons/search.svg'
import note from '@/assets/icons/note.svg'
import archive from '@/assets/icons/archive.svg'
import logbook from '@/assets/icons/logbook.svg'
import importIcon from '@/assets/icons/import.svg'
import exportIcon from '@/assets/icons/export.svg'
import users from '@/assets/icons/users.svg'
import close from '@/assets/icons/close.svg'
import heart from '@/assets/icons/heart.svg'
import sleep from '@/assets/icons/sleep.svg'
import deadline from '@/assets/icons/deadline.svg'
import repeat from '@/assets/icons/repeat.svg'
import box from '@/assets/icons/box.svg'
import boxDash from '@/assets/icons/box-dash.svg'
import file from '@/assets/icons/file.svg'
import folder from '@/assets/icons/folder.svg'
import filter from '@/assets/icons/filter.svg'
import magic from '@/assets/icons/magic.svg'
import clock from '@/assets/icons/clock.svg'
import pomo from '@/assets/icons/pomo.svg'
import message from '@/assets/icons/message.svg'
import pie from '@/assets/icons/pie.svg'
import check from '@/assets/icons/check.svg'
import comment from '@/assets/icons/comment.svg'
import layerGroup from '@/assets/icons/layer-group.svg'
import boxCheck from '@/assets/icons/box-check.svg'
import calendarStar from '@/assets/icons/calendar-star.svg'
import circleFilled from '@/assets/icons/circle-filled.svg'
import circleDash from '@/assets/icons/circle-dash.svg'
import circleCheckFilled from '@/assets/icons/circle-check-filled.svg'
import boxClose from '@/assets/icons/box-close.svg'
import boxCheckFilled from '@/assets/icons/box-check-filled.svg'
import circleCheckDash from '@/assets/icons/circle-check-dash.svg'
import circleClose from '@/assets/icons/circle-close.svg'
import loggedLists from '@/assets/icons/logged-lists.svg'
import fadedLoggedLists from '@/assets/icons/faded-logged-lists.svg'
import boxCheckDash from '@/assets/icons/box-check-dash.svg'
import paperPlane from '@/assets/icons/paper-plane.svg'
import laterLists from '@/assets/icons/later-lists.svg'
import group from '@/assets/icons/group.svg'
import moon from '@/assets/icons/moon.svg'
import crown from '@/assets/icons/crown.svg'
import play from '@/assets/icons/play.svg'

const icons = {
  inbox, calendar, sun, arrow, star, user, out,
  sort, tag, priority, menu, tasks, archive,
  pen, trash, fire, bloqued, circle, users,
  copy, plus, globe, heading, search, note,
  envelope, deadline, sleep, repeat, box, file,
  folder, heart, close, filter, magic, clock,
  pomo, pie, check, group, message, crown, play,
  comment, logbook, moon,
  "later-lists": laterLists,
  "logged-lists": loggedLists,
  "faded-logged-lists": fadedLoggedLists,
  "paper-plane": paperPlane,
  "box-close": boxClose,
  "circle-close": circleClose,
  "circle-check-filled": circleCheckFilled,
  "box-check-filled": boxCheckFilled,
  "box-dash": boxDash,
  "circle-dash": circleDash,
  "circle-check-dash": circleCheckDash,
  "layer-group": layerGroup,
  "circle-filled": circleFilled,
  "box-check-dash": boxCheckDash,
  "box-check": boxCheck,
  "calendar-star": calendarStar,
  "import": importIcon,
  "export": exportIcon,
  "user-plus": userPlus,
  "circle-check": circleCheck,
  "settings-h": settingsH,
  "sort-name": sortName,
  "settings-v": settingsV,
  "tiny-arrow": arrowTiny,
  "tiny-circle": tinyCircle,
}

export default {
  functional: true,
  render(createElement, {props}) {
    const icon = icons[props.icon]
    return createElement(
      'svg',
      {
        attrs: {
          viewBox: icon.viewBox,
        },
      },
      [
        createElement('use', {
          attrs: {
            'xlink:href': `#${icon.id}`,
          },
        })
      ],
    )
  },
  props: ['icon'],
}

</script>
