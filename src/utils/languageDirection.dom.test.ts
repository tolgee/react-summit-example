// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import {
  applyDocumentDirection,
  bindDocumentDirection,
} from "./languageDirection";

describe("applyDocumentDirection", () => {
  it("sets dir and lang for an RTL tag", () => {
    applyDocumentDirection("ar");
    expect(document.documentElement.dir).toBe("rtl");
    expect(document.documentElement.lang).toBe("ar");
  });

  it("sets dir and lang for an LTR tag", () => {
    applyDocumentDirection("en");
    expect(document.documentElement.dir).toBe("ltr");
    expect(document.documentElement.lang).toBe("en");
  });

  it("falls back to ltr/en for an undefined tag", () => {
    applyDocumentDirection(undefined);
    expect(document.documentElement.dir).toBe("ltr");
    expect(document.documentElement.lang).toBe("en");
  });
});

describe("bindDocumentDirection", () => {
  it("seeds direction from the pending language and reacts to the language event", () => {
    let handler: ((event: { value: string }) => void) | undefined;
    const fakeTolgee = {
      getPendingLanguage: () => "ar",
      on: (_event: "language", cb: (event: { value: string }) => void) => {
        handler = cb;
        return { unsubscribe: () => {} };
      },
    };

    bindDocumentDirection(fakeTolgee);
    expect(document.documentElement.dir).toBe("rtl");
    expect(document.documentElement.lang).toBe("ar");

    handler?.({ value: "he" });
    expect(document.documentElement.dir).toBe("rtl");
    expect(document.documentElement.lang).toBe("he");

    handler?.({ value: "en" });
    expect(document.documentElement.dir).toBe("ltr");
    expect(document.documentElement.lang).toBe("en");
  });
});
