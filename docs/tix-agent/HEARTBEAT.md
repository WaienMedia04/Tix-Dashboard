summary: "Tareas periódicas de TIX — Talentix | IAGIL"
read_when:
  - En cada heartbeat
  - Al inicio de cada sesión

# HEARTBEAT.md — Tareas Periódicas de TIX

---

## ⚡ Instrucción Principal

En cada heartbeat, revisa esta lista en orden. Ejecuta solo lo que aplique según la hora del día. Si nada requiere atención, responde `HEARTBEAT_OK`.

---

## 📋 Checklist Diario

### 🕗 A las 9:00 AM — Hora de Check-in
- [ ] Verificar si todos los talentos han enviado su check-in (tareas planificadas) en el grupo "Bitácoras de CheckOut"
- [ ] Para cada check-in recibido que aún no esté registrado → registrarlo con `POST /worklogs/checkin`
- [ ] Responder a cada uno según SOUL.md PASO 6 (una sola línea, éxito o fallo)

*(Horario ajustable por el CEO — si cambia la hora de inicio de jornada, actualizar este bloque.)*

### 🕗 A las 9:30 AM — Recordatorio de Check-in
- [ ] Revisar quién NO ha enviado check-in aún
- [ ] Si hay pendientes → enviar recordatorio en el grupo:
```
⏰ Recordatorio — Check-in del día

Aún no hemos recibido tus tareas de hoy:
• [Nombre 1]
• [Nombre 2]

Cuéntanos qué vas a hacer hoy. 🙏
```

### 🕔 A las 5:00 PM — Hora de Bitácoras (Check-out)
- [ ] Verificar si todos los talentos han enviado su bitácora de check-out en el grupo "Bitácoras de CheckOut"
- [ ] Para cada bitácora recibida que aún no esté registrada (verificar con `GET /empresas/iagil-bots-ia/bitacoras`) → procesarla, calcular `cumplimientoTareas` contra su check-in de hoy (si lo hubo) y registrarla con `POST /worklogs/checkout`
- [ ] Responder a cada uno según SOUL.md PASO 6 (una sola línea, éxito o fallo)

### 🕔 A las 5:30 PM — Recordatorio de Ausentes (Check-out)
- [ ] Revisar quién NO ha enviado bitácora aún
- [ ] Si hay ausentes → enviar recordatorio en el grupo:
```
⏰ Recordatorio — Bitácora CheckOut

Aún no hemos recibido bitácora de:
• [Nombre 1]
• [Nombre 2]

Por favor envíen su reporte. ⏰
```

### 🕔 A las 6:00 PM — Cierre del Día
- [ ] Registrar como `❌ No enviada` a todos los talentos que no enviaron bitácora de check-out
- [ ] Verificar con `GET /empresas/iagil-bots-ia/bitacoras?fechaInicio=HOY&fechaFin=HOY` que existan exactamente 8 registros para la fecha de hoy
- [ ] Si faltan registros de ausentes → crearlos con `POST /worklogs/checkout` usando `estadoEnvio: "❌ No enviada"` y `puntajeIA: 0`

### 🕐 En Cualquier Momento — Si llega un Check-in
- [ ] Detectar el mensaje en el grupo "Bitácoras de CheckOut"
- [ ] Identificar al talento (verificar que esté en la lista oficial de 8)
- [ ] Guardar el texto completo como `tareasPlanificadas`
- [ ] Registrar vía `POST https://api.talentix.com.do/worklogs/checkin`
- [ ] Responder según SOUL.md PASO 6 (una sola línea, éxito o fallo)

### 🕐 En Cualquier Momento — Si llega una Bitácora de Check-out
- [ ] Detectar el mensaje en el grupo "Bitácoras de CheckOut"
- [ ] Identificar al talento (verificar que esté en la lista oficial de 8)
- [ ] Extraer los 6 campos de contenido
- [ ] Asignar puntaje IA (0-10)
- [ ] Calcular `cumplimientoTareas` comparando contra el check-in de hoy (si existe)
- [ ] Registrar vía `POST https://api.talentix.com.do/worklogs/checkout` (ver TOOLS.md para el body exacto)
- [ ] Responder según SOUL.md PASO 6 (una sola línea, éxito o fallo)

---

## 🚨 Alertas Proactivas al CEO

Notifica al CEO (soporte) inmediatamente si:

- Un check-in o check-out **no se pudo registrar** en la API (ver SOUL.md PASO 6) — incluye talento, fecha, tipo y el error
- Un talento lleva **3 días seguidos** sin enviar bitácora
- El cumplimiento del equipo cae **por debajo del 70%** en la semana
- Un talento tiene puntaje IA **menor a 6** por 3 días consecutivos
- Un talento tiene cumplimiento de tareas **menor a 50%** por 3 días consecutivos (planifica pero no ejecuta lo que dice)
- Alguien tiene puntaje **9.5 o más** por 3 días seguidos (logro destacado)

Formato de alerta:
```
⚠️ ALERTA TIX — [tipo de alerta]
[Nombre del talento]
[Detalle específico con números]
```

---

## 📊 Reporte Semanal — Cada Lunes

El primer heartbeat del lunes genera y envía al CEO:
```
📈 REPORTE SEMANAL — Semana [X]
[Fecha inicio] al [Fecha fin]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Bitácoras recibidas: X/[total esperado]
📋 Check-ins recibidos: X/[total esperado]
❌ Ausencias: X
📋 Permisos/Licencias: X
📊 Cumplimiento de tareas promedio del equipo: X%

🏆 TOP 3 DE LA SEMANA:
#1 [Nombre] — X% cumpl. | X.X pts | X% tareas
#2 [Nombre] — X% cumpl. | X.X pts | X% tareas
#3 [Nombre] — X% cumpl. | X.X pts | X% tareas

⚠️ ATENCIÓN:
• [Alertas si las hay]
```

---

## 🔇 Cuándo NO hacer nada (HEARTBEAT_OK)

- Entre 6:00 PM y 8:00 AM (fuera de horario laboral)
- Sábados y domingos
- Si todos enviaron su bitácora y ya están registradas
- Si no hay alertas pendientes
- Si el CEO no ha solicitado ningún reporte

---

## 📝 Estado del Día (actualizar aquí)

```
Fecha: [HOY]
Check-ins registrados hoy: 0/8
Check-outs (bitácoras) registrados hoy: 0/8
Pendientes de registrar: []
Ausentes confirmados: []
Última acción: —
```

---

*HEARTBEAT de TIX — Talentix | IAGIL*
*Actualizar la sección "Estado del Día" con cada acción ejecutada*