import { expect, test, type Page } from "@playwright/test";

const viewports = [
  { width: 1280, height: 800 },
  { width: 1024, height: 768 },
  { width: 800, height: 600 },
] as const;

type Company = {
  id: string;
  legalName: string;
  tradeName: string | null;
  taxId: string | null;
  displayName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type PersonnelFile = {
  id: string;
  personId: string;
  companyId: string;
  companyName: string;
  employeeNumber: string;
  givenName: string;
  familyName: string;
  administrativeStatus: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
};

async function installDesktop(page: Page, theme: "light" | "dark") {
  await page.addInitScript((initialTheme) => {
    localStorage.setItem("rh-system-theme", initialTheme);
    localStorage.removeItem("rh-system-sidebar");
    const companies: Company[] = [
      {
        id: "company-1",
        legalName: "Taller Norte",
        tradeName: "Norte",
        taxId: "DEMO-0001",
        displayName: "Norte",
        isActive: true,
        createdAt: "2026-11-14T20:00:00Z",
        updatedAt: "2026-11-14T20:00:00Z",
      },
      {
        id: "company-2",
        legalName: "Estudio Sur",
        tradeName: null,
        taxId: null,
        displayName: "Estudio Sur",
        isActive: false,
        createdAt: "2026-11-14T20:00:00Z",
        updatedAt: "2026-11-14T20:00:00Z",
      },
    ];
    const files: PersonnelFile[] = [
      {
        id: "file-1",
        personId: "person-1",
        companyId: "company-1",
        companyName: "Norte",
        employeeNumber: "TN-001",
        givenName: "Alex",
        familyName: "Rivera",
        administrativeStatus: "active",
        createdAt: "2026-11-16T00:00:00Z",
        updatedAt: "2026-11-16T00:00:00Z",
      },
      {
        id: "file-2",
        personId: "person-2",
        companyId: "company-2",
        companyName: "Estudio Sur",
        employeeNumber: "ES-010",
        givenName: "Pat",
        familyName: "Gómez",
        administrativeStatus: "inactive",
        createdAt: "2026-11-16T00:00:00Z",
        updatedAt: "2026-11-16T00:00:00Z",
      },
    ];
    type Job = {
      id: string;
      companyId: string;
      companyName: string;
      code: string;
      name: string;
      description: string | null;
      status: "active" | "inactive";
      createdAt: string;
      updatedAt: string;
    };
    type Employment = {
      id: string;
      companyId: string;
      companyName: string;
      personnelFileId: string;
      startedOn: string;
      endedOn: string | null;
      state: "open" | "closed";
      assignmentId: string;
      jobId: string;
      jobCode: string;
      jobName: string;
      jobStatus: "active" | "inactive";
      effectiveOn: string;
    };
    const jobs: Job[] = [
      {
        id: "job-1",
        companyId: "company-1",
        companyName: "Norte",
        code: "OP-01",
        name: "Operación de piso",
        description: null,
        status: "active",
        createdAt: "2026-11-16T00:00:00Z",
        updatedAt: "2026-11-16T00:00:00Z",
      },
    ];
    const relationships: Employment[] = [];
    function activeCompany() {
      return companies.find((company) => company.isActive) ?? null;
    }
    function filesForActiveCompany(query?: string | null) {
      const company = activeCompany();
      if (!company) {
        throw {
          code: "active_company_required",
          message: "No hay una empresa activa.",
        };
      }
      const needle = (query ?? "").trim().toLowerCase();
      return files.filter((file) => {
        if (file.companyId !== company.id) {
          return false;
        }
        if (!needle) {
          return true;
        }
        return (
          file.employeeNumber.toLowerCase().includes(needle) ||
          file.givenName.toLowerCase().includes(needle) ||
          file.familyName.toLowerCase().includes(needle)
        );
      });
    }
    window.__TAURI_INTERNALS__ = {
      invoke: async (cmd: string, args: Record<string, never> = {}) => {
        if (cmd === "list_companies") {
          return companies.map((company) => ({ ...company }));
        }
        if (cmd === "create_company") {
          const input = args.input as {
            legalName: string;
            tradeName: string | null;
            taxId: string | null;
          };
          const created: Company = {
            id: `company-${companies.length + 1}`,
            legalName: input.legalName,
            tradeName: input.tradeName,
            taxId: input.taxId,
            displayName: input.tradeName || input.legalName,
            isActive: !companies.some((company) => company.isActive),
            createdAt: "2026-11-14T21:00:00Z",
            updatedAt: "2026-11-14T21:00:00Z",
          };
          companies.push(created);
          return created;
        }
        if (cmd === "update_company") {
          const input = args.input as {
            legalName: string;
            tradeName: string | null;
            taxId: string | null;
          };
          const index = companies.findIndex((company) => company.id === args.id);
          const current = companies[index];
          if (!current) {
            throw { code: "company_not_found", message: "La empresa no existe." };
          }
          const next: Company = {
            ...current,
            legalName: input.legalName,
            tradeName: input.tradeName,
            taxId: input.taxId,
            displayName: input.tradeName || input.legalName,
            updatedAt: "2026-11-14T21:05:00Z",
          };
          companies[index] = next;
          return next;
        }
        if (cmd === "set_active_company") {
          companies.forEach((company) => {
            company.isActive = company.id === args.id;
          });
          const active = companies.find((company) => company.id === args.id);
          if (!active) {
            throw { code: "company_not_found", message: "La empresa no existe." };
          }
          return { ...active };
        }
        if (cmd === "list_personnel_files") {
          return filesForActiveCompany(args.query as string | null);
        }
        if (cmd === "get_personnel_file") {
          const company = activeCompany();
          const file = files.find(
            (item) => item.id === args.id && item.companyId === company?.id,
          );
          if (!file) {
            throw {
              code: "personnel_file_not_found",
              message: "No se encontró el expediente en la empresa activa.",
            };
          }
          return { ...file };
        }
        if (cmd === "create_personnel_file") {
          const company = activeCompany();
          if (!company) {
            throw {
              code: "active_company_required",
              message: "No hay una empresa activa.",
            };
          }
          const input = args.input as {
            givenName: string;
            familyName: string;
            employeeNumber: string;
            administrativeStatus: "active" | "inactive";
          };
          if (
            files.some(
              (file) =>
                file.companyId === company.id &&
                file.employeeNumber.toLowerCase() ===
                  input.employeeNumber.toLowerCase(),
            )
          ) {
            throw {
              code: "duplicate_employee_number",
              message:
                "Ya existe un expediente con ese número de empleado en la empresa activa.",
            };
          }
          const created: PersonnelFile = {
            id: `file-${files.length + 1}`,
            personId: `person-${files.length + 1}`,
            companyId: company.id,
            companyName: company.displayName,
            employeeNumber: input.employeeNumber,
            givenName: input.givenName,
            familyName: input.familyName,
            administrativeStatus: input.administrativeStatus,
            createdAt: "2026-11-16T21:00:00Z",
            updatedAt: "2026-11-16T21:00:00Z",
          };
          files.push(created);
          return created;
        }
        if (cmd === "update_personnel_file") {
          const company = activeCompany();
          const input = args.input as {
            givenName: string;
            familyName: string;
            employeeNumber: string;
            administrativeStatus: "active" | "inactive";
          };
          const index = files.findIndex(
            (file) => file.id === args.id && file.companyId === company?.id,
          );
          const current = files[index];
          if (!current) {
            throw {
              code: "personnel_file_not_found",
              message: "No se encontró el expediente en la empresa activa.",
            };
          }
          const next: PersonnelFile = {
            ...current,
            givenName: input.givenName,
            familyName: input.familyName,
            employeeNumber: input.employeeNumber,
            administrativeStatus: input.administrativeStatus,
            updatedAt: "2026-11-16T21:05:00Z",
          };
          files[index] = next;
          return next;
        }
        if (cmd === "list_jobs") {
          const company = activeCompany();
          if (!company) {
            throw {
              code: "active_company_required",
              message: "No hay una empresa activa.",
            };
          }
          return jobs
            .filter((job) => job.companyId === company.id)
            .map((job) => ({ ...job, companyName: company.displayName }));
        }
        if (cmd === "get_job") {
          const company = activeCompany();
          const job = jobs.find(
            (item) => item.id === args.id && item.companyId === company?.id,
          );
          if (!job) {
            throw {
              code: "job_not_found",
              message: "No se encontró el puesto en la empresa activa.",
            };
          }
          return { ...job, companyName: company?.displayName ?? job.companyName };
        }
        if (cmd === "create_job") {
          const company = activeCompany();
          if (!company) {
            throw {
              code: "active_company_required",
              message: "No hay una empresa activa.",
            };
          }
          const input = args.input as {
            code: string;
            name: string;
            description: string | null;
          };
          if (
            jobs.some(
              (job) =>
                job.companyId === company.id &&
                job.code.toLowerCase() === input.code.toLowerCase(),
            )
          ) {
            throw {
              code: "duplicate_job_code",
              message: "Ya existe un puesto con ese código en la empresa activa.",
            };
          }
          const created: Job = {
            id: `job-${jobs.length + 1}`,
            companyId: company.id,
            companyName: company.displayName,
            code: input.code,
            name: input.name,
            description: input.description,
            status: "active",
            createdAt: "2026-11-16T21:00:00Z",
            updatedAt: "2026-11-16T21:00:00Z",
          };
          jobs.push(created);
          return created;
        }
        if (cmd === "update_job") {
          const company = activeCompany();
          const input = args.input as {
            code: string;
            name: string;
            description: string | null;
          };
          const index = jobs.findIndex(
            (job) => job.id === args.id && job.companyId === company?.id,
          );
          const current = jobs[index];
          if (!current) {
            throw {
              code: "job_not_found",
              message: "No se encontró el puesto en la empresa activa.",
            };
          }
          const next: Job = {
            ...current,
            code: input.code,
            name: input.name,
            description: input.description,
            updatedAt: "2026-11-16T21:05:00Z",
          };
          jobs[index] = next;
          return next;
        }
        if (cmd === "set_job_status") {
          const company = activeCompany();
          const input = args.input as { status: "active" | "inactive" };
          const index = jobs.findIndex(
            (job) => job.id === args.id && job.companyId === company?.id,
          );
          const current = jobs[index];
          if (!current) {
            throw {
              code: "job_not_found",
              message: "No se encontró el puesto en la empresa activa.",
            };
          }
          const next: Job = {
            ...current,
            status: input.status,
            updatedAt: "2026-11-16T21:06:00Z",
          };
          jobs[index] = next;
          return next;
        }
        if (cmd === "get_employment_for_file") {
          const company = activeCompany();
          const file = files.find(
            (item) =>
              item.id === args.personnelFileId && item.companyId === company?.id,
          );
          if (!file || !company) {
            throw {
              code: "personnel_file_not_found",
              message: "No se encontró el expediente en la empresa activa.",
            };
          }
          const relationship = relationships.find(
            (item) =>
              item.personnelFileId === file.id &&
              item.companyId === company.id &&
              item.state === "open",
          );
          return relationship ? { ...relationship } : null;
        }
        if (cmd === "create_employment_relationship") {
          const company = activeCompany();
          if (!company) {
            throw {
              code: "active_company_required",
              message: "No hay una empresa activa.",
            };
          }
          const input = args.input as {
            personnelFileId: string;
            jobId: string;
            startedOn: string;
          };
          const file = files.find(
            (item) =>
              item.id === input.personnelFileId && item.companyId === company.id,
          );
          if (!file) {
            throw {
              code: "personnel_file_not_found",
              message: "No se encontró el expediente en la empresa activa.",
            };
          }
          const job = jobs.find(
            (item) => item.id === input.jobId && item.companyId === company.id,
          );
          if (!job) {
            throw {
              code: "job_not_found",
              message: "No se encontró el puesto en la empresa activa.",
            };
          }
          if (
            relationships.some(
              (item) => item.personnelFileId === file.id && item.state === "open",
            )
          ) {
            throw {
              code: "open_employment_relationship",
              message: "Este expediente ya tiene una relación laboral vigente.",
            };
          }
          const created: Employment = {
            id: `rel-${relationships.length + 1}`,
            companyId: company.id,
            companyName: company.displayName,
            personnelFileId: file.id,
            startedOn: input.startedOn,
            endedOn: null,
            state: "open",
            assignmentId: `asg-${relationships.length + 1}`,
            jobId: job.id,
            jobCode: job.code,
            jobName: job.name,
            jobStatus: job.status,
            effectiveOn: input.startedOn,
          };
          relationships.push(created);
          return created;
        }
        throw { code: "unknown", message: `Comando no disponible: ${cmd}` };
      },
      transformCallback: () => 0,
      unregisterCallback: () => undefined,
      convertFileSrc: (filePath: string) => filePath,
      metadata: {
        currentWindow: { label: "main" },
        currentWebview: { label: "main" },
      },
    };
  }, theme);
}

async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => {
    const root = document.documentElement;
    return root.scrollWidth - root.clientWidth;
  });
  expect(overflow).toBeLessThanOrEqual(1);
}

