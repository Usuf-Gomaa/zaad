// Compile-time boundary: default public builds cannot enable this via a URL or browser setting.
export const isPrivateReviewBuild =
  typeof __EDITORIAL_REVIEW__ !== "undefined" && __EDITORIAL_REVIEW__;
export const isAuthenticatedStaging =
  typeof __AUTHENTICATED_STAGING__ !== 'undefined' && __AUTHENTICATED_STAGING__;
export const isEditorialEnvironment =
  import.meta.env.DEV || isPrivateReviewBuild;
