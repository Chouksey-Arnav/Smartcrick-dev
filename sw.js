// sw.js — SmartCrick Service Worker v3.0
// Strategy: NETWORK-FIRST for same-origin app files (HTML + JS + CSS) so a
//           new deploy is always picked up immediately while online, with a
//           cache fallback that keeps the whole app working offline.
//           Cache-first for immutable CDN libraries; network-first (with
//           offline JSON fallback) for backend APIs.
//
// WHY network-first for app files: the previous stale-while-revalidate
// strategy served the OLD cached HTML/JS first and only refreshed in the
// background — so freshly deployed changes did not appear until several
// reloads later ("I updated the repo but nothing changed"). Network-first
// fixes that class of bug for good without sacrificing offline support.
// ================================================================
const CACHE_V       = 'sc-v10';
const CDN_CACHE     = 'sc-cdn-v10';
const RUNTIME_CACHE = 'sc-runtime-v10';
const CACHE_VERSION = '10.0.0';

// ── All same-origin app files (mirrors index.html script order) ──
const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg',
  '/icon-192.png',
  '/icon-512.png',
  // Styles
  '/styles.css',
  '/styles-patch.css',
  '/styles-vibe.css',
  // Core + data
  '/sc_opensource.js',
  '/app-core.js',
  '/app-data.js',
  '/app-ui.js',
  '/app-ui-patch.js',
  '/app-emotion-engine.js',
  '/app-mascot.js',
  '/app-onboard.js',
  '/app-assessment.js',
  '/app-cricketer-db.js',
  '/app-card-pack.js',
  '/app-leaderboard.js',
  '/app-home.js',
  '/app-personalization.js',
  '/app-brain-engine.js',
  // Intelligence system
  '/app-intelligence.js',
  '/app-preference-ranker.js',
  '/app-intelligence-hub.js',
  '/app-intelligence-digest.js',
  // Drills
  '/app-drills-data.js',
  '/app-drill-video-map.js',
  '/app-drills.js',
  // Mental
  '/app-ui-audio.js',
  '/app-mental-audio.js',
  '/app-mental-personalization.js',
  '/app-mental-scripts.js',
  '/app-mental-routine-creator.js',
  '/app-mental.js',
  '/app-mental-player-v4.js',
  '/app-mental-integration.js',
  '/app-mental-content-extended.js',
  // Fitness
  '/app-exercise-db.js',
  '/app-fitness-engine.js',
  '/app-fitness.js',
  '/app-workout-player.js',
  '/app-timer.js',
  // Fitness Builder 2 (Beta)
  '/app-fitness-builder-2-data.js',
  '/app-fitness-builder-2-calorie-notepad.js',
  '/app-fitness-builder-2-onboarding.js',
  '/app-fitness-builder-2-library.js',
  '/app-fitness-builder-2-session.js',
  '/app-fitness-builder-2.js',
  '/app-schedule.js',
  '/app-skillpaths.js',
  '/app-progress.js',
  '/app-challenges.js',
  '/app-profile.js',
  // Video
  '/app-video-data.js',
  '/app-video-engine.js',
  '/app-video-results.js',
  '/app-video-analysis.js',
  // Remaining feature modules
  '/app-stubs.js',
  '/app-aicoach.js',
  '/app-daily-net.js',
  '/app-viral.js',
  '/app-cricket-dna.js',
  '/app-matchlogger.js',
  '/app-performance.js',
  '/app-quizzes.js',
  '/app-daily-reward.js',
  '/app-crick.js',
  '/app-crick-notifications.js',
  '/app-crick-messages.js',
  '/app-spinwheel-patch.js',
  '/app-sidebar-patch.js',
  '/app-root.js',
  '/app-root-patch.js',
  '/app-vibe.js',
  '/app_daily_challenge.js',
  '/app-drills-v2.js',
  '/app-drills-extra.js',
  '/app-drills-ui-patch.js',
  '/app-drill-videos.js',
  '/app-drills-steps-engine.js',
];