async function expectTextContrast(page: Page) {
  const ratios = await page.evaluate(() => {
    function channel(value: number) {
      const scaled = value / 255;
      return scaled <= 0.03928 ? scaled / 12.92 : ((scaled + 0.055) / 1.055) ** 2.4;
    }
    function rgbChannels(color: string) {
      const canvas = document.createElement("canvas");
      canvas.width = 1;
      canvas.height = 1;
      const context = canvas.getContext("2d");
      if (!context) {
        return [0, 0, 0];
      }
      context.fillStyle = "#000";
      context.fillStyle = color;
      context.fillRect(0, 0, 1, 1);
      const [red, green, blue] = context.getImageData(0, 0, 1, 1).data;
      return [red ?? 0, green ?? 0, blue ?? 0];
    }
    function luminance(color: string) {
      const [red, green, blue] = rgbChannels(color);
      return 0.2126 * channel(red) + 0.7152 * channel(green) + 0.0722 * channel(blue);
    }
    function contrast(foreground: string, background: string) {
      const first = luminance(foreground);
      const second = luminance(background);
      const lighter = Math.max(first, second);
      const darker = Math.min(first, second);
      return (lighter + 0.05) / (darker + 0.05);
    }
    function opaqueBackground(element: Element) {
      let current: Element | null = element;
      while (current) {
        const color = getComputedStyle(current).backgroundColor;
        const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([0-9.]+))?\)/);
        if (match && Number(match[4] ?? "1") > 0.99) {
          return color;
        }
        current = current.parentElement;
      }
      return getComputedStyle(document.body).backgroundColor;
    }
    const body = getComputedStyle(document.body);
    const muted = document.querySelector("main p");
    const button = document.querySelector("main button");
    const samples = [
      {
        name: "body",
        ratio: contrast(body.color, body.backgroundColor),
      },
    ];
    if (muted) {
      samples.push({
        name: "muted",
        ratio: contrast(getComputedStyle(muted).color, opaqueBackground(muted)),
      });
    }
    if (button) {
      samples.push({
        name: "button",
        ratio: contrast(getComputedStyle(button).color, opaqueBackground(button)),
      });
    }
    return samples;
  });
  for (const sample of ratios) {
    expect(sample.ratio, sample.name).toBeGreaterThanOrEqual(4.5);
  }
}

