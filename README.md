# SALUS Psicométrico

Web App Progresiva (SPA) para gestión, aplicación y automatización de pruebas
psicométricas y clínicas. Next.js (App Router, export estático) + Tailwind CSS
+ Firebase (Auth, Firestore, Hosting).

## Estructura del proyecto

```
app/
  (evaluador)/          Rutas protegidas del evaluador (requieren sesión)
    dashboard/           Tarjetas de resumen
    pacientes/           Gestión de expedientes
    asignaciones/        Asignar pruebas (remoto/tablet) y ver reportes
    observacion/         Registro clínico directo (ADOS-2, etc.)
    configuracion/       PIN de seguridad del kiosco + vincular tablet
  kiosko/                Modo Tablet / Consultorio (bloqueo por PIN)
  remoto/                Vista del paciente por enlace único (sin login)
  login/                 Acceso del evaluador

components/
  kiosk/                 KioskLock (candado por PIN), PinPad, TestRunner,
                         QuestionRenderer
  ui/                    Button, Card, RiskBadge (semáforo de riesgo)

lib/
  types.ts               Modelos de datos de Firestore
  firebase.ts             Inicialización del SDK (con caché offline)
  scoring/engine.ts        Motor de cálculo y cruce con baremos
  assessments.ts, patients.ts, catalog.ts, results.ts   Acceso a Firestore
  pin.ts, kiosk.ts, auth.ts, useAuth.ts                 PIN, sesión, kiosco

scripts/seed.ts           Carga el catálogo de pruebas y baremos de ejemplo
firestore.rules / firestore.indexes.json / firebase.json
```

## Esquema de Firestore

- `users`: perfil del evaluador (rol, PIN hasheado del kiosco).
- `patients`: expedientes de pacientes.
- `tests`: catálogo de pruebas (preguntas, algoritmo de cálculo, tipo
  `autoinforme` u `observacion`).
- `normative_tables`: baremos (edad, sexo → percentil/escalar).
- `assessments`: asignaciones (token de acceso, respuestas, estado).
- `results`: resultados calculados (puntuaciones, percentiles, nivel de riesgo).

Las pruebas de tipo `observacion` (ADOS-2, etc.) **nunca** se listan en el
catálogo que consumen el Modo Kiosco o el enlace remoto — el filtro se aplica
tanto en la consulta a Firestore (`lib/catalog.ts`) como en un segundo
blindaje al cargar la evaluación (`app/kiosko/prueba`, `app/remoto`).

## 1. Configurar el proyecto de Firebase

1. Crea un proyecto en https://console.firebase.google.com
2. Habilita **Authentication** → método Correo/Contraseña, y crea un usuario
   evaluador de prueba.
3. Habilita **Firestore Database** (modo producción, la región que prefieras).
4. En **Configuración del proyecto → Tus apps**, crea una app Web y copia la
   configuración a un archivo `.env.local` (usa `.env.example` como plantilla).
5. Tras crear el usuario en Authentication, crea manualmente su documento en
   Firestore `users/{uid}` (o hazlo desde la app) con:
   ```json
   { "uid": "...", "email": "...", "nombre": "...", "rol": "evaluador",
     "pinSeguridad": "", "pinSalt": "", "creadoEn": "..." }
   ```
   El PIN del kiosco se configura después desde **Configuración** dentro de
   la app (se guarda hasheado, nunca en texto plano).

## 2. Instalar y ejecutar en local

```bash
npm install
npm run dev
```

## 3. Cargar el catálogo de pruebas (seed)

```bash
# Descarga una clave de cuenta de servicio: Configuración del proyecto >
# Cuentas de servicio > Generar nueva clave privada
export GOOGLE_APPLICATION_CREDENTIALS=./service-account.json
npm run seed
```

Esto crea el catálogo (PHQ-9 y GAD-7 completos; el resto de instrumentos con
su estructura y preguntas de ejemplo — ver comentarios en `scripts/seed.ts`
sobre reactivos con derechos reservados que deben licenciarse antes de uso
clínico real) y una tabla de baremo de ejemplo.

## 4. Desplegar en Firebase Hosting

```bash
npm install -g firebase-tools   # si no lo tienes
firebase login
firebase use --add              # selecciona tu proyecto y actualiza .firebaserc

npm run build                   # genera la carpeta out/ (export estático)
firebase deploy --only hosting,firestore:rules,firestore:indexes
```

La app quedará publicada en `https://<tu-proyecto>.web.app`.

Para reglas de Firestore: revisa `firestore.rules` antes de desplegar a
producción. El acceso sin sesión (Modo Kiosco / enlace remoto) se resuelve
por el ID del documento `assessments/{id}`, que se genera como un token largo
e impredecible (`lib/tokens.ts`) — quien no conoce ese ID no puede leerlo ni
listarlo.

## 5. Modo Kiosco / Tablet

1. El evaluador inicia sesión en la tablet una sola vez y entra a
   **Configuración → Configurar esta tablet**. Esto vincula el dispositivo a
   su cuenta (para validar el PIN) y bloquea la navegación.
2. Desde **Evaluaciones**, el evaluador asigna una prueba con modalidad
   "Modo Tablet / Consultorio" al paciente.
3. En la tablet, `/kiosko/` lista las evaluaciones pendientes; al tocar
   "Iniciar" se abre `/kiosko/prueba/?id=...` en pantalla completa.
4. Al terminar la prueba, la tablet se bloquea automáticamente mostrando
   "Evaluación completada con éxito" y solicita el PIN de 4 dígitos del
   evaluador para desbloquearse — el paciente no puede ver resultados ni
   navegar a otro expediente.

## Notas de seguridad

- El PIN del kiosco se guarda como `SHA-256(salt:pin)`, nunca en texto plano.
- El progreso de las respuestas se guarda de inmediato en Firestore
  (`lib/assessments.ts` → `guardarRespuesta`), y el cliente usa caché local
  persistente (`persistentLocalCache`) para no perder datos si la tablet
  pierde conexión a media prueba.
- Ningún dato clínico se guarda en `localStorage`; el único estado local es
  el candado de navegación del kiosco (`sessionStorage`, sin datos sensibles).
