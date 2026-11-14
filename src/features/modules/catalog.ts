import {
  ArrowLeftRight,
  Briefcase,
  Building2,
  Calculator,
  Clock,
  FileText,
  FolderClosed,
  LayoutDashboard,
  Network,
  Palmtree,
  Shield,
  type LucideIcon,
} from "lucide-react";

export type AppModule = {
  id: string;
  label: string;
  to: string;
  implemented: boolean;
  summary: string;
  icon: LucideIcon;
};

export const primaryModules: AppModule[] = [
  {
    id: "home",
    label: "Inicio",
    to: "/",
    implemented: true,
    summary: "Resumen del escritorio y del estado de cada módulo.",
    icon: LayoutDashboard,
  },
  {
    id: "companies",
    label: "Empresas",
    to: "/companies",
    implemented: true,
    summary: "Alta, consulta y actualización de empresas en este equipo.",
    icon: Building2,
  },
];

export const plannedModules: AppModule[] = [
  {
    id: "organization",
    label: "Organización",
    to: "/modules/organization",
    implemented: false,
    summary: "Áreas, centros de trabajo y estructura de la empresa activa.",
    icon: Network,
  },
  {
    id: "files",
    label: "Expedientes",
    to: "/modules/files",
    implemented: false,
    summary: "Expedientes de personal y datos laborales de cada persona.",
    icon: FolderClosed,
  },
  {
    id: "jobs",
    label: "Puestos",
    to: "/modules/jobs",
    implemented: false,
    summary: "Catálogo de puestos y su relación con la organización.",
    icon: Briefcase,
  },
  {
    id: "users",
    label: "Usuarios y auditoría",
    to: "/modules/users",
    implemented: false,
    summary: "Accesos de operación y el registro de cambios.",
    icon: Shield,
  },
  {
    id: "documents",
    label: "Documentos",
    to: "/modules/documents",
    implemented: false,
    summary: "Archivos asociados a la empresa y al personal.",
    icon: FileText,
  },
  {
    id: "movements",
    label: "Movimientos laborales",
    to: "/modules/movements",
    implemented: false,
    summary: "Altas, bajas y cambios de condición laboral.",
    icon: ArrowLeftRight,
  },
  {
    id: "attendance",
    label: "Asistencia",
    to: "/modules/attendance",
    implemented: false,
    summary: "Registro de asistencia del personal.",
    icon: Clock,
  },
  {
    id: "vacations",
    label: "Vacaciones",
    to: "/modules/vacations",
    implemented: false,
    summary: "Saldos y solicitudes de vacaciones.",
    icon: Palmtree,
  },
  {
    id: "payroll",
    label: "Prenómina",
    to: "/modules/payroll",
    implemented: false,
    summary: "Preparación de la prenómina a partir de la información laboral.",
    icon: Calculator,
  },
];

export const allModules: AppModule[] = [...primaryModules, ...plannedModules];

export function findModule(id: string): AppModule | undefined {
  return allModules.find((module) => module.id === id);
}