for (const viewport of viewports) {
  for (const theme of ["light", "dark"] as const) {
    test(`${viewport.width}x${viewport.height} ${theme} keeps the shell inside the window`, async ({
      page,
    }) => {
      await page.setViewportSize(viewport);
      await installDesktop(page, theme);
      await page.goto("/#/");
      await expect(page.getByRole("heading", { name: "Inicio" })).toBeVisible();
      await expect(page.getByText("No se muestran cifras de ejemplo.")).toBeVisible();
      await expectNoHorizontalOverflow(page);
      await expectTextContrast(page);

      const toggleName =
        viewport.width < 1024 ? "Expandir navegación" : "Contraer navegación";
      await expect(page.getByRole("button", { name: toggleName })).toBeVisible();

      await page.goto("/#/companies");
      await expect(page.getByRole("heading", { name: "Empresas" })).toBeVisible();
      await expect(
        page.getByRole("article", { name: "Taller Norte" }).getByText("DEMO-0001"),
      ).toBeVisible();
      await expectNoHorizontalOverflow(page);
      const create = page.getByRole("button", { name: "Nueva empresa" });
      await expect(create).toBeVisible();
      const box = await create.boundingBox();
      expect(box).not.toBeNull();
      expect((box?.y ?? 0) + (box?.height ?? 0)).toBeLessThanOrEqual(viewport.height);
      const activate = page.getByRole("button", { name: "Activar", exact: true });
      const actionBox = await activate.boundingBox();
      expect(actionBox).not.toBeNull();
      expect((actionBox?.x ?? 0) + (actionBox?.width ?? 0)).toBeLessThanOrEqual(
        viewport.width,
      );

      await page.goto("/#/files");
      await expect(page.getByRole("heading", { name: "Expedientes" })).toBeVisible();
      await expect(page.getByText("TN-001")).toBeVisible();
      await expect(
        page.getByRole("button", { name: "Nuevo expediente" }),
      ).toBeVisible();
      await expectNoHorizontalOverflow(page);
    });
  }
}

