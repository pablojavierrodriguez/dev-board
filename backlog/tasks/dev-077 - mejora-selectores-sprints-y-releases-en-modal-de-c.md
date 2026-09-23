---
id: DEV-077
title: "Mejora selectores sprints y releases en modal de card"
status: Draft
created_date: '2026-09-23'
updated_date: '2026-09-23 21:45'
labels: []
dependencies: []
priority: low
type: ux
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Para el campo sprint el listado de sprint debiera ser con un UX/UI similar a la app / modal, no debiera parecer un listado de autocompletado del navegador sin personalidad. Para el campo release, las sugerencias debieran ser por defecto las versiones creadas y en estado unreleased, ya que si no se acumulan históricamente sin límite. Al completar el campo manualmente esta bien que permita incluir tanto unreleased como released versiones, pero no sugerirlas.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->
- [ ] #1 Diseñar un selector/dropdown con estética coherente con la UI de DevBoard para el campo de Sprint en ItemModal
- [ ] #2 Filtrar las sugerencias por defecto del campo Release mostrando únicamente versiones en estado unreleased
- [ ] #3 Permitir la entrada o selección manual de versiones released si el usuario lo requiere expresamente
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Refactorizar el campo sprint en ItemModal para usar un popover/selector enriquecido con badges y fechas.
2. Ajustar la lista de sugerencias de releases en ItemModal para excluir por defecto las versiones ya released.
3. Permitir ingreso libre o búsqueda de released si el usuario escribe.
4. Validar tsc y UX audit.
<!-- SECTION:PLAN:END -->