// External CDN libraries to cache (versioned = immutable)
const CDN_ASSETS = [
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/react@18.3.1/umd/react.production.min.js',
  'https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js',
  'https://cdn.jsdelivr.net/npm/i18next@23.11.5/dist/umd/i18next.min.js',
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.3/dist/chart.umd.min.js',
  'https://cdn.jsdelivr.net/npm/dayjs@1.11.11/dayjs.min.js',
  'https://cdn.jsdelivr.net/npm/fuse.js@7.0.0/dist/fuse.umd.min.js',
  'https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/dist/confetti.browser.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdn.jsdelivr.net/npm/mousetrap@1.6.5/mousetrap.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/matter-js/0.20.0/matter.min.js',
  'https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js',
  'https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/ScrollTrigger.min.js',
  'https://unpkg.com/framer-motion@10.18.0/dist/framer-motion.js',
];

// Hosts that are backend APIs — use network-first, fallback JSON
const API_HOSTS = [
  'smartcrick-backend-kgya.vercel.app',
  'auth-smartcrickai.vercel.app',
];

// ── INSTALL: cache everything ────────────────────────────────────
self.addEventListener('install', function(event) {
  self.skipWaiting();
  event.waitUntil(
    Promise.allSettled([
      caches.open(CACHE_V).then(function(cache) {
        return Promise.allSettled(
          APP_SHELL.map(function(url) {
            return cache.add(url).catch(function(e) {
              console.warn('[SW] Could not cache:', url, e.message);
            });
          })
        );
      }),
      caches.open(CDN_CACHE).then(function(cache) {
        return Promise.allSettled(
          CDN_ASSETS.map(function(url) {
            return cache.add(url).catch(function(e) {
              console.warn('[SW] Could not cache CDN:', url, e.message);
            });
          })
        );
      }),
    ]).then(function() {
      console.log('[SW] Install complete — SmartCrick v' + CACHE_VERSION + ' cached for offline');
    })
  );
});

// ── ACTIVATE: clean old caches ───────────────────────────────────
self.addEventListener('activate', function(event) {
  var valid = [CACHE_V, CDN_CACHE, RUNTIME_CACHE];
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return !valid.includes(k); })
            .map(function(k) { return caches.delete(k); })
      );
    }).then(function() {
      console.log('[SW] Activated — old caches cleared');
      return self.clients.claim();
    })
  );
});

// Allow the page to trigger an immediate update
self.addEventListener('message', function(event) {
  if (event.data === 'SKIP_WAITING' || (event.data && event.data.type === 'SKIP_WAITING')) {
    self.skipWaiting();
  }
});