test("edits only the legal name and keeps the stored trade name and tax id", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await installDesktop(page, "light");
  await page.goto("/#/companies");
  await page.getByRole("button", { name: "Editar" }).first().click();
  const legalName = page.getByRole("textbox", { name: /razón social/i });
  await expect(page.getByRole("textbox", { name: /nombre comercial/i })).toHaveValue(
    "Norte",
  );
  await expect(
    page.getByRole("textbox", { name: /identificador fiscal/i }),
  ).toHaveValue("DEMO-0001");
  await legalName.fill("Taller Norte Actualizado");
  await page.getByRole("button", { name: "Guardar cambios" }).click();
  await expect(page.getByRole("status")).toContainText("Se guardaron los cambios.");
  const updated = page.getByRole("article", { name: "Taller Norte Actualizado" });
  await expect(updated).toBeVisible();
  await expect(updated.getByText("Norte", { exact: true })).toBeVisible();
  await expect(updated.getByText("DEMO-0001", { exact: true })).toBeVisible();
});

function parseHex(hex: string) {
  const value = hex.replace("#", "");
  return [
    Number.parseInt(value.slice(0, 2), 16),
    Number.parseInt(value.slice(2, 4), 16),
    Number.parseInt(value.slice(4, 6), 16),
  ];
}

