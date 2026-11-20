import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";

import { TooltipProvider } from "@/components/ui/tooltip";

import { Sidebar } from "./Sidebar";
import { sidebarStorageKey } from "./use-sidebar";

function renderSidebar() {
  return render(
    <MemoryRouter>
      <TooltipProvider>
        <Sidebar />
      </TooltipProvider>
    </MemoryRouter>,
  );
}

describe("Sidebar", () => {
  afterEach(() => {
    cleanup();
    localStorage.clear();
  });

  it("collapses and keeps the module names available", async () => {
    const user = userEvent.setup();
    renderSidebar();

    expect(screen.getByRole("link", { name: "Inicio" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Contraer navegación" }));

    expect(screen.getByRole("button", { name: "Expandir navegación" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    expect(localStorage.getItem(sidebarStorageKey)).toBe("collapsed");
    expect(screen.getByRole("link", { name: "Vacaciones" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Expedientes" })).toHaveAttribute(
      "href",
      "/files",
    );
    expect(screen.getByRole("navigation", { name: "Módulos" })).toHaveAttribute(
      "id",
      "navegacion-modulos",
    );
  });
});
