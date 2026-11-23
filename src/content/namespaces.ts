// Hajj has no enabled records, routes or normative content. Its namespace is reserved only.
export const contentNamespaces = {
  umrah: { id: "umrah", version: "1.1.0", enabled: true },
  hajj: { id: "hajj", version: "0.0.0", enabled: false },
} as const;