// ── FETCH: smart routing ─────────────────────────────────────────
self.addEventListener('fetch', function(event) {
  var req = event.request;
  var url = new URL(req.url);

  if (req.method !== 'GET') return;
  if (url.protocol === 'chrome-extension:') return;

  // YouTube embeds — no offline support possible
  if (url.hostname.includes('youtube.com') || url.hostname.includes('ytimg.com') || url.hostname.includes('youtube-nocookie.com')) return;

  // ── BACKEND APIS: network-first, offline JSON fallback ──────
  if (API_HOSTS.some(function(h) { return url.hostname === h; })) {
    event.respondWith(
      fetch(req.clone(), { signal: AbortSignal.timeout ? AbortSignal.timeout(10000) : undefined })
        .then(function(res) {
          // Cache successful GET API responses for offline reads
          if (res.ok) {
            var clone = res.clone();
            caches.open(RUNTIME_CACHE).then(function(c) { c.put(req, clone); });
          }
          return res;
        })
        .catch(function() {
          return caches.match(req).then(function(cached) {
            return cached || new Response(
              JSON.stringify({ error: 'offline', message: 'SmartCrick is offline. Your progress is saved locally.' }),
              { status: 503, headers: { 'Content-Type': 'application/json', 'X-SC-Offline': '1' } }
            );
          });
        })
    );
    return;
  }

  // ── GOOGLE FONTS: cache-first ────────────────────────────────
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(
      caches.open(CDN_CACHE).then(function(cache) {
        return cache.match(req).then(function(cached) {
          if (cached) return cached;
          return fetch(req).then(function(res) {
            if (res.ok) cache.put(req, res.clone());
            return res;
          }).catch(function() { return new Response('', { status: 503 }); });
        });
      })
    );
    return;
  }

  // ── YouTube thumbnails: cache-first (works offline once seen) ─
  if (url.hostname === 'img.youtube.com' || url.hostname === 'i.ytimg.com') {
    event.respondWith(
      caches.open(RUNTIME_CACHE).then(function(cache) {
        return cache.match(req).then(function(cached) {
          return cached || fetch(req).then(function(res) {
            if (res.ok) cache.put(req, res.clone());
            return res;
          }).catch(function() { return cached || new Response('', { status: 503 }); });
        });
      })
    );
    return;
  }

  // ── CDN ASSETS (unpkg, jsdelivr, cdnjs, tailwind): cache-first ─
  var isCDN = url.hostname.includes('unpkg.com') ||
              url.hostname.includes('jsdelivr.net') ||
              url.hostname.includes('cdnjs.cloudflare.com') ||
              url.hostname === 'cdn.tailwindcss.com';
  if (isCDN) {
    event.respondWith(
      caches.open(CDN_CACHE).then(function(cache) {
        return cache.match(req).then(function(cached) {
          if (cached) return cached;
          return fetch(req).then(function(res) {
            if (res.ok) cache.put(req, res.clone());
            return res;
          }).catch(function() { return caches.match(req); });
        });
      })
    );
    return;
  }

  // ── SAME-ORIGIN APP FILES: network-first, cache fallback ─────
  // Always try the network first so a fresh deploy shows immediately.
  // On success we refresh the cache; on failure (offline) we serve the
  // last-known-good cached copy, and navigations fall back to the shell.
  if (url.hostname === self.location.hostname) {
    event.respondWith(
      caches.open(CACHE_V).then(function(cache) {
        return fetch(req).then(function(res) {
          if (res && res.ok) cache.put(req, res.clone());
          return res;
        }).catch(function() {
          return cache.match(req).then(function(cached) {
            if (cached) return cached;
            // Navigation requests fall back to the cached app shell
            if (req.mode === 'navigate') {
              return cache.match('/index.html').then(function(shell) {
                return shell || new Response('SmartCrick offline — cached content unavailable', { status: 503 });
              });
            }
            return new Response('SmartCrick offline — cached content unavailable', { status: 503 });
          });
        });
      })
    );
    return;
  }
});

// ── MESSAGE FROM APP (training reminders + Crick notifications) ─
self.addEventListener('message', function(event) {
  if (!event.data) return;
  if (event.data.type === 'SKIP_WAITING' || event.data === 'SKIP_WAITING') {
    self.skipWaiting();
    return;
  }
  if (event.data.type === 'SC_REMINDER') {
    event.waitUntil(
      self.registration.showNotification(event.data.title || 'SmartCrick 🏏', {
        body: event.data.body || "Your training sessions are waiting!",
        icon: '/icon.svg',
        badge: '/icon.svg',
        tag: 'sc-daily-reminder',
        renotify: true,
        requireInteraction: false,
        data: { url: event.data.url || '/#/Schedule' },
      })
    );
  }
  if (event.data.type === 'SC_CRICK_NOTIF') {
    event.waitUntil(
      self.registration.showNotification(event.data.title || 'SmartCrick 🏏', {
        body: event.data.body || "Crick has a message for you!",
        icon: '/icon.svg',
        badge: '/icon.svg',
        tag: 'sc-crick-' + (event.data.category || 'general'),
        renotify: true,
        requireInteraction: false,
        data: { url: event.data.url || '/#/Crick' },
        vibrate: [100, 50, 100],
      })
    );
  }
});

// ── PUSH NOTIFICATIONS (optional) ───────────────────────────────
self.addEventListener('push', function(event) {
  var data = event.data ? event.data.json() : {};
  event.waitUntil(
    self.registration.showNotification(data.title || 'SmartCrick', {
      body: data.body || "Time to train! Today's session is ready.",
      icon: '/icon.svg',
      badge: '/icon.svg',
      tag: 'sc-training',
      requireInteraction: false,
      data: { url: data.url || '/' },
    })
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(list) {
      for (var i = 0; i < list.length; i++) {
        if (list[i].url.includes(self.location.origin) && 'focus' in list[i]) return list[i].focus();
      }
      return clients.openWindow(event.notification.data.url || '/');
    })
  );
});

console.log('[SW] SmartCrick Service Worker v' + CACHE_VERSION + ' loaded (network-first app files)');
