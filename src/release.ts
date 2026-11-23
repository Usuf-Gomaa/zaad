// App releases are independent of the religious-content edition and database schema version.
export const appVersion =
  typeof __APP_VERSION__ === "undefined" ? "0.4.0" : __APP_VERSION__;
export const buildId =
  typeof __BUILD_ID__ === "undefined" ? "0.4.0" : __BUILD_ID__;
export const releases = [
  { version: "0.4.0", date: "2026-11-23", title: "release.040.title", body: "release.040.body" },
  {
    version: "0.3.0",
    date: "2026-11-23",
    title: "release.030.title",
    body: "release.030.body",
  },
  {
    version: "0.2.0",
    date: "2026-11-23",
    title: "release.020.title",
    body: "release.020.body",
  },
];
