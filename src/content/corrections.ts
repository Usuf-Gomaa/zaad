// Imported editorial correction flags, not independent legal approval.
export const corrections = [
  {
    id: "COR01",
    text: "'Any stitched ihram is forbidden' -> false overgeneralization.",
    reviewStatus: "correction_required",
    provenance: "ZAAD_RELIGIOUS_CONTENT_PACK_v1.md §7",
  },
  {
    id: "COR02",
    text: "'Elastic, velcro, clips always forbidden' -> unverified blanket ruling; remove.",
    reviewStatus: "correction_required",
    provenance: "ZAAD_RELIGIOUS_CONTENT_PACK_v1.md §7",
  },
  {
    id: "COR03",
    text: "'Changing ihram clothes invalidates ihram' -> incorrect; remove.",
    reviewStatus: "correction_required",
    provenance: "ZAAD_RELIGIOUS_CONTENT_PACK_v1.md §7",
  },
  {
    id: "COR04",
    text: "'Perfuming ihram fabric is fine if never removed' -> do not publish.",
    reviewStatus: "correction_required",
    provenance: "ZAAD_RELIGIOUS_CONTENT_PACK_v1.md §7",
  },
  {
    id: "COR05",
    text: "'Menstruation lasting long automatically ends ihram' -> incorrect generalization; remove.",
    reviewStatus: "correction_required",
    provenance: "ZAAD_RELIGIOUS_CONTENT_PACK_v1.md §7",
  },
  {
    id: "COR06",
    text: "'All prayer inside Hijr forbidden' -> incorrect generalization; remove.",
    reviewStatus: "correction_required",
    provenance: "ZAAD_RELIGIOUS_CONTENT_PACK_v1.md §7",
  },
  {
    id: "COR07",
    text: "'Seeing Kaaba du'a is established sunnah' -> do not assert.",
    reviewStatus: "correction_required",
    provenance: "ZAAD_RELIGIOUS_CONTENT_PACK_v1.md §7",
  },
  {
    id: "COR08",
    text: "'Specific du'a at every circuit' -> do not invent.",
    reviewStatus: "correction_required",
    provenance: "ZAAD_RELIGIOUS_CONTENT_PACK_v1.md §7",
  },
  {
    id: "COR09",
    text: "'If wudu breaks, always restart half-circuit' -> disputed; do not auto-rule.",
    reviewStatus: "correction_required",
    provenance: "ZAAD_RELIGIOUS_CONTENT_PACK_v1.md §7",
  },
  {
    id: "COR10",
    text: "'All hair falling incurs fidyah' -> do not assert.",
    reviewStatus: "correction_required",
    provenance: "ZAAD_RELIGIOUS_CONTENT_PACK_v1.md §7",
  },
  {
    id: "COR11",
    text: "'Tawaf is prayer' alone settles purity dispute -> incomplete legal reasoning.",
    reviewStatus: "correction_required",
    provenance: "ZAAD_RELIGIOUS_CONTENT_PACK_v1.md §7",
  },
  {
    id: "COR12",
    text: "'Bukhari/Muslim hadith exact formula' -> verify before literal publication.",
    reviewStatus: "correction_required",
    provenance: "ZAAD_RELIGIOUS_CONTENT_PACK_v1.md §7",
  },
  {
    id: "COR13",
    text: "'Best sa'i floor is closest to Kaaba' -> no supported claim.",
    reviewStatus: "correction_required",
    provenance: "ZAAD_RELIGIOUS_CONTENT_PACK_v1.md §7",
  },
  {
    id: "COR14",
    text: "Miqat distance figures -> remove pending verification.",
    reviewStatus: "correction_required",
    provenance: "ZAAD_RELIGIOUS_CONTENT_PACK_v1.md §7",
  },
] as const;
