import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { createCompany, listCompanies, setActiveCompany, updateCompany } from "./api";
import { fieldForError, readCommandError } from "./errors";
import type { CommandError, Company, CompanyField, CompanyInput } from "./types";

type LoadState =
  | { status: "loading"; companies: Company[]; error: null }
  | { status: "ready"; companies: Company[]; error: null }
  | { status: "error"; companies: Company[]; error: CommandError };

export type CompanyActionResult =
  | { ok: true }
  | {
      ok: false;
      fieldErrors: Partial<Record<CompanyField, string>>;
      formError: string | null;
    };

type CompanyContextValue = {
  status: LoadState["status"];
  companies: Company[];
  error: CommandError | null;
  pending: boolean;
  activeCompany: Company | null;
  reload: () => Promise<void>;
  create: (input: CompanyInput) => Promise<CompanyActionResult>;
  update: (id: string, input: CompanyInput) => Promise<CompanyActionResult>;
  activate: (id: string) => Promise<CompanyActionResult>;
};

const CompanyContext = createContext<CompanyContextValue | null>(null);

export function CompanyProvider({ children }: { children: ReactNode }) {
  const [load, setLoad] = useState<LoadState>({
    status: "loading",
    companies: [],
    error: null,
  });
  const [pending, setPending] = useState(false);

  const reload = useCallback(async (quiet = false) => {
    if (!quiet) {
      setLoad((current) => ({
        status: "loading",
        companies: current.companies,
        error: null,
      }));
    }
    try {
      const companies = await listCompanies();
      setLoad({ status: "ready", companies, error: null });
    } catch (error) {
      setLoad({
        status: "error",
        companies: [],
        error: readCommandError(error),
      });
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    listCompanies()
      .then((companies) => {
        if (!cancelled) {
          setLoad({ status: "ready", companies, error: null });
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setLoad({
            status: "error",
            companies: [],
            error: readCommandError(error),
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const runMutation = useCallback(
    async (action: () => Promise<unknown>): Promise<CompanyActionResult> => {
      setPending(true);
      try {
        await action();
        await reload(true);
        return { ok: true };
      } catch (error) {
        const commandError = readCommandError(error);
        const field = fieldForError(commandError.code);
        if (field) {
          return {
            ok: false,
            fieldErrors: { [field]: commandError.message },
            formError: null,
          };
        }
        return {
          ok: false,
          fieldErrors: {},
          formError: commandError.message,
        };
      } finally {
        setPending(false);
      }
    },
    [reload],
  );

  const value = useMemo<CompanyContextValue>(() => {
    const activeCompany = load.companies.find((company) => company.isActive) ?? null;
    return {
      status: load.status,
      companies: load.companies,
      error: load.error,
      pending,
      activeCompany,
      reload: () => reload(false),
      create: (input) => runMutation(() => createCompany(input)),
      update: (id, input) => runMutation(() => updateCompany(id, input)),
      activate: (id) => runMutation(() => setActiveCompany(id)),
    };
  }, [load, pending, reload, runMutation]);

  return <CompanyContext.Provider value={value}>{children}</CompanyContext.Provider>;
}

export function useCompanies(): CompanyContextValue {
  const value = useContext(CompanyContext);
  if (!value) {
    throw new Error("useCompanies debe usarse dentro de CompanyProvider");
  }
  return value;
}
