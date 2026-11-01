// 1. Cargar las librerías de Firebase
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

// 2. Pegar la configuración que copiaste de Firebase
firebase.initializeApp({
  apiKey: "AIzaSyChlYEGHuaYmaTWxOHYSHsu51zFR9aJR0Q",
  authDomain: "apptarea-585ea.firebaseapp.com",
  projectId: "apptarea-585ea",
  storageBucket: "apptarea-585ea.firebasestorage.app",
  messagingSenderId: "813307226513",
  appId: "1:813307226513:web:907a996cb3226404191230"
});

// 3. Inicializar el servicio de mensajes
const messaging = firebase.messaging();

// 4. Escuchar notificaciones cuando la app esté CERRADA
messaging.onBackgroundMessage((payload) => {
  console.log('Notificación recibida en segundo plano: ', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/final/favicon.ico' // O la ruta de un icono de tu app
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

