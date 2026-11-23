/// <reference lib="webworker" />
import {
  precacheAndRoute,
  cleanupOutdatedCaches,
  createHandlerBoundToURL,
} from "workbox-precaching";
import { registerRoute, NavigationRoute } from "workbox-routing";
import { buildId } from "../release";
declare const self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: Array<{ url: string; revision: string | null }>;
};
// A waiting worker never calls skipWaiting on install. Caches contain app assets, never user notes.
precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();
registerRoute(new NavigationRoute(createHandlerBoundToURL("/index.html")));
self.addEventListener("message", (event) => {
  if (event.data?.type !== "ZAAD_SAFE_ACTIVATE") return;
  const port = event.ports[0];
  if (!port) return;
  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });
      // Conservative multi-tab policy: never refresh a second tab with unknown in-memory edits.
      if (
        windows.length !== 1 ||
        !event.source ||
        !("id" in event.source) ||
        windows[0].id !== event.source.id
      ) {
        port.postMessage({ ok: false, reason: "update.tabs" });
        return;
      }
      const commit = await new Promise<boolean>((resolve) => {
        const timeout = setTimeout(() => resolve(false), 12000);
        port.onmessage = (message) => {
          if (message.data?.type === "COMMIT") {
            clearTimeout(timeout);
            resolve(true);
          }
        };
        port.postMessage({ ready: true, buildId });
      });
      if (!commit) {
        port.postMessage({ ok: false, reason: "update.pending" });
        return;
      }
      const finalWindows = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });
      if (
        finalWindows.length !== 1 ||
        !event.source ||
        !("id" in event.source) ||
        finalWindows[0].id !== event.source.id
      ) {
        port.postMessage({ ok: false, reason: "update.tabs" });
        return;
      }
      await self.skipWaiting();
      port.postMessage({ ok: true });
    })(),
  );
});