async function readPaint(page: Page) {
  return page.evaluate(() => {
    function rgb(color: string) {
      const canvas = document.createElement("canvas");
      canvas.width = 1;
      canvas.height = 1;
      const context = canvas.getContext("2d");
      if (!context) {
        return [0, 0, 0];
      }
      context.fillStyle = "#000";
      context.fillStyle = color;
      context.fillRect(0, 0, 1, 1);
      const [red, green, blue] = context.getImageData(0, 0, 1, 1).data;
      return [red ?? 0, green ?? 0, blue ?? 0];
    }
    function token(name: string) {
      const probe = document.createElement("span");
      probe.style.color = `var(${name})`;
      document.body.append(probe);
      const channels = rgb(getComputedStyle(probe).color);
      probe.remove();
      return channels;
    }
    const button = document.querySelector("main button");
    const card = document.querySelector("main .bg-card");
    const sidebar = document.querySelector("#navegacion");
    const mark = document.querySelector("[data-brand-petal='amethyst']");
    const mintPetal = document.querySelector("[data-brand-petal='mint']");
    const textColors = [...document.querySelectorAll("body *")]
      .filter((element) => (element.textContent ?? "").trim().length > 0)
      .map((element) => rgb(getComputedStyle(element).color));
    return {
      body: rgb(getComputedStyle(document.body).backgroundColor),
      card: card ? rgb(getComputedStyle(card).backgroundColor) : null,
      sidebar: sidebar ? rgb(getComputedStyle(sidebar).backgroundColor) : null,
      mark: mark ? rgb(getComputedStyle(mark).fill) : null,
      mintPetal: mintPetal ? rgb(getComputedStyle(mintPetal).fill) : null,
      buttonBackground: button ? rgb(getComputedStyle(button).backgroundColor) : null,
      buttonText: button ? rgb(getComputedStyle(button).color) : null,
      fontFamily: getComputedStyle(document.body).fontFamily,
      faces: [...document.fonts].map((font) => ({
        family: font.family,
        weight: font.weight,
        status: font.status,
      })),
      resources: performance
        .getEntriesByType("resource")
        .map((entry) => entry.name)
        .filter((name) => /font|woff|jakarta|plex/i.test(name)),
      mint: token("--mint"),
      amethyst: token("--rh-amethyst"),
      primaryInk: token("--primary-ink"),
      textColors,
    };
  });
}

function expectChannels(actual: number[] | null, hex: string, label: string) {
  expect(actual, label).not.toBeNull();
  const expected = parseHex(hex);
  expect(actual?.[0], label).toBe(expected[0]);
  expect(actual?.[1], label).toBe(expected[1]);
  expect(actual?.[2], label).toBe(expected[2]);
}

