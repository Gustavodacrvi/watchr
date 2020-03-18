import Vue from "vue"
import Vuex from "vuex"
import router from './../router'

import Memoize from './memoFunctionGetters'
import utilsTask from '../utils/task'

import mom from 'moment'

const TOD = mom()

const TOD_STR = TOD.format('Y-M-D')
const TOM_STR = TOD.clone().add(1, 'd').format('Y-M-D')

Vue.use(Vuex)

const MINIMUM_DESKTOP_SCREEN_WIDTH = 820

import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'
import 'firebase/storage'

firebase.initializeApp({
  apiKey: process.env.VUE_APP_API_KEY,
  authDomain: process.env.VUE_APP_AUTH_DOMAIN,
  projectId: process.env.VUE_APP_PROJECT_ID,
  storageBucket: process.env.VUE_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.VUE_APP_MESSAGING_SENDER_ID,
  appId: process.env.VUE_APP_APP_ID,
  databaseURL: process.env.VUE_APP_DATABASE_URL,
  measurementId: process.env.VUE_APP_MEASUREMENT_ID,
})

let snapshotsListeners = []

export const fire = firebase.firestore()
export const auth = firebase.auth()
export const sto = firebase.storage()

fire.enablePersistence({ synchronizeTabs: true })

import task from './task'
import tag from './tag'
import list from './list'
import filter from './filter'
import folder from './folder'
import group from './group'
import invites from './invites'

import utils from '@/utils'
import { userRef, cacheRef, setInfo } from "../utils/firestore"

const uid = () => auth.currentUser.uid

const version = '097'

let lastVersion = localStorage.getItem('watchr_version')

if (lastVersion === null) {
  lastVersion = version
  localStorage.setItem('watchr_version', version)
}

const getDefaultInfo = () => ({
  lists: {dummy: null},
  folders: {dummy: null},
  stats: {dummy: null},
  tasks: {dummy: null},
  tags: {dummy: null},
  info: {
    dummy: null,
    info: {
      ungroupTasksInHeadings: true,
      margins: ['DEFAULT_1', 'DEFAULT_2'],
      hidedViews: [
        'Tomorrow',
        'Later lists',
        'Recurring',
        'Logged lists',
      ],
    }
  },
})

const isDesktopDevice = window.screen.width >= MINIMUM_DESKTOP_SCREEN_WIDTH


let allowCalendar = true
let scheduling = localStorage.getItem('sidebarScheduling') === 'true'

const cal = localStorage.getItem('allowCalendar')

if (cal)
  allowCalendar = cal === 'true'

