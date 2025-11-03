# User Stories - Sistema de Gestión de Tareas

## Información General
Este documento contiene las User Stories (US) para el desarrollo del sistema de gestión de tareas. El proyecto está enfocado en el frontend, utilizando Next.js y almacenamiento en localStorage (JSON) hasta que se integre con el backend.

**Roles del Sistema:**
- **Supervisor**: Puede crear tareas, asignarlas a colaboradores y revisar/aprobar ejecuciones
- **Colaborador**: Puede ejecutar tareas asignadas y enviarlas para revisión

---

## FASE 1: Autenticación y Acceso

### US-001: Login y Redirección por Rol
**Como** un usuario del sistema  
**Quiero** iniciar sesión con mi email y contraseña  
**Para** acceder al sistema según mi rol

**Criterios de Aceptación:**
- Existe un formulario de login con campos email y contraseña
- Al hacer login exitoso, el usuario se guarda en localStorage
- El sistema redirige automáticamente según el rol:
  - Supervisor → `/supervisor`
  - Colaborador → `/colaborador`
- Si el login falla, se muestra un mensaje de error claro
- El token de autenticación se guarda en localStorage

**Estado:** ⚠️ Parcialmente implementado (login existe pero necesita mejor integración con roles)

**Prioridad:** Alta

---

### US-002: Protección de Rutas por Rol
**Como** un usuario del sistema  
**Quiero** que las rutas estén protegidas según mi rol  
**Para** evitar acceder a pantallas que no me corresponden

**Criterios de Aceptación:**
- Si un Colaborador intenta acceder a `/supervisor`, es redirigido a `/colaborador`
- Si un Supervisor intenta acceder a `/colaborador/exec/[id]`, es redirigido a `/supervisor`
- Si un usuario no autenticado intenta acceder a rutas protegidas, es redirigido a `/auth/login`
- Los redirects funcionan correctamente en todas las páginas protegidas

**Estado:** ⚠️ Parcialmente implementado (algunos redirects existen pero necesitan mejorarse)

**Prioridad:** Alta

---

### US-003: Cerrar Sesión
**Como** un usuario del sistema  
**Quiero** poder cerrar sesión  
**Para** proteger mi cuenta cuando termine de usar el sistema

**Criterios de Aceptación:**
- Existe un botón "Cerrar sesión" en el navbar o menú de usuario
- Al cerrar sesión, se eliminan los datos del usuario y token de localStorage
- El usuario es redirigido a la página de login
- La sesión no se puede recuperar después de cerrar

**Estado:** ❌ No implementado

**Prioridad:** Media

---

## FASE 2: Gestión de Tareas (Supervisor)

### US-004: Crear Nueva Tarea
**Como** un supervisor  
**Quiero** crear una nueva tarea desde cero  
**Para** agregar tareas personalizadas a la base de datos

**Criterios de Aceptación:**
- Existe un formulario para crear tareas con los campos:
  - Nombre de la tarea (obligatorio)
  - Descripción/Objetivo (opcional)
  - Pasos/Subtareas (puede tener 0 o más pasos)
- Cada paso puede tener:
  - Descripción (obligatorio)
  - Tipo de campo (texto, número, fecha, checkbox, select, foto, archivo, firma)
  - ¿Es obligatorio? (checkbox)
  - Condiciones de visibilidad (opcional, avanzado)
- La tarea se guarda en localStorage (JSON)
- Después de crear, se muestra mensaje de éxito y se redirige al panel de supervisor
- Se valida que al menos el nombre de la tarea esté completo

**Estado:** ❌ No implementado (solo se pueden asignar checklists existentes)

**Prioridad:** Alta

---

### US-005: Asignar Tarea a Colaborador
**Como** un supervisor  
**Quiero** asignar una tarea existente a un colaborador  
**Para** que el colaborador pueda ejecutarla

**Criterios de Aceptación:**
- Desde el panel de supervisor, puedo ver un botón "Nueva Asignación"
- Al hacer clic, se muestra un formulario con:
  - Selector de tarea (lista de tareas creadas)
  - Email del colaborador (obligatorio, validación de email)
  - Fecha de vencimiento (obligatorio, no puede ser fecha pasada)
  - Prioridad (Alta, Media, Baja - opcional, default: Media)
  - Notas (opcional, textarea)
- Al guardar, la asignación se crea con estado "Asignada"
- La asignación se guarda en localStorage
- Se muestra confirmación de éxito

**Estado:** ✅ Implementado (AssignmentForm existe y funciona)