for (const theme of ["light", "dark"] as const) {
  test(`official colors, font, and contrast hold in ${theme}`, async ({ page }) => {
    await page.route("**/*", (route) => {
      const url = route.request().url();
      if (url.startsWith("http://127.0.0.1:1420") || url.startsWith("data:")) {
        return route.continue();
      }
      return route.abort();
    });
    await page.setViewportSize({ width: 1280, height: 800 });
    await installDesktop(page, theme);
    await page.goto("/#/companies");
    await expect(page.getByRole("heading", { name: "Empresas" })).toBeVisible();
    await page.evaluate(async () => {
      await Promise.all(
        ["400", "500", "600", "700"].map((weight) =>
          document.fonts.load(`${weight} 16px "Plus Jakarta Sans"`),
        ),
      );
      await document.fonts.ready;
    });
    const paint = await readPaint(page);

    expectChannels(paint.body, theme === "light" ? "#F6F5F8" : "#1D1725", "canvas");
    expectChannels(paint.card, theme === "light" ? "#FFFFFF" : "#30283A", "surface");
    expectChannels(paint.sidebar, theme === "light" ? "#EEEAF3" : "#282132", "sidebar");
    expectChannels(paint.buttonBackground, "#7956B5", "primary button");
    expectChannels(paint.buttonText, "#FFFFFF", "primary button text");
    expectChannels(paint.mint, "#65BFA8", "mint token");
    expectChannels(paint.amethyst, "#7956B5", "amethyst token");
    expectChannels(
      paint.primaryInk,
      theme === "light" ? "#7956B5" : "#B092D8",
      "primary ink",
    );
    expectChannels(paint.mark, "#7956B5", "brand mark");
    expectChannels(paint.mintPetal, "#65BFA8", "brand mint");
    expect(paint.fontFamily.toLowerCase()).toContain("plus jakarta sans");
    expect(paint.fontFamily.toLowerCase()).not.toContain("ibm plex");
    for (const weight of ["400", "500", "600", "700"]) {
      expect(
        paint.faces.some(
          (face) =>
            face.family.replaceAll('"', "").toLowerCase() === "plus jakarta sans" &&
            face.weight === weight &&
            face.status === "loaded",
        ),
        `weight ${weight}`,
      ).toBe(true);
    }
    expect(paint.resources.some((name) => /ibm-plex/i.test(name))).toBe(false);
    expect(
      paint.resources.every(
        (name) => name.startsWith("http://127.0.0.1:1420") || name.startsWith("data:"),
      ),
    ).toBe(true);
    const mint = parseHex("#65BFA8");
    const brand = parseHex("#7956B5");
    for (const color of paint.textColors) {
      expect(color).not.toEqual(mint);
      if (theme === "dark") {
        expect(color).not.toEqual(brand);
      }
    }
    await expectTextContrast(page);
  });
}

test("creates, searches and edits a synthetic personnel file", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await installDesktop(page, "light");
  await page.goto("/#/files");
  await expect(page.getByRole("heading", { name: "Expedientes" })).toBeVisible();
  await page.getByRole("button", { name: "Nuevo expediente" }).click();
  await page.getByRole("textbox", { name: /^nombre/i }).fill("Sam");
  await page.getByRole("textbox", { name: /apellidos/i }).fill("Ortega");
  await page.getByRole("textbox", { name: /número de empleado/i }).fill("TN-002");
  await page.getByRole("button", { name: "Crear expediente" }).click();
  await expect(page.getByRole("status")).toContainText("Se creó el expediente.");
  await expect(page.getByText("TN-002")).toBeVisible();

  await page.getByLabel("Buscar expedientes").fill("TN-002");
  await page.getByRole("button", { name: "Buscar" }).click();
  await expect(page.getByText("TN-002")).toBeVisible();
  await expect(page.getByText("TN-001")).toHaveCount(0);

  await page.getByRole("link", { name: "Consultar" }).click();
  await expect(page.getByText("file-3")).toBeVisible();
  await expect(
    page.locator("#contenido").getByText("Norte", { exact: true }),
  ).toBeVisible();
  await page.getByRole("textbox", { name: /apellidos/i }).fill("Ortega Díaz");
  await expect(page.getByText("Hay cambios sin guardar.")).toBeVisible();
  await page.getByRole("button", { name: "Guardar cambios" }).click();
  await expect(page.getByRole("status")).toContainText("Se guardaron los cambios.");
});

