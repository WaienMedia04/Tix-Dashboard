---

### 📌 **Actualización de Memoria a Largo Plazo — 6 de julio de 2026**

#### **Migración de Google Sheets a base de datos Postgres (Neon)**
- TIX dejó de escribir en Google Sheets (`Talentix_Bitacoras_CheckOut`). Ahora
  registra cada bitácora directo en la base de datos del dashboard Talentix
  (Postgres en Neon) vía la API REST del backend, conectado por ClawLink.
- **Endpoint de escritura:** `POST https://api.talentix.com.do/worklogs`
- **Endpoint de consulta (para verificar duplicados/ausentes):**
  `GET https://api.talentix.com.do/empresas/iagil-bots-ia/bitacoras`
  (header `x-codigo-acceso: IAGIL-2026`)
- `empresaSlug` fijo: `iagil-bots-ia`. Los 6 campos de contenido, el puntaje IA
  y los estados válidos de `estadoEnvio` no cambiaron — solo cambió el destino
  de la escritura (de un array posicional de 18 columnas a un objeto JSON).
- Detalle completo del nuevo flujo en TOOLS.md y PASO 5 de SOUL.md.
- Motivo: que las bitácoras se reflejen directamente en el dashboard Talentix
  (Next.js) que consume esta misma base de datos, sin depender de Sheets como
  intermediario.

---

### 📌 **Actualización de Memoria a Largo Plazo — 6 de julio de 2026 (tarde)**

#### **Check-in (mañana) + Check-out (tarde) en el mismo día**
- El CEO pidió que TIX capture DOS momentos por día, no solo el check-out:
  1. **Check-in** por la mañana: tareas que el talento planea hacer.
  2. **Check-out** antes de las 6 PM: lo que realmente hizo (flujo de siempre).
- Ambos se guardan en la MISMA fila de `Worklog` (unique constraint
  `talentoId + fecha` en la base de datos) — el check-in la crea, el check-out
  la completa. Ya no hace falta verificar duplicados a mano.
- **Endpoint de check-in:** `POST https://api.talentix.com.do/worklogs/checkin`
  (reemplaza al viejo `POST /worklogs` para la parte de la mañana)
- **Endpoint de check-out:** `POST https://api.talentix.com.do/worklogs/checkout`
  (reemplaza al viejo `POST /worklogs` para la parte de la tarde)
- Nuevo campo `cumplimientoTareas` (0-100): TIX lo calcula en el check-out
  comparando el texto del check-in contra lo realmente ejecutado. Es distinto
  del Puntaje IA (que mide calidad del reporte, no si cumplió el plan). Si no
  hubo check-in ese día, se deja en `null` — nunca inventarlo.
- El dashboard (Next.js) ya muestra esto: columna de check-in y cumplimiento
  de tareas en la tabla de bitácoras, gauge de "% check-in enviado hoy",
  gráfico de evolución de cumplimiento en la ficha de cada empleado, y columna
  de cumplimiento de tareas en KPIs y Reportes.
- Detalle completo del nuevo flujo en TOOLS.md, y PASO 0 / PASO 4.5 de SOUL.md.
- El ranking de "empleado del mes" sigue basado en el Puntaje IA promedio
  (sin cambios) — el cumplimiento de tareas es una métrica nueva y visible,
  no reemplaza esa lógica.

---

### 📌 **Actualización de Memoria a Largo Plazo — 24 de junio de 2026**

#### **1. Protocolos y Lecciones Aprendidas**
- **Registro de bitácoras tardías:**
  - Se confirmó que las bitácoras enviadas **fuera de horario** (después de las 5:30 PM) deben registrarse con la hora real de envío, pero manteniendo la fecha del día laboral.
  - *Ejemplo:* Bitácora de Eric Vizcaino enviada a las **17:54 EDT** se registró con esa hora, no con la hora estándar de cierre.

- **Corrección de errores:**
  - Si un talento envía una bitácora **a nombre de otro** (ej: Eric por Yefferson), TIX debe:
    1. **Validar el contenido** con el nombre del remitente.
    2. **Corregir el registro** en Google Sheets (eliminar duplicado y actualizar fila).
    3. **Notificar al grupo** para evitar confusiones futuras.

- **Ausencias recurrentes:**
  - **Peter Chavez y Danny Solis** no enviaron bitácora por **segundo día consecutivo**.
  - *Acción:* Generar alerta automática al CEO para seguimiento.

---

#### **2. Métricas Clave del Día**
| **Métrica**               | **Valor**       | **Observación**                          |
|---------------------------|-----------------|------------------------------------------|
| Cumplimiento              | 75% (6/8)       | Meta: 90%.                               |
| Puntaje promedio IA       | 9.0/10          | Excelente calidad en general.           |
| Bitácoras con puntaje 10  | 1 (Eric Vizcaino)| Implementación destacada.               |
| Ausencias sin justificación| 2               | Peter Chavez y Danny Solis.              |

---

#### **3. Alertas para el CEO**
- **Prioridad alta:**
  - **Peter Chavez y Danny Solis** acumulan **2 ausencias consecutivas**.
  - *Recomendación:* Contactar para validar situación y aplicar protocolo de seguimiento.

- **Tendencias preocupantes:**
  - **Cumplimiento del 75%** (por debajo de la meta del 90%).
  - *Posible causa:* Falta de recordatorios proactivos o sobrecarga de trabajo.
  - *Solución propuesta:* Reforzar recordatorios automáticos a las **5:00 PM** y **5:20 PM**.

---

#### **4. Mejoras Implementadas en TIX**
- **Validación de identidad:**
  - Se añadió un paso de **verificación cruzada** entre el nombre del remitente y el contenido de la bitácora para evitar errores.

- **Registro de horas tardías:**
  - Las bitácoras enviadas después de las **5:30 PM** ahora se registran con la hora real, pero se marcan como *"Enviada con retraso"* en la columna **Q (Notas TIX)**.

- **Alertas automáticas:**
  - Se configuró una alerta para el CEO cuando un talento acumule **2 ausencias consecutivas**.

---

#### **5. Próximos Pasos**
- **Corto plazo:**
  - Monitorear ausencias de Peter Chavez y Danny Solis.
  - Generar reporte ejecutivo diario para el CEO con métricas y alertas.

- **Mediano plazo:**
  - Implementar un **sistema de recordatorios personalizados** para talentos con bajo cumplimiento.
  - Evaluar la posibilidad de **integrar un dashboard en tiempo real** para el CEO con métricas de cumplimiento.

---

#### **6. Observaciones Finales**
- **Calidad de las bitácoras:** Se mantuvo alta, con detalles específicos y resultados medibles.
- **Proyectos clave:**
  - *La Negra Vape Shop* (Eric Vizcaino).
  - *Dashboard TIX* (Yefferson Gonzalez).
  - *Baxter* (Brayan Pérez).
- **Oportunidad de mejora:** Reducir ausencias mediante recordatorios más frecuentes y seguimiento proactivo.

---
*Memoria actualizada por TIX — 24 de junio de 2026, 18:10 EDT.*