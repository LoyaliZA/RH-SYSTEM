import { useCallback, useSyncExternalStore } from "react";

export const sidebarStorageKey = "rh-system-sidebar";

export type SidebarPreference = "expanded" | "collapsed";

const narrowQuery = "(max-width: 1023px)";

export function readSidebarPreference(): SidebarPreference | null {
  try {
    const stored = localStorage.getItem(sidebarStorageKey);
    if (stored === "expanded" || stored === "collapsed") {
      return stored;
    }
  } catch {
    return null;
  }
  return null;
}

export function resolveSidebarExpanded(
  stored: SidebarPreference | null,
  narrow: boolean,
): boolean {
  if (stored === "expanded") {
    return true;
  }
  if (stored === "collapsed") {
    return false;
  }
  return !narrow;
}

function subscribe(onStoreChange: () => void) {
  const media = window.matchMedia(narrowQuery);
  media.addEventListener("change", onStoreChange);
  return () => media.removeEventListener("change", onStoreChange);
}

export function useNarrowViewport(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(narrowQuery).matches,
    () => false,
  );
}

export function useSidebarPreference() {
  const narrow = useNarrowViewport();
  const stored = useSyncExternalStore(
    (onStoreChange) => {
      window.addEventListener("storage", onStoreChange);
      window.addEventListener("rh-sidebar-change", onStoreChange);
      return () => {
        window.removeEventListener("storage", onStoreChange);
        window.removeEventListener("rh-sidebar-change", onStoreChange);
      };
    },
    readSidebarPreference,
    () => null,
  );

  const write = useCallback((next: SidebarPreference) => {
    try {
      localStorage.setItem(sidebarStorageKey, next);
    } catch {
      /* La preferencia sigue pudiendo leerse en esta pestaña si el almacenamiento falla. */
    }
    window.dispatchEvent(new Event("rh-sidebar-change"));
  }, []);

  const expanded = resolveSidebarExpanded(stored, narrow);

  const toggle = useCallback(() => {
    write(expanded ? "collapsed" : "expanded");
  }, [expanded, write]);

  const collapse = useCallback(() => {
    write("collapsed");
  }, [write]);

  return {
    expanded,
    narrow,
    toggle,
    collapse,
  };
}