**Prioridad:** Alta

**Nota:** Esta US ya está implementada, puede servir como referencia para otras.

---

### US-006: Ver Lista de Tareas Creadas
**Como** un supervisor  
**Quiero** ver todas las tareas que he creado  
**Para** poder gestionarlas y asignarlas

**Criterios de Aceptación:**
- Existe una sección en el panel de supervisor que muestra todas las tareas
- Cada tarea muestra:
  - Nombre
  - Cantidad de pasos
  - Fecha de creación
  - Botones de acción: "Editar", "Eliminar", "Asignar"
- Se puede filtrar por nombre (búsqueda)
- Las tareas se cargan desde localStorage

**Estado:** ❌ No implementado

**Prioridad:** Media

---

### US-007: Editar Tarea Existente
**Como** un supervisor  
**Quiero** editar una tarea existente  
**Para** actualizar su información o pasos

**Criterios de Aceptación:**
- Desde la lista de tareas, puedo hacer clic en "Editar" de una tarea
- Se abre un formulario prellenado con los datos de la tarea
- Puedo modificar:
  - Nombre
  - Descripción
  - Agregar nuevos pasos
  - Editar pasos existentes
  - Eliminar pasos
- Al guardar, se actualiza la tarea en localStorage
- Si la tarea tiene asignaciones activas, se muestra una advertencia
- Se valida que la tarea tenga al menos un nombre

**Estado:** ❌ No implementado

**Prioridad:** Media

---

### US-008: Eliminar Tarea
**Como** un supervisor  
**Quiero** eliminar una tarea  
**Para** mantener el sistema limpio de tareas obsoletas

**Criterios de Aceptación:**
- Desde la lista de tareas, puedo hacer clic en "Eliminar"
- Se muestra un diálogo de confirmación antes de eliminar
- Si la tarea tiene asignaciones activas (no completadas), se muestra un mensaje de advertencia
- Al confirmar, la tarea se elimina de localStorage
- Se muestra un mensaje de éxito

**Estado:** ❌ No implementado

**Prioridad:** Baja

---

### US-009: Ver Lista de Asignaciones
**Como** un supervisor  
**Quiero** ver todas las asignaciones de tareas  
**Para** supervisar el estado de las tareas asignadas

**Criterios de Aceptación:**
- El panel de supervisor muestra una tabla con todas las asignaciones
- Cada asignación muestra:
  - Nombre de la tarea
  - Colaborador asignado (email)
  - Fecha de vencimiento
  - Prioridad
  - Estado (Asignada, En ejecución, Enviada, Aprobada, Rechazada, Vencida)
  - Botón de acción según el estado (Revisar si está "Enviada")
- Se puede filtrar por estado
- Se puede ordenar por fecha de vencimiento (más cercanas primero)
- Las asignaciones vencidas se destacan visualmente

**Estado:** ✅ Implementado (AssignmentList existe y funciona)

**Prioridad:** Alta

**Nota:** Esta US ya está implementada.

---

### US-010: Revisar y Aprobar/Rechazar Ejecución
**Como** un supervisor  
**Quiero** revisar las ejecuciones enviadas por colaboradores  
**Para** aprobarlas o rechazarlas con comentarios

**Criterios de Aceptación:**
- Desde la lista de asignaciones, puedo hacer clic en "Revisar" en tareas con estado "Enviada"
- Se muestra una página de revisión con:
  - Información de la tarea y asignación
  - Todas las respuestas del colaborador
  - Botones para "Aprobar" o "Rechazar"
  - Campo de comentarios (obligatorio si se rechaza)
  - Checkbox de confirmación de firma (obligatorio)
- Si apruebo:
  - El estado cambia a "Aprobada"
  - Se guarda la fecha de aprobación
  - Se guarda el revisor (email del supervisor)
- Si rechazo:
  - El estado vuelve a "En ejecución"
  - Se agrega un registro de rechazo con comentarios y fecha
  - El colaborador puede ver los comentarios de rechazo
- Todos los cambios se guardan en localStorage

**Estado:** ✅ Implementado (ReviewPanel existe y funciona)

**Prioridad:** Alta

**Nota:** Esta US ya está implementada.

---

## FASE 3: Ejecución de Tareas (Colaborador)

### US-011: Ver Mis Tareas Asignadas
**Como** un colaborador  
**Quiero** ver las tareas que me han asignado  
**Para** saber qué trabajo debo realizar