const store = new Vuex.Store({
  modules: {
    task, tag, list, filter, folder,
    group, invites,
  },
  state: {
    lastVersion,
    allowCalendar,
    version,
    popup: {
      comp: '',
      naked: false,
      payload: null,
      callback: null,
    },
    iconDrop: null,
    user: {
      uid: null,
      displayName: null,
      email: null,
      photoURL: null,
      providerData: null,
    },
    userInfo: {
      tags: [],
      margins: [],
      lists: [],
      favorites: [],
      filters: [],
      folders: [],
      hidedSections: [],
      hidedViews: [],
      links: [],
      
      calendarOrders: null,
      getGmailInbox: false,
      markEmailsAsRead: false,
      allowOverdue: false,
      
      disablePmFormat: false,
      
      lists: [],
      tags: [],
      viewOrders: {},
      hidedSections: null,
      links: [],
    },
    firstFireLoad: false,
    cameFromAnotherTabHTMLElement: null,
    selectedItems: [],
    fireBaseFirstLoaded: false,
    authState: false,
    fileURL: null,
    firstFireLoad: false,
    scheduling: scheduling && isDesktopDevice,
    isDraggingOverSidebarElement: false,
    toasts: [],
    toggleTaskCompletion: [],
    toggleListCompletion: [],
    windowWidth: 0,
    isScrolling: false,
    allowNavHide: true,
    viewName: '',
    viewType: '',
    mainSelection: null,
    movingTask: false,
    selectedType: null,
    
    isOnControl: false,
    isEditing: false,
    isOnShift: false,
    isOnAlt: false,
    moving: false,
    pressingKey: null,
    movingTimeout: null,
    historyPos: 0,

    googleCalendarReady: false,
    gmailReady: false,
    calendarList: [],
    calendarColorIds: {},

    isFirstSnapshot: true,

    clipboardTask: null,
    toggleClipboardPaste: false,
  },
  getters: {
    calendarDate(state) {
      const n = state.viewName

      switch (n) {
        case "Today": return TOD_STR
        case "Tomorrow": return TOM_STR
      }
      
      if (state.viewType === 'calendar')
        return state.viewName
    },
    checkMissingIdsAndSortArr: () => (order, arr, property = 'id') => {

      let items = []
      for (const id of order) {
        const item = arr.find(el => el[property] === id)
        if (item) items.push(item)
      }
  
      let notIncluded = []
      for (const item of arr) {
        if (!order.includes(item[property]))
          notIncluded.push(item)
      }
  
      let haveCreationDate = true
      for (const item of notIncluded) {
        if (!item.created) {
          haveCreationDate = false
          break
        }
      }
      if (haveCreationDate)
        notIncluded = utilsTask.sortTasksByTaskDate(notIncluded)
      items = [...items, ...notIncluded]
    
      const ids = new Set()
      const ordered = []
      for (const item of items) {
        if (!ids.has(item[property])) {
          ids.add(item[property])
          ordered.push(item)
        }
      }
      
      return ordered
    },
    itemHeight(s, getters) {
      return getters.isDesktopDevice ? 28 : 50
    },
    isSmartList(state, getters) {
      return getters.sidebarElements.find(el => el.name === state.viewName)
    },
    sidebarElements() {
      return [
        {
          name: 'Inbox',
          disableAction: true,
          icon: 'inbox',
          descr: `
            The Inbox is where all of your stuff goes to, it's where you put all of your collected things. Whenever you have an idea or something you've got to do, remove it from your mind and add it to the Inbox.<br><br> You can then every night or every three days empty the Inbox, that is, decide what is important and what isn't, decide which/folder list it should go to, possibly add tags and decide when the task should be completed.
          `,
          iconColor: 'var(--primary)'
        },
        {
          name: 'Today',
          icon: 'star',
          descr: `
            Gives you an overview of everything that needs to be done today, just like any other calendar smart view, Today has an Evening heading for the tasks that should be completed at night or later.<br><br>
            If you have a task or list whose deadline ends today, it'll be shown on the Today smart view.
          `,
          iconColor: 'var(--yellow)'
        },
        {
          name: 'Assigned to me',
          icon: 'group',
          descr: `
            Shows all of your assigned tasks and lists in headings.
          `,
          iconColor: 'var(--orange)'
        },
        {
          name: 'Tomorrow',
          id: 'tom',
          descr: `
            It's just like Today, but for tomorrow ;/.
          `,
          icon: 'sun',
          iconColor: 'var(--orange)'
        },
        {
          name: 'Upcoming',
          disableAction: true,
          descr: `
          Shows your upcoming tasks, first, your next 7 days, then this month and all of the upcoming months, where each one is a heading.<br><br>
            You can drag and drop items to change their dates, it's useful for planning the week, especially with multiple windows opened.

          `,
          icon: 'calendar',
          iconColor: 'var(--green)'
        },
        {
          name: "Recurring",
          disableAction: true,
          descr: `
            All of your recurring tasks will be shown here, the recurring lists will be inside its heading.
          `,
          icon: 'repeat',
          iconColor: 'var(--txt)',
        },
        {
          name: 'Anytime',
          disableAction: true,
          descr: `
            Tasks and lists that can be completed anytime, but you're not sure when.
          `,
          icon: 'layer-group',
          iconColor: 'var(--olive)',
        },
        {
          name: 'Someday',
          icon: 'archive',
          descr: `
            Tasks and lists that you can't do yet, or when you're unsure about its necessity, or for things that you simply don't want to do yet.
          `,
          iconColor: 'var(--brown)'
        },
        {
          name: 'Deadlines',
          disableAction: true,
          descr: `
            It's just like Upcoming, but it works with deadlines, instead of grouping your stuff based on its specific completion date, it uses the deadlines.<br><br>
            When dragging and dropping stuff around, instead of changing its date, it changes the deadline.
          `,
          icon: 'deadline',
          iconColor: 'var(--red)'
        },
        {
          name: 'Logbook',
          descr: `
            When completing a task, you can log it, logged tasks aren't shown inside lists or folders, the Logbook groups the tasks using its log date.
          `,
          icon: 'logbook',
          iconColor: 'var(--dark-blue)'
        },
        {
          name: 'Later lists',
          icon: 'later-lists',
          descr: `
            When you defer a list for the next week, or when a list has the someday label, it won't be shown on the sidebar, because there is no sense in showing a list you don't/can't complete yet, you can see all of these hided lists on the Later lists smart view.
          `,
          iconColor: 'var(--txt)'
        },
        {
          name: 'Logged lists',
          descr: `
            Just like logbook, but for lists.
          `,
          icon: 'logged-lists',
          iconColor: 'var(--dark-blue)'
        },
      ]
    },
    getIcon(state, getters) {
      const n = state.viewName
      
      if (state.viewType === 'calendar') {
        if (n === TOD_STR) return 'star'
        else if (n === TOM_STR) return 'sun'
        return 'calendar-star'
      }

      if (state.viewType !== 'list' && !getters.isSmartList)
        return state.viewType

      if (!getters.isSmartList)
        return 'tasks'
      
      return getters.sidebarElements.find(el => el.name === n).icon
    },
    getIconColor(state, getters) {
      const t = state.viewType
      const n = state.viewName

      if (t === 'calendar') {
        if (n === TOD_STR) return 'var(--yellow)'
        else if (n === TOM_STR) return 'var(--orange)'
        return 'var(--purple)'
      }
      
      if (t === 'folder' || t === 'group' || t === 'search') return ''
      if (t === 'tag')
        return 'var(--red)'
      if (!getters.isSmartList) 
          return 'var(--primary)'
      
      return getters.sidebarElements.find(el => el.name === n).iconColor
    },
    fallbackSelected(state) {
      if (state.selectedItems.length > 0)
        return state.selectedItems
      else return state.mainSelection ? [state.mainSelection] : null
    },
    isDesktopBreakPoint(state) {
      return state.windowWidth >= MINIMUM_DESKTOP_SCREEN_WIDTH
    },
    isDesktopDevice() {
      return isDesktopDevice
    },
    layout(s, getters) {
      return getters.isDesktopBreakPoint ? 'desktop' : 'mobile'
    },
    deviceLayout(s, getters) {
      return getters.isDesktopDevice ? 'desktop' : 'mobile'
    },
    getInitialSmartView() {
      const goToLastViewOnEnter = localStorage.getItem('goToLastViewOnEnter')

      if (goToLastViewOnEnter !== 'true') {
        return { viewName: 'Today', viewType: 'list'}
      } else {
        const viewName = localStorage.getItem('watchr_last_view_name')
        const viewType = localStorage.getItem('watchr_last_view_type')
        return {viewType, viewName}
      }
    },
    versionDiff(state) {
      const vers = state.lastVersion
      return parseInt(state.version, 10) - parseInt(vers, 10)
    },
    needsUpdate(state) {
      const vers = state.lastVersion
      return vers !== null && (parseInt(state.version, 10) - parseInt(vers, 10) > 0)
    },
    isStandAlone() {
      const navigator = window.navigator
      return (navigator.standalone === true)
      || (window.matchMedia('(display-mode: standalone)').matches)
    },
    parsedVersion(state) {
      let newStr = ''
      let i = 0
      for (const s of state.version) {
        if (i > 0)
          newStr += '.' + s
        else newStr += s
        i++
      }
      return 'v' + newStr
    },
    isPopupOpened(state) {
      return state.popup.comp !== ''
    },
    recentUsersStr(state) {
      if (!state.userInfo.recentUsers) return []
      return Object.values(state.userInfo.recentUsers).map(user => {
        let str = ''
        if (user.displayName) str += user.displayName + ' '
        str += user.email
        return str
      })
    },
  },
  mutations: {
    toggleScheduling(state) {
      state.scheduling = !state.scheduling
      localStorage.setItem('sidebarScheduling', state.scheduling)
    },
    toggleSidebarElementHover(state, bool) {
      state.isDraggingOverSidebarElement = bool
    },
    saveCalendarColorIds(state, ids) {
      state.calendarColorIds = ids
    },
    toggleTaskCompletion(state, toggleTaskCompletion) {
      state.toggleTaskCompletion = (toggleTaskCompletion || []).slice()
    },
    toggleListCompletion(state, toggleListCompletion) {
      state.toggleListCompletion = (toggleListCompletion || []).slice()
    },
    toggleCalendar(state, allowCalendar) {
      state.allowCalendar = allowCalendar
      localStorage.setItem('allowCalendar', allowCalendar)
    },
    cameFromAnotherTabDragStart(state, element) {
      if (element === null && state.cameFromAnotherTabHTMLElement === null)
        return;
      state.cameFromAnotherTabHTMLElement = element
    },
    moving(state, moving) {
      
      if (!moving)
        state.movingTimeout = setTimeout(() => {
          state.moving = false
        }, 200)
      else {
        if (state.movingTimeout)
          clearTimeout(state.movingTimeout)
        state.moving = true
      }
    },
    isEditing(state, toggle) {
      state.isEditing = toggle
    },
    pasteTask(state) {
      state.toggleClipboardPaste = !state.toggleClipboardPaste
    },
    addTaskToClipboard(state, clipboardTask) {
      state.clipboardTask = clipboardTask
    },
    saveCalendarList(state, list) {
      state.calendarList = list
    },
    googleCalendarReady(state) {
      state.googleCalendarReady = true
    },
    gmailReady(state) {
      state.gmailReady = true
    },
    movingTask(state, bool) {
      state.movingTask = bool
    },
    saveMainSelection(state, id) {
      state.mainSelection = id
    },
    unpressKey(state) {
      state.pressingKey = null
    },
    decreaseHistory(state) {
      state.historyPos--
    },
    increaseHistory(state) {
      state.historyPos++
    },
    navigate(state, {viewName, viewType, newRoute}) {
      if (!newRoute)
        state.historyPos++
      if (viewName && viewType) {
        localStorage.setItem('watchr_last_view_name', viewName)
        localStorage.setItem('watchr_last_view_type', viewType)
      }
      
      state.viewName = viewName
      state.viewType = viewType
    },
    updateVersion(state, vers) {
      state.lastVersion = vers
      localStorage.setItem('watchr_version', vers)
    },
    readFile(state, fileURL) {
      state.fileURL = fileURL
    },
    toggleAllowNavHide(state, allow) {
      state.allowNavHide = allow
    },
    toggleScroll(state, isScrolling) {
      state.isScrolling = isScrolling
    },
    saveUser(state, user) {
      state.user = user
    },
    firstFirebaseLoad(state) {
      state.firstFireLoad = true
    },
    pushIconDrop(state, drop) {
      state.iconDrop = drop
    },
    unselectItem(state, id) {
      if (id && state.selectedItems.includes(id)) {
        const i = state.selectedItems.findIndex(el => el === id)
        state.selectedItems.splice(i, 1)
      }
    },
    selectType(state, type) {
      state.selectedType = type
    },
    selectItem(state, id) {
      if (id && !state.selectedItems.includes(id)) {
        state.selectedItems.push(id)
      }
    },
    clearSelected(state) {
      if (state.selectedItems.length !== 0)
        state.selectedItems = []
    },
    toggleUser(state, isLogged) {
      state.authState = isLogged
    },
    saveWindowWidth(state) {
      state.windowWidth = document.body.clientWidth
    },
    moveToastQueue(state) {
      state.toasts.pop()
    },
    pushToast(state, toast) {
      state.toasts.unshift(toast)
    },
    toggleControl(state, clicked) {
      state.isOnControl = clicked
    },
    toggleShift(state, clicked) {
      state.isOnShift = clicked
    },
    toggleAlt(state, clicked) {
      state.isOnAlt = clicked
    },
  },
  actions: {
    getOptions(context, options) {
      const {state, getters} = context
      return options({
        router,
        ...context,
        tags: getters['tag/tags'],
        tasks: getters['task/tasks'],
        lists: getters['list/lists'],
        folders: getters['folder/folders'],
        groups: state.group.groups,
      })
    },
    logOut({state}) {
      const authInstance = gapi.auth2.getAuthInstance()
      authInstance.signOut()
      
      auth.signOut().then(() => {
        state.authState = false
      })
    },
    pushKeyShortcut({dispatch, commit, state}, key) {
      const pop = (comp) => {
        dispatch('pushPopup', {comp, naked: true})
      }
      state.pressingKey = key
      if (!state.isOnControl && !state.isOnShift && !state.isOnAlt)
        switch (key.toLowerCase()) {
          case 'q': pop('AddTask'); break
          case 't': pop('AddTag'); break
          case 'l': pop('AddList'); break
          case 's': pop('Shortcuts'); break
          case 'f': pop('FastSearch'); break
        }
    },
    pushPopup({state, getters}, popup) {
      state.popup = popup
      if (!getters.isDesktopBreakPoint)
        router.push('/popup')
    },
    closePopup({state, getters}, persistOnTheSameView) {
      state.popup = {comp: '', payload: null, naked: false}
      if (!getters.isDesktopBreakPoint && !persistOnTheSameView)
        router.go(-1)
    },
    updateProfilePic(c, photoURL) {
      return Promise.all([
        auth.currentUser.updateProfile({
          photoURL,
        }),
        userRef().set({
          photoURL,
        }, {merge: true})
      ])
    },
    deleteProfilePic() {
      const str = `images/${auth.currentUser.uid}.jpg`
      return sto.ref(str).delete().then(() => {
        auth.currentUser.updateProfile({
          photoURL: '',
        })
        userRef().set({
          photoURL: null,
        }, {merge: true})
      })
    },
    setInfo({rootState}, obj) {
      const b = fire.batch()

      setInfo(b, obj, rootState)

      b.commit()
    },
    getData({state, dispatch}, userId) {
      snapshotsListeners.push(cacheRef().onSnapshot(snap => {
        const data = snap.data()
        const isFromHere = snap.metadata.hasPendingWrites

        if (!state.isFirstSnapshot && !isFromHere) {
          utils.updateVuexObject(state.task, 'tasks', data.tasks || {})
          utils.updateVuexObject(state.tag, 'tags', data.tags || {})
          utils.updateVuexObject(state.folder, 'folders', data.folders || {})
          utils.updateVuexObject(state.list, 'lists', data.lists || {})
        } else if (!isFromHere) {
          if (data.info && data.info.info)
            utils.findChangesBetweenObjs(state.userInfo, data.info.info, (key, val) => Vue.set(state.userInfo, key, val))
          
          utils.addIdsToObjectFromKeys(data.tasks)
          utils.addIdsToObjectFromKeys(data.tags)
          utils.addIdsToObjectFromKeys(data.folders)
          utils.addIdsToObjectFromKeys(data.stats)
          utils.addIdsToObjectFromKeys(data.lists)
          
          if (data.tasks)
            state.task.tasks = data.tasks || {}
          if (data.tags)
            state.tag.tags = data.tags || {}
          if (data.folders)
            state.folder.folders = data.folders || {}
          if (data.lists)
            state.list.lists = data.lists || {}

          state.isFirstSnapshot = false
        }

      }))
      if (userId)
        snapshotsListeners.push(fire.collectionGroup('groupCache')
          .where(`users.${userId}`, '==', true)
          .onSnapshot(snap => {
            const isFromHere = snap.metadata.hasPendingWrites
            
            if (!isFromHere) {
              const changes = snap.docChanges()
              
              changes.forEach(change => {
                const newGroup = change.doc.data()
                
                if (change.type === 'added') {
                  const el = state.group.groups.find(el => el.id === newGroup.id)
                  if (!el) {
                    state.group.groups.push(newGroup)
                    state.task.groupTasks = utils.addIdsToObjectFromKeys({
                      ...state.task.groupTasks,
                      ...newGroup.tasks,
                    })
                    state.list.groupLists = utils.addIdsToObjectFromKeys({
                      ...state.list.groupLists,
                      ...newGroup.lists,
                    })
                  }
                } else if (change.type === 'removed') {
                  const index = state.group.groups.findIndex(el => el.id === newGroup.id)
                  if (index > -1) {
                    state.group.groups.splice(index, 1)
                  }

                  let keys = Object.keys(state.task.groupTasks)
                  for (const k of keys)
                    if (state.task.groupTasks[k] && state.task.groupTasks[k].group === newGroup.id)
                      state.task.groupTasks[k] = undefined
                  state.task.groupTasks = utils.addIdsToObjectFromKeys({...state.task.groupTasks})
                  keys = Object.keys(state.list.groupLists)
                  for (const k of keys)
                    if (state.list.groupLists[k] && state.list.groupLists[k].group === newGroup.id)
                      state.list.groupLists[k] = undefined
                  state.list.groupLists = utils.addIdsToObjectFromKeys({...state.list.groupLists})
                } else {
                  const i = state.group.groups.findIndex(el => el.id === newGroup.id)
          
                  utils.findChangesBetweenObjs(state.group.groups[i], newGroup, undefined, ['tasks', 'lists'])

                  utils.updateVuexObject(state.task, 'groupTasks', newGroup.tasks || {}, task => task.group === newGroup.id)
                  utils.updateVuexObject(state.list, 'groupLists', newGroup.lists || {}, list => list.group === newGroup.id)
                }
              })
            }
          }))
      
      if (userId)
        snapshotsListeners.push(fire.collectionGroup('invites')
          .where('to', '==', userId)
          .where('denied', '==', null)
          .onSnapshot(snap => {
            utils.getDataFromFirestoreSnapshot(state.invites, snap.docChanges(), 'toMe')
          }))

      if (userId)
        snapshotsListeners.push(fire.collectionGroup('invites')
          .where('userId', '==', userId)
          .onSnapshot(snap => {
            utils.getDataFromFirestoreSnapshot(state.invites, snap.docChanges(), 'fromMe')
          }))
    },
    update({}, info) {
      const b = fire.batch()
      
      const userRef = fire.collection('users').doc(info.uid)
      b.set(userRef, {
        ...utils.getRelevantUserData(info),
      }, {merge: true})
      return b.commit()
    },
    createUser(s, user) {
      const b = fire.batch()

      const ref = fire.collection('users').doc(user.uid)
      b.set(ref, {
        ...utils.getRelevantUserData(user),
      }, {merge: true})
      b.set(ref.collection('cache').doc('cache'), {
        userId: user.uid,
        id: 'cache',
        ...getDefaultInfo()
      }, {merge: true})
      
      return b.commit()
    },
    async anonymousSignIn({dispatch, commit}) {
      try {
        await auth.signInAnonymously()
        await dispatch('createAnonymousUser', auth.currentUser.uid)
        
        dispatch('closePopup')
        router.push('/user')
        
        commit('pushToast', {
          name: 'You have successfully signed in as a guest.',
          seconds: 3,
          type: 'success',
        })
      } catch (err) {
        auth.currentUser.delete()
        
        commit('pushToast', {
          name: err.message,
          seconds: 3,
          type: 'error',
        })
      }
    },
    createAnonymousUser(c, userId) {
      const b = fire.batch()
      
      const ref = fire.collection('users').doc(userId)
      b.set(ref, {
        ...utils.getRelevantUserData(userId),
      }, {merge: true})
      b.set(ref.collection('cache').doc('cache'), {
        id: 'cache',
        userId,
        ...getDefaultInfo()
      })

      return b.commit()
    },
  }
})

