importScripts('https://www.gstatic.com/firebasejs/6.3.4/firebase-app.js')
importScripts('https://www.gstatic.com/firebasejs/6.3.4/firebase-messaging.js')

let config = {

}

firebase.initializeApp(config)

const messaging = firebase.messaging()