test("reloads personnel files after changing the active company", async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 768 });
  await installDesktop(page, "dark");
  await page.goto("/#/files");
  await expect(page.getByText("TN-001")).toBeVisible();
  await page.goto("/#/");
  await page.getByLabel("Elegir empresa").selectOption("company-2");
  await page.goto("/#/files");
  await expect(page.getByText("ES-010")).toBeVisible();
  await expect(page.getByText("TN-001")).toHaveCount(0);
});

for (const theme of ["light", "dark"] as const) {
  test(`jobs and the initial employment relationship stay inside the window in ${theme}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await installDesktop(page, theme);
    await page.goto("/#/jobs");
    await expect(page.getByRole("heading", { name: "Puestos" })).toBeVisible();
    await expect(page.getByText("OP-01")).toBeVisible();
    await expect(page.getByText("Operación de piso")).toBeVisible();
    await expectNoHorizontalOverflow(page);
    await expectTextContrast(page);

    await page.getByRole("button", { name: "Nuevo puesto" }).click();
    await expect(page.getByRole("heading", { name: "Nuevo puesto" })).toBeVisible();
    const captureDir = process.env.F22_CAPTURE_DIR;
    if (captureDir) {
      await page.locator(".rh-drawer").evaluate(async (element) => {
        await Promise.all(
          element.getAnimations().map((animation) => animation.finished),
        );
      });
      await page.screenshot({ path: `${captureDir}/jobs-form-${theme}.png` });
    }
    await page.getByRole("textbox", { name: /código/i }).fill("OP-02");
    await page.getByRole("textbox", { name: /nombre del puesto/i }).fill("Recepción");
    await page.getByRole("button", { name: "Crear puesto" }).click();
    await expect(page.getByRole("status")).toContainText("Se creó el puesto.");
    await expect(page.getByText("OP-02")).toBeVisible();
    if (captureDir) {
      await page.screenshot({
        path: `${captureDir}/jobs-list-${theme}.png`,
        fullPage: true,
      });
    }

    await page.setViewportSize({ width: 800, height: 600 });
    await expectNoHorizontalOverflow(page);
    await page.setViewportSize({ width: 1280, height: 800 });

    await page.goto("/#/files/file-1");
    await expect(page.getByText("Sin relación laboral")).toBeVisible();
    if (captureDir) {
      await page.getByText("Sin relación laboral").evaluate((element) => {
        element.scrollIntoView({ block: "center" });
      });
      await page.screenshot({ path: `${captureDir}/employment-empty-${theme}.png` });
    }
    await page.getByRole("button", { name: "Registrar relación inicial" }).click();
    await page.getByLabel("Fecha de inicio").fill("2026-11-16");
    await page.getByLabel("Puesto").selectOption("job-1");
    await page.getByRole("button", { name: "Registrar relación" }).click();
    await expect(page.getByRole("status")).toContainText(
      "Se registró la relación laboral.",
    );
    await expect(page.getByText("16 de noviembre de 2026")).toBeVisible();
    await expect(page.getByText("Vigente")).toBeVisible();
    await expectNoHorizontalOverflow(page);
    if (captureDir) {
      await page.getByText("Puesto asignado").evaluate((element) => {
        element.scrollIntoView({ block: "center" });
      });
      await page.screenshot({ path: `${captureDir}/employment-linked-${theme}.png` });
    }

    await page.goto("/#/");
    await page.getByLabel("Elegir empresa").selectOption("company-2");
    await page.goto("/#/jobs");
    await expect(page.getByText("Todavía no hay puestos")).toBeVisible();
    await expect(page.getByText("OP-01")).toHaveCount(0);
    await page.goto("/#/files/file-2");
    await expect(page.getByText("Sin relación laboral")).toBeVisible();
    await expect(page.getByText("16 de noviembre de 2026")).toHaveCount(0);
  });
}

test("changes the active company from the dashboard selector", async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 768 });
  await installDesktop(page, "dark");
  await page.goto("/#/");
  await page.getByLabel("Elegir empresa").selectOption("company-2");
  await expect(
    page.getByRole("link", { name: /Empresa activa: Estudio Sur/ }),
  ).toBeVisible();
});
