# Expedientes digitales (F2.1)

Entrega parcial de F2. No cierra F2 ni habilita F2.2 (puestos, historial salarial, relación laboral completa). Esta rama no afirma que el trabajo esté fusionado en main.

## Modelo

| Concepto         | Qué es en F2.1                                                                 | Qué no es                                  |
| ---------------- | ------------------------------------------------------------------------------ | ------------------------------------------ |
| Persona          | Identidad de negocio acotada a una empresa: nombre y apellidos                 | Cuenta de acceso, CURP/RFC global          |
| Expediente       | Registro persistido con id interno, número de empleado y estado administrativo | Contrato, salario, documento sensible      |
| Relación laboral | Prevista para puestos, vigencias, reingresos e historial                       | No tiene tabla ni procesos en esta entrega |

Todo registro lleva `company_id`. El número de empleado es único por empresa, no en toda la instalación. No hay borrado físico.

## Operación

React llama a comandos Tauri. Rust resuelve la empresa activa y filtra con ella. Un `company_id` enviado desde la interfaz no se usa como autoridad. Consultar un expediente de otra empresa responde como no encontrado.

Campos mínimos: identificador interno, número de empleado, nombre, apellidos, estado administrativo (`active` / `inactive`).

## Seguridad

F1 está incompleta. F2.1 solo admite datos sintéticos en compilaciones de desarrollo. En producción, los comandos y casos de uso de personal fallan en Rust. No hay autenticación ficticia, permisos simulados ni un selector de empresa presentado como autorización.

No registrar información personal real hasta que existan autenticación, autorización, aislamiento demostrable y respaldo recuperable.
