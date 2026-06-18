export const RTL_BASE_LANGUAGES = new Set([
  "ar",
  "he",
  "fa",
  "ur",
  "ps",
  "sd",
  "ug",
  "yi",
  "dv",
  "ckb",
  "iw",
  "ji",
]);

export const RTL_SCRIPTS = new Set(["arab", "hebr", "thaa", "syrc", "nkoo"]);

export const getDirection = (tag: string | undefined): "rtl" | "ltr" => {
  if (!tag) {
    return "ltr";
  }

  const parts = tag
    .toLowerCase()
    .split(/[-_]/)
    .filter(Boolean);

  const script = parts.find((part) => /^[a-z]{4}$/.test(part));
  if (script) {
    return RTL_SCRIPTS.has(script) ? "rtl" : "ltr";
  }

  return RTL_BASE_LANGUAGES.has(parts[0]) ? "rtl" : "ltr";
};

export const applyDocumentDirection = (tag: string | undefined): void => {
  document.documentElement.dir = getDirection(tag);
  document.documentElement.lang = tag || "en";
};

type DirectionBindableTolgee = {
  getPendingLanguage: () => string | undefined;
  on: (
    event: "language",
    handler: (event: { value: string }) => void
  ) => unknown;
};

export const bindDocumentDirection = (tolgee: DirectionBindableTolgee): void => {
  applyDocumentDirection(tolgee.getPendingLanguage());
  tolgee.on("language", (event) => applyDocumentDirection(event.value));
};
