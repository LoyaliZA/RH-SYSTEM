import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { PersonnelFileForm } from "./PersonnelFileForm";
import { emptyPersonnelForm } from "./types";

describe("PersonnelFileForm", () => {
  it("shows a field error and submits the current values", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <PersonnelFileForm
        mode="create"
        values={emptyPersonnelForm}
        fieldErrors={{ givenName: "El nombre es obligatorio." }}
        formError={null}
        pending={false}
        onChange={() => undefined}
        onSubmit={onSubmit}
      />,
    );

    expect(screen.getByRole("textbox", { name: /nombre/i })).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    expect(screen.getByText("El nombre es obligatorio.")).toBeInTheDocument();
    expect(screen.getByText(/datos sintéticos/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Crear expediente" }));
    expect(onSubmit).toHaveBeenCalledOnce();
  });
});
