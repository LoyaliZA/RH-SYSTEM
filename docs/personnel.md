# Personal sintético (F2.1 y F2.2)

F2.1 quedó fusionada en `main` mediante el [PR #6](https://github.com/LoyaliZA/RH-SYSTEM/pull/6). F2.2 es el trabajo de esta rama: catálogo de puestos y relación laboral inicial. No cierra F2, no inicia F2.3 y esta rama no afirma que el cambio esté fusionado.

## Modelo

| Concepto         | Qué es                                                                                   | Qué no es                                        |
| ---------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------ |
| Persona          | Identidad de negocio acotada a una empresa: nombre y apellidos                           | Cuenta de acceso, CURP/RFC global                |
| Expediente       | Registro persistido con id interno, número de empleado y estado administrativo           | Contrato, salario, documento sensible            |
| Puesto           | Definición del catálogo de una empresa: código, nombre, descripción opcional y estado    | Departamento, sucursal o salario                 |
| Relación laboral | Periodo de vinculación entre la empresa y un expediente, con fecha de inicio             | El estado administrativo del expediente          |
| Asignación       | Vínculo entre la relación y el puesto inicial. Puede cerrarse después sin borrar la fila | Historial de cambios de puesto (queda para F2.3) |

Todo registro lleva `company_id`. El número de empleado y el código de puesto son únicos por empresa, no en toda la instalación. El mismo código puede existir en empresas distintas. No hay borrado físico de puestos, expedientes ni relaciones.

## Puestos

Operaciones: crear, listar la empresa activa, consultar, editar, activar y desactivar. Desactivar impide nuevas asignaciones y conserva las relaciones ya registradas. El identificador del puesto no es la identidad de la relación.

No hay departamentos ni sucursales. Esas referencias pueden añadirse después, en columnas o tablas nuevas, sin reescribir `jobs`.

## Relación laboral

La relación vive en `employment_relationships`. El puesto inicial vive en `job_assignments`. Crear la relación inicial escribe las dos filas en una transacción. Una persona puede tener otra relación en el futuro, cuando la anterior tenga fecha de fin: el índice único solo cubre las relaciones abiertas (`ended_on` nulo). F2.2 no registra bajas, reingresos ni movimientos.

La vigencia se deriva de `ended_on`: sin fecha de fin, la relación está abierta (`open`, «Vigente»); con fecha de fin, queda concluida. F2.2 solo escribe relaciones abiertas. Esa vigencia no es `administrative_status`. Editar el estado administrativo no abre, cierra ni mueve la relación. Un expediente activo puede no tener relación, y un expediente inactivo puede conservar una relación abierta. Esa diferencia no genera un movimiento histórico.

La fecha de inicio es un día de calendario `AAAA-MM-DD`, sin hora ni zona. Tiene que ser un día real entre 1900 y 2100. Una fecha futura dentro de ese rango es válida. SQLite refuerza el formato con `CHECK`; el calendario real lo valida el dominio, porque SQLite no tiene tipo fecha.

## Cómo sigue sin migraciones destructivas

- F2.3 puede poner `ended_on` en la asignación abierta e insertar otra fila en `job_assignments`. El índice único de asignación abierta obliga a cerrar la anterior antes de abrir la nueva.
- F3 puede poner `ended_on` en la relación y crear otra relación para un reingreso. No hace falta borrar la historia.
- No hay `ON DELETE CASCADE`. Una clave foránea impide borrar un puesto o un expediente que ya está referenciado.
- Las claves `(company_id, id)` impiden asignar un puesto de una empresa al expediente de otra.

## Operación

React llama a comandos Tauri. Rust resuelve la empresa activa y filtra con ella. Un `company_id` enviado desde la interfaz no se usa como autoridad. Consultar un puesto o un expediente de otra empresa responde como no encontrado, sin devolver sus datos.

## Seguridad

F1 está incompleta. F2.1 y F2.2 solo admiten datos sintéticos en compilaciones de desarrollo. En producción, los comandos y casos de uso de personal —puestos y relaciones incluidos— fallan en Rust con `personnel_disabled_in_production`. No basta con ocultar botones. No hay autenticación ficticia, permisos simulados ni un selector de empresa presentado como autorización.

No registrar información personal real hasta que existan autenticación, autorización, aislamiento demostrable, auditoría y respaldo recuperable.
