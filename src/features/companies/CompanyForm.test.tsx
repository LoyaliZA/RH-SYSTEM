import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { CompanyForm } from "./CompanyForm";

describe("CompanyForm", () => {
  it("shows a field error and submits the current values", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <CompanyForm
        mode="create"
        values={{ legalName: "", tradeName: "", taxId: "" }}
        fieldErrors={{ legalName: "La razón social es obligatoria." }}
        formError={null}
        pending={false}
        onChange={() => undefined}
        onSubmit={onSubmit}
      />,
    );

    expect(screen.getByRole("textbox", { name: /razón social/i })).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    expect(screen.getByText("La razón social es obligatoria.")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Crear empresa" }));
    expect(onSubmit).toHaveBeenCalledOnce();
  });
});
