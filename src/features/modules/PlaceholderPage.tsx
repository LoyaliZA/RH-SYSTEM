import { useParams } from "react-router-dom";

import { NotImplemented } from "@/components/states/NotImplemented";

import { findModule } from "./catalog";

export function PlaceholderPage() {
  const { moduleId } = useParams();
  const module = moduleId ? findModule(moduleId) : undefined;

  if (!module || module.implemented) {
    return (
      <NotImplemented
        title="Módulo no disponible"
        description="La ruta no corresponde a un módulo en preparación."
      />
    );
  }

  return <NotImplemented title={module.label} description={module.summary} />;
}