**Criterios de Aceptación:**
- El panel de colaborador muestra una tabla con mis asignaciones
- Solo se muestran las tareas asignadas a mi email
- Cada asignación muestra:
  - Nombre de la tarea
  - Fecha de vencimiento
  - Prioridad
  - Estado
  - Botón "Iniciar" o "Continuar" según el estado
- Se puede filtrar por estado
- Las tareas vencidas se destacan visualmente
- Las tareas rechazadas muestran los comentarios del supervisor

**Estado:** ✅ Implementado (AssignmentList con filtro por email funciona)

**Prioridad:** Alta

**Nota:** Esta US ya está implementada.

---

### US-012: Ejecutar Tarea - Completar Formulario
**Como** un colaborador  
**Quiero** ejecutar una tarea completando todos sus pasos  
**Para** cumplir con mi asignación

**Criterios de Aceptación:**
- Al hacer clic en "Iniciar" o "Continuar", se abre la página de ejecución
- Se muestran todos los pasos de la tarea en orden
- Cada paso muestra su campo correspondiente según el tipo:
  - Texto: input de texto
  - Número: input numérico
  - Fecha: selector de fecha
  - Checkbox: checkbox
  - Select: dropdown
  - Foto: componente para tomar/subir foto
  - Archivo: componente para subir archivo
  - Firma: componente para firmar
- Los campos obligatorios están marcados con asterisco (*)
- Los campos condicionales solo se muestran si se cumplen las condiciones
- Se puede guardar progreso sin enviar (botón "Guardar progreso")
- Al guardar, el estado cambia a "En ejecución" si estaba "Asignada"
- Los datos se guardan en localStorage

**Estado:** ✅ Implementado (ChecklistRunner funciona correctamente)

**Prioridad:** Alta

**Nota:** Esta US ya está implementada.

---

### US-013: Validación de Campos en Ejecución
**Como** un colaborador  
**Quiero** que se validen los campos mientras completo la tarea  
**Para** saber qué campos necesito completar antes de enviar

**Criterios de Aceptación:**
- Los campos obligatorios muestran un mensaje de error si están vacíos
- Los campos numéricos validan formato y rangos (si están definidos)
- Los campos de email validan formato de email
- Los campos de fecha validan que no sean fechas pasadas (si aplica)
- El botón "Enviar para revisión" está deshabilitado hasta que todos los campos obligatorios estén completos y válidos
- Los mensajes de error son claros y específicos

**Estado:** ✅ Implementado (sistema de validación existe)

**Prioridad:** Alta

**Nota:** Esta US ya está implementada.

---

### US-014: Enviar Tarea para Revisión
**Como** un colaborador  
**Quiero** enviar mi tarea completada para revisión  
**Para** que el supervisor la revise y apruebe

**Criterios de Aceptación:**
- Solo puedo enviar si todos los campos obligatorios están completos y válidos
- Al hacer clic en "Enviar para revisión":
  - Se guarda la ejecución final en localStorage
  - El estado de la asignación cambia a "Enviada"
  - Se muestra un mensaje de confirmación
  - Se redirige a la página de resumen de la ejecución
- Una vez enviada, no puedo modificar la ejecución (solo verla)
- Si el supervisor la rechaza, puedo volver a editarla

**Estado:** ✅ Implementado (ChecklistRunner tiene funcionalidad de envío)

**Prioridad:** Alta

**Nota:** Esta US ya está implementada.

---

### US-015: Ver Historial de Ejecuciones
**Como** un colaborador  
**Quiero** ver el historial de mis ejecuciones  
**Para** revisar trabajos anteriores

**Criterios de Aceptación:**
- Existe una sección "Historial" en el panel de colaborador
- Se muestran todas las ejecuciones que he realizado
- Cada ejecución muestra:
  - Nombre de la tarea
  - Fecha de ejecución
  - Estado final (Aprobada, Rechazada, En revisión)
  - Botón "Ver detalle"
- Al hacer clic en "Ver detalle", se abre la página de resumen
- Se puede filtrar por estado o fecha

**Estado:** ⚠️ Parcialmente implementado (existe página de summary pero no hay lista de historial)

**Prioridad:** Media

---

### US-016: Ver Comentarios de Rechazo
**Como** un colaborador  
**Quiero** ver los comentarios cuando mi tarea es rechazada  
**Para** saber qué debo corregir

**Criterios de Aceptación:**
- En la lista de asignaciones, las tareas rechazadas muestran un indicador visual
- Al hacer clic en una tarea rechazada, se muestra:
  - Los comentarios del supervisor
  - La fecha del rechazo
  - El email del supervisor que rechazó
