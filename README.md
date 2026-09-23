# Control de Faltas

App para administrar los registros de faltas de alumnos: cuando un alumno no entra a clase, se registra la fecha, la hora/periodo, la materia, el maestro, el alumno y la razón (si la hay). Funciona en Android, iOS y web desde un solo código, construida con **React Native + Expo** (TypeScript) y **Supabase** como backend.

## ¿Cómo funciona?

1. **Inicio de sesión**: cada maestro entra con su correo y contraseña (Supabase Auth). No hace falta confirmar el correo — al registrarse, se entra de inmediato.
2. **Catálogos**: antes de registrar faltas hay que cargar, al menos una vez, las listas de:
   - **Maestros**
   - **Materias**
   - **Alumnos** (con grado/grupo opcional)
   - **Horarios/periodos** (ej. "1ra hora", "2da hora"...)

   Cualquier usuario que haya iniciado sesión puede agregar o eliminar elementos de estos catálogos desde la pestaña **Catálogos**.
3. **Registrar una falta**: en la pestaña **Nueva falta** se elige la fecha (con atajos "Hoy"/"Ayer"), y se seleccionan de una lista desplegable la hora, la materia, el maestro y el alumno. La razón es opcional (texto libre, ej. "cita médica", "permiso", o se deja vacío si no hay razón). Al guardar, el formulario se limpia para poder registrar varias faltas seguidas sin regresar a la pantalla principal.
4. **Ver faltas registradas**: en la pestaña **Faltas** (pantalla principal) se ve la lista de faltas más recientes primero, con filtros rápidos por "Hoy", "Esta semana" o "Todas", y una búsqueda por nombre de alumno o maestro.
5. **Perfil**: muestra el correo de la sesión activa y permite cerrar sesión.

Todos los datos se guardan en la nube (Supabase), así que se comparten automáticamente entre todos los dispositivos donde inicien sesión los maestros.

## Estructura del proyecto

```
src/
├── app/                    # Pantallas y navegación (expo-router, ruteo por archivos)
│   ├── (auth)/              # Login y registro (sin sesión)
│   └── (tabs)/              # Faltas, Nueva falta, Catálogos, Perfil (con sesión)
├── lib/supabase.ts          # Cliente de Supabase
├── types/database.ts        # Tipos que reflejan el esquema de la base de datos
├── providers/AuthProvider.tsx
├── services/                # Lógica de acceso a datos (catálogos y faltas)
├── components/              # Piezas de UI reutilizables (selects, listas, formularios)
└── hooks/useAuth.ts

supabase/schema.sql          # Script SQL con las tablas y permisos (RLS) de Supabase
```

## Configuración inicial

### 1. Crear el proyecto en Supabase

1. Crea una cuenta/proyecto gratuito en [supabase.com](https://supabase.com).
2. En **Authentication → Providers → Email**, desactiva la opción **"Confirm email"** (para que los maestros puedan entrar de inmediato tras registrarse).
3. Abre el **SQL Editor** del proyecto y ejecuta el contenido completo de [`supabase/schema.sql`](supabase/schema.sql). Esto crea las tablas (`teachers`, `subjects`, `students`, `class_periods`, `attendance_records`) y los permisos de acceso.
4. En **Settings → API**, copia el **Project URL** y la **anon public key**.

### 2. Configurar las variables de entorno

Copia `.env.example` a `.env` y pega ahí los valores del paso anterior:

```bash
cp .env.example .env
```

```
EXPO_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
```

El archivo `.env` no se sube al repositorio (está en `.gitignore`).

### 3. Instalar dependencias

```bash
npm install
```

## Cómo correr la app

```bash
# Web (navegador)
npx expo start --web

# Android / iOS con Expo Go (escanear el código QR con el celular)
npx expo start
```

Para compilar la app de forma nativa (fuera de Expo Go) se usa EAS Build — ver [documentación de Expo](https://docs.expo.dev/eas/index.md).

## Primer uso

1. Abre la app y crea una cuenta (correo + contraseña).
2. Ve a **Catálogos** y agrega al menos un maestro, una materia, un alumno y un horario.
3. Ve a **Nueva falta**, llena el formulario y guarda.
4. Ve a **Faltas** para ver el registro recién creado.

## Fuera de alcance (por ahora)

- Notificaciones push
- Sincronización sin conexión a internet (offline)
- Exportar reportes a CSV/Excel
- Roles de administrador (por ahora cualquier usuario puede editar todo)
