try {
    // importScripts('https://storage.googleapis.com/workbox-cdn/releases/3.3.1/workbox-sw.js');
    // workbox.setConfig({
    //     debug: false
    // });
    // workbox.core.setCacheNameDetails({
    //     prefix: 'app-cache'
    // });
    // workbox.routing.registerRoute(new RegExp('.*\.js$'), workbox.strategies.cacheFirst({
    //     cacheName: 'asset-cache',
    //     plugins: [new workbox.expiration.Plugin({
    //         maxAgeSeconds: 24 * 60 * 60 * 7,
    //         purgeOnQuotaError: true
    //     })]
    // }));
    // workbox.routing.registerRoute(new RegExp('.*$'), workbox.strategies.cacheFirst({
    //     cacheName: 'html-cache',
    //     plugins: [new workbox.expiration.Plugin({
    //         maxAgeSeconds: 24 * 60 * 60 * 7,
    //         purgeOnQuotaError: true
    //     })]
    // }));
    // workbox.routing.registerRoute(new RegExp('.*\/$'), workbox.strategies.cacheFirst({
    //     cacheName: 'html-cache',
    //     plugins: [new workbox.expiration.Plugin({
    //         maxAgeSeconds: 24 * 60 * 60 * 7,
    //         purgeOnQuotaError: true
    //     })]
    // }));
    // workbox.routing.registerRoute(new RegExp('.*\.ttf$'), workbox.strategies.cacheFirst({
    //     cacheName: 'font-cache',
    //     plugins: [new workbox.expiration.Plugin({
    //         maxAgeSeconds: 24 * 60 * 60 * 31,
    //         purgeOnQuotaError: true
    //     })]
    // }));
    // workbox.routing.registerRoute(new RegExp('images\/.*\.webp$'), workbox.strategies.cacheFirst({
    //     cacheName: 'other-cache',
    //     plugins: [new workbox.expiration.Plugin({
    //         maxAgeSeconds: 24 * 60 * 60 * 7,
    //         purgeOnQuotaError: true
    //     })]
    // }));
    // workbox.routing.registerRoute(new RegExp('images\/.*\.png$'), workbox.strategies.cacheFirst({
    //     cacheName: 'other-cache',
    //     plugins: [new workbox.expiration.Plugin({
    //         maxAgeSeconds: 24 * 60 * 60 * 7,
    //         purgeOnQuotaError: true
    //     })]
    // }));
    // workbox.routing.registerRoute(new RegExp('images\/.*\.gif$'), workbox.strategies.cacheFirst({
    //     cacheName: 'other-cache',
    //     plugins: [new workbox.expiration.Plugin({
    //         maxAgeSeconds: 24 * 60 * 60 * 7,
    //         purgeOnQuotaError: true
    //     })]
    // }));
    // workbox.routing.registerRoute(new RegExp('images\/.*\.jpg$'), workbox.strategies.cacheFirst({
    //     cacheName: 'other-cache',
    //     plugins: [new workbox.expiration.Plugin({
    //         maxAgeSeconds: 24 * 60 * 60 * 7,
    //         purgeOnQuotaError: true
    //     })]
    // }));
    // workbox.routing.registerRoute(new RegExp('images\/.*\.svg$'), workbox.strategies.cacheFirst({
    //     cacheName: 'other-cache',
    //     plugins: [new workbox.expiration.Plugin({
    //         maxAgeSeconds: 24 * 60 * 60 * 7,
    //         purgeOnQuotaError: true
    //     })]
    // }));
    // workbox.routing.registerRoute(new RegExp('.*\.wav$'), workbox.strategies.cacheFirst({
    //     cacheName: 'voice-cache',
    //     plugins: [new workbox.expiration.Plugin({
    //         maxAgeSeconds: 24 * 60 * 60 * 31,
    //         purgeOnQuotaError: true
    //     })]
    // }));
    // workbox.precaching.precacheAndRoute([]);
    // workbox.skipWaiting();
    // workbox.clientsClaim();
} catch (error) {}

self.addEventListener("install", (e) => {
    self.skipWaiting();
});

// const api = "http://192.168.100.67:2020";
const api = "https://api.kluster-ai.online";

self.addEventListener("message", function (event) {
    let data = event.data;

    console.log(event);

    if (data.type == "newMessage") {
    }
});

const req = async (url, obj, token) => {
    obj = obj || {};
    obj.headers = {};
    obj.headers["Authorization"] = "Bearer " + token;
    obj.headers["Content-Type"] = "application/json";
    if (obj) {
        return await fetch(url, obj);
    } else {
        return await fetch(url);
    }
};

addEventListener("notificationclick", async (event) => {
    let data = event.notification.data;

    if (data) {
        let url = data.url + "/chat/" + data.id;

        if (event.reply) {
            const response = await req(
                api + "/api/message/send/" + data.id,
                {
                    method: "POST",
                    body: JSON.stringify({
                        message: event.reply,
                    }),
                },
                data.token
            );
            const result = await response.json();

            // if (result.success) {
            event.notification.close();
            // }
            return;
        }

        event.waitUntil(
            clients
                .matchAll({
                    type: "window",
                })
                .then((clients) => {
                    // clients is an array with all the clients
                    if (clients.length > 0) {
                        // if you have multiple clients, decide
                        // choose one of the clients here
                        const someClient = clients[0];
                        if (someClient.url !== url) {
                            event.notification.close();
                            return someClient
                                .navigate(url)
                                .then((client) => client.focus());
                        }
                        someClient.focus();
                    } else {
                        // if you don't have any clients
                        return clients.openWindow(url);
                    }
                })
        );
    }
});