- Los comentarios son claros y visibles
- Puedo hacer clic en "Continuar" para volver a editar la tarea

**Estado:** ⚠️ Parcialmente implementado (los rechazos se guardan pero falta UI para mostrarlos)

**Prioridad:** Media

---

## FASE 4: Mejoras y Funcionalidades Adicionales

### US-017: Búsqueda y Filtros Avanzados
**Como** un supervisor o colaborador  
**Quiero** buscar y filtrar tareas/asignaciones de manera avanzada  
**Para** encontrar rápidamente lo que necesito

**Criterios de Aceptación:**
- Existe un campo de búsqueda por nombre de tarea
- Se pueden combinar múltiples filtros:
  - Por estado
  - Por prioridad
  - Por rango de fechas de vencimiento
  - Por colaborador (solo supervisor)
- Los resultados se actualizan en tiempo real mientras escribo
- Se muestra el número de resultados encontrados

**Estado:** ⚠️ Parcialmente implementado (filtro básico por estado existe)

**Prioridad:** Baja

---

### US-018: Notificaciones Visuales
**Como** un usuario del sistema  
**Quiero** ver notificaciones cuando hay cambios importantes  
**Para** estar al tanto de actualizaciones

**Criterios de Aceptación:**
- Si soy colaborador, veo un badge con el número de tareas nuevas asignadas
- Si soy supervisor, veo un badge con el número de tareas pendientes de revisión
- Las notificaciones aparecen en el navbar o menú
- Las notificaciones desaparecen cuando se leen

**Estado:** ❌ No implementado

**Prioridad:** Baja

---

### US-019: Vista de Resumen Mejorada
**Como** un supervisor o colaborador  
**Quiero** ver un resumen visual y claro de la ejecución  
**Para** entender rápidamente los resultados

**Criterios de Aceptación:**
- La página de resumen muestra los datos de forma organizada (no solo JSON)
- Cada respuesta se muestra con su pregunta/paso
- Los campos de foto se muestran como imágenes
- Los campos de archivo tienen un enlace para descargar
- Las firmas se muestran como imágenes
- Hay un diseño claro y legible

**Estado:** ⚠️ Parcialmente implementado (existe pero muestra JSON crudo)

**Prioridad:** Media

---

### US-020: Editar Asignación
**Como** un supervisor  
**Quiero** editar una asignación existente  
**Para** actualizar fecha de vencimiento, prioridad o notas

**Criterios de Aceptación:**
- Desde la lista de asignaciones, puedo hacer clic en "Editar"
- Se abre un formulario prellenado con los datos actuales
- Puedo modificar:
  - Fecha de vencimiento
  - Prioridad
  - Notas
  - Colaborador asignado (solo si la tarea no está en ejecución)
- No puedo cambiar la tarea asignada si ya hay una ejecución en progreso
- Al guardar, se actualiza en localStorage
- Se muestra confirmación de éxito

**Estado:** ❌ No implementado

**Prioridad:** Media

---

### US-021: Eliminar Asignación
**Como** un supervisor  
**Quiero** eliminar una asignación  
**Para** cancelar tareas que ya no son necesarias

**Criterios de Aceptación:**
- Desde la lista de asignaciones, puedo hacer clic en "Eliminar"
- Se muestra un diálogo de confirmación
- Solo se pueden eliminar asignaciones con estado "Asignada" o "Rechazada"
- Si la asignación tiene una ejecución en progreso o aprobada, se muestra un mensaje de error
- Al confirmar, la asignación se elimina de localStorage
- Se muestra mensaje de éxito

**Estado:** ❌ No implementado

**Prioridad:** Baja

---

## FASE 5: Integración con Backend (Para el Final)

### US-022: Reemplazar localStorage con API - Autenticación
**Como** desarrollador  
**Quiero** reemplazar el sistema de autenticación por localStorage con llamadas a la API  
**Para** integrar con el backend real

**Criterios de Aceptación:**
- El login hace una llamada POST a `/api/users/login`
- Se guarda el token recibido en localStorage
- El token se incluye en todas las peticiones siguientes
- Se manejan errores de autenticación (401, 403)
- Si el token expira, se redirige al login

**Estado:** ⚠️ Parcialmente implementado (login existe pero necesita mejor integración)

**Prioridad:** Baja (para el final del proyecto)

---

