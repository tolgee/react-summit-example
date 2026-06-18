import { describe, it, expect } from "vitest";
import {
  getDirection,
  RTL_BASE_LANGUAGES,
  RTL_SCRIPTS,
} from "./languageDirection";

describe("getDirection", () => {
  it.each([...RTL_BASE_LANGUAGES])(
    "resolves RTL base language %s to rtl",
    (base) => {
      expect(getDirection(base)).toBe("rtl");
    }
  );

  it.each([...RTL_SCRIPTS])(
    "resolves RTL script %s (on an LTR base) to rtl",
    (script) => {
      expect(getDirection(`en-${script}`)).toBe("rtl");
    }
  );

  it("resolves an RTL script in the middle of a 3-subtag tag to rtl", () => {
    expect(getDirection("az-Arab-IR")).toBe("rtl");
    expect(getDirection("uz-Arab-AF")).toBe("rtl");
  });

  it("lets a non-RTL middle script override an LTR base predictably", () => {
    expect(getDirection("az-Latn-AZ")).toBe("ltr");
  });

  it("resolves LTR app languages to ltr", () => {
    expect(getDirection("en")).toBe("ltr");
    expect(getDirection("cs")).toBe("ltr");
  });

  it("resolves region-suffixed RTL tags to rtl", () => {
    expect(getDirection("ar-EG")).toBe("rtl");
    expect(getDirection("fa-IR")).toBe("rtl");
  });

  it("is case-insensitive", () => {
    expect(getDirection("AR")).toBe("rtl");
    expect(getDirection("He")).toBe("rtl");
  });

  it("handles the underscore separator", () => {
    expect(getDirection("he_IL")).toBe("rtl");
  });

  it("lets an explicit non-RTL script override an RTL base", () => {
    expect(getDirection("ar-Latn")).toBe("ltr");
  });

  it("does not mistake a numeric variant for a script", () => {
    expect(getDirection("ar-1996")).toBe("rtl");
  });

  it("defaults degenerate input to ltr", () => {
    expect(getDirection(undefined)).toBe("ltr");
    expect(getDirection("")).toBe("ltr");
    expect(getDirection("-")).toBe("ltr");
  });
});
