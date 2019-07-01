/* tslint:disable:no-console */

import { register } from 'register-service-worker'
import store from './store/index'

const notifyUserAboutUpdate = (worker: ServiceWorker | null) => {
  if (worker !== null)
    store.commit('pushAlert', {
      name: 'New content is available please refresh.',
      duration: null,
      type: 'normal',
      btn: 'Refresh',
      callback: () => {
        worker.postMessage({ action: 'skipWaiting' })
      },
    })
}

if (process.env.NODE_ENV === 'production') {
  register(`${process.env.BASE_URL}service-worker.js`, {
    ready() {
      console.log(
        'App is being served from cache by a service worker.\n' +
        'For more details, visit https://goo.gl/AFskqB',
      )
    },
    registered(reg: ServiceWorkerRegistration) {
      console.log('Service worker has been registered.', reg)
    },
    cached() {
      console.log('Content has been cached for offline use.')
    },
    updatefound() {
      console.log('New content is downloading.')
    },
    updated(reg: ServiceWorkerRegistration) {
      console.log('New content is available please refresh.')
      notifyUserAboutUpdate(reg.waiting)
    },
    offline() {
      console.log('No internet connection found. App is running in offline mode.')
    },
    error(error) {
      console.error('Error during service worker registration:', error)
    },
  })
  let refreshing: boolean = false
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!refreshing) {
      window.location.reload()
      refreshing = true
    }
  })
}