store.commit('saveUser', null)

auth.onAuthStateChanged((user) => {
  const isLogged = user !== null
  if (!isLogged) {
    snapshotsListeners.forEach(u => u())
    snapshotsListeners = []
  }

  store.commit('toggleUser', isLogged)
  store.commit('saveUser', user)
  store.commit('firstFirebaseLoad')
  if (!isLogged) return;

  const dispatch = store.dispatch
  const loadData = () => {
    dispatch('getData', user.uid)
  }
  const toast = (t) => store.commit('pushToast', t)

  if (!user.isAnonymous) {
    if (isLogged) loadData()
  } else {
    setTimeout(() => {
      toast({
        name: 'Anonymous users are deleted every week, sign in to save your data indefinitely.',
        seconds: 7,
        type: 'warning',
      })
    }, 3000)
    loadData()
  }
})

auth.getRedirectResult().then(res => {
  const user = res.user
  const toast = (t) => store.commit('pushToast', t)
  if (user) {
    toast({
      name: 'You have successfully logged in!',
      seconds: 3,
      type: 'success',
    })
    setTimeout(() => {
      router.push('/user')
      fire.collection('users').doc(user.uid).set({
        ...utils.getRelevantUserData(user),
      }).catch(err => {
        firebase.auth().currentUser.delete()
        toast({
          name: err.message,
          seconds: 3,
          type: 'error',
      })})
    }, 80)
  }
}).catch(err => store.commit('pushToast', {
  name: err.message,
  seconds: 4,
  type: 'error',
}))


if (typeof gapi !== "undefined")
  gapi.load('client', () => {

    
    gapi.client.init({
      apiKey: process.env.VUE_APP_API_KEY,
      clientId: process.env.VUE_APP_CLIENT_ID,
      discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest", 'https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest'],
      scope: "https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/gmail.readonly",
    })

    gapi.client.load('calendar', 'v3', () => {
      setTimeout(() => {
        store.commit('googleCalendarReady')
      }, 1500)
    })
    gapi.client.load('gmail', 'v3', () => {
      setTimeout(() => {
        store.commit('gmailReady')
      }, 1500)
    })
  })

window.addEventListener('resize', () => store.commit('saveWindowWidth'))

store.commit('saveWindowWidth')

export default store
