importScripts('https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/9.6.10/firebase-messaging.js');

firebase.initializeApp({
  apiKey: "SENIN_API_KEY",
  authDomain: "proje-ismi.firebaseapp.com",
  projectId: "proje-ismi",
  messagingSenderId: "SENIN_SENDER_ID",
  appId: "SENIN_APP_ID"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Arka planda mesaj alındı: ', payload);
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
  });
});
