import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";

import { PlaceholderPage } from "./PlaceholderPage";

describe("PlaceholderPage", () => {
  it("marks a planned module as not implemented", () => {
    render(
      <MemoryRouter initialEntries={["/modules/vacations"]}>
        <Routes>
          <Route path="/modules/:moduleId" element={<PlaceholderPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: "Vacaciones" })).toBeInTheDocument();
    expect(screen.getByText("Este módulo no está implementado.")).toBeInTheDocument();
  });
});
