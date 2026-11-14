import { describe, expect, it } from "vitest";

import { resolveSidebarExpanded } from "./use-sidebar";

describe("resolveSidebarExpanded", () => {
  it("follows the viewport until a preference is stored", () => {
    expect(resolveSidebarExpanded(null, false)).toBe(true);
    expect(resolveSidebarExpanded(null, true)).toBe(false);
  });

  it("keeps an explicit preference on a narrow window", () => {
    expect(resolveSidebarExpanded("expanded", true)).toBe(true);
    expect(resolveSidebarExpanded("collapsed", false)).toBe(false);
  });
});