### US-023: Reemplazar localStorage con API - Tareas
**Como** desarrollador  
**Quiero** reemplazar el almacenamiento de tareas en localStorage con llamadas a la API  
**Para** integrar con el backend real

**Criterios de Aceptación:**
- Las tareas se obtienen de `GET /api/tasks`
- Crear tarea: `POST /api/tasks`
- Editar tarea: `PUT /api/tasks/:id`
- Eliminar tarea: `DELETE /api/tasks/:id`
- Se mantiene la misma estructura de datos en el frontend
- Se manejan errores de la API

**Estado:** ❌ No implementado

**Prioridad:** Baja (para el final del proyecto)

---

### US-024: Reemplazar localStorage con API - Asignaciones
**Como** desarrollador  
**Quiero** reemplazar el almacenamiento de asignaciones en localStorage con llamadas a la API  
**Para** integrar con el backend real

**Criterios de Aceptación:**
- Las asignaciones se obtienen de `GET /api/assignments`
- Crear asignación: `POST /api/assignments`
- Actualizar asignación: `PUT /api/assignments/:id`
- Eliminar asignación: `DELETE /api/assignments/:id`
- Se mantiene la misma estructura de datos en el frontend
- Se manejan errores de la API

**Estado:** ❌ No implementado

**Prioridad:** Baja (para el final del proyecto)

---

### US-025: Reemplazar localStorage con API - Ejecuciones
**Como** desarrollador  
**Quiero** reemplazar el almacenamiento de ejecuciones en localStorage con llamadas a la API  
**Para** integrar con el backend real

**Criterios de Aceptación:**
- Las ejecuciones se obtienen de `GET /api/executions`
- Guardar ejecución: `POST /api/executions`
- Actualizar ejecución: `PUT /api/executions/:id`
- Se mantiene la misma estructura de datos en el frontend
- Los archivos y fotos se suben correctamente
- Se manejan errores de la API

**Estado:** ❌ No implementado

**Prioridad:** Baja (para el final del proyecto)

---

## Resumen por Prioridad

### Alta Prioridad (Implementar Primero)
1. US-001: Login y Redirección por Rol
2. US-002: Protección de Rutas por Rol
3. US-004: Crear Nueva Tarea
4. US-005: Asignar Tarea a Colaborador ✅
5. US-009: Ver Lista de Asignaciones ✅
6. US-010: Revisar y Aprobar/Rechazar Ejecución ✅
7. US-011: Ver Mis Tareas Asignadas ✅
8. US-012: Ejecutar Tarea - Completar Formulario ✅
9. US-013: Validación de Campos en Ejecución ✅
10. US-014: Enviar Tarea para Revisión ✅

### Media Prioridad
1. US-003: Cerrar Sesión
2. US-006: Ver Lista de Tareas Creadas
3. US-007: Editar Tarea Existente
4. US-015: Ver Historial de Ejecuciones
5. US-016: Ver Comentarios de Rechazo
6. US-019: Vista de Resumen Mejorada
7. US-020: Editar Asignación

### Baja Prioridad
1. US-008: Eliminar Tarea
2. US-017: Búsqueda y Filtros Avanzados
3. US-018: Notificaciones Visuales
4. US-021: Eliminar Asignación

### Para el Final (Backend)
1. US-022 a US-025: Reemplazar localStorage con API

---

## Notas para Desarrolladores

1. **Almacenamiento**: Todas las operaciones deben guardarse en localStorage usando JSON hasta que se integre con el backend.

2. **Estructura de Datos**: 
   - Las tareas se guardan con una estructura que incluye: id, nombre, descripcion, pasos[], fechaCreacion
   - Las asignaciones incluyen: id, taskId, asignadoA, fechaVencimiento, prioridad, estado, notas, creadoPor, fechaCreacion
   - Las ejecuciones incluyen: id, assignmentId, respuestas[], timestamp, user

3. **Estados de Asignación**:
   - Asignada: Recién creada, aún no iniciada
   - En ejecución: El colaborador la está completando
   - Enviada: El colaborador la envió para revisión
   - Aprobada: El supervisor la aprobó
   - Rechazada: El supervisor la rechazó (puede volver a "En ejecución")
   - Vencida: La fecha de vencimiento pasó y no está aprobada

4. **Testing**: Cada US debe ser testeable manualmente. Los estudiantes deben poder probar cada funcionalidad de forma independiente.

5. **División de Trabajo**: Las US están diseñadas para que varios estudiantes puedan trabajar en paralelo sin conflictos mayores.

---

**Última actualización:** 2024-01-XX

