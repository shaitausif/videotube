// This is a service worker file
// A service worker is a type of JavaScript file that acts as a proxy between a web browser and a web server. It runs in the background, separate from the main web page, which allows it to intercept network requests, cache resources, and handle events even when the user isn't actively on your site. This is what enables key features for modern web applications like offline access and push notifications.



importScripts("https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js");
importScripts(
  "https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js"
);

// This is a setup of firebase service worker connection which will run on the browser in the background
// foreground delivery is usually sent directly to the webpage handler.
// Replace these with your own Firebase config keys...
const firebaseConfig = {
  apiKey: "AKO9JjhI4g4ZZUWSy5UDmWrCoxgJtmHrUb1oH0QgwQvz1cdLAkgGTpBlYY3EwE1R",
  authDomain: "videotube-d7b32.firebaseapp.com",
  projectId: "videotube-d7b32",
  storageBucket: "videotube-d7b32.firebasestorage.app",
  messagingSenderId: "247839964675",
  appId: "1:247839964675:web:b86795e99b0e29b8d25836",
  measurementId: "G-2WGTNVTJTM"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();
messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload.notification.title
  );

  // payload.fcmOptions?.link comes from our backend API route handler
  // payload.data.link comes from the Firebase Console where link is the 'key'
  const link = payload.fcmOptions?.link || payload.data?.link;
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    // icon: "./logo.png",
    data: { url: link },
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener("notificationclick", function (event) {
  console.log("[firebase-messaging-sw.js] Notification click received.");

  event.notification.close();

  // This checks if the client is already open and if it is, it focuses on the tab. If it is not open, it opens a new tab with the URL passed in the notification payload
  event.waitUntil(
    clients
      // https://developer.mozilla.org/en-US/docs/Web/API/Clients/matchAll
      .matchAll({ type: "window", includeUncontrolled: true })
      .then(function (clientList) {
        const url = event.notification.data.url;

        if (!url) return;

        // If relative URL is passed in firebase console or API route handler, it may open a new window as the client.url is the full URL i.e. https://example.com/ and the url is /about whereas if we passed in the full URL, it will focus on the existing tab i.e. https://example.com/about
        for (const client of clientList) {
          if (client.url === url && "focus" in client) {
            return client.focus();
          }
        }

        if (clients.openWindow) {
          console.log("OPENWINDOW ON CLIENT");
          return clients.openWindow(url);
        }
      })
  );
});
