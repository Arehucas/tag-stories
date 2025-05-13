# Checklist y buenas prácticas para despliegues en Vercel (Next.js)

## 1. Tipado estricto
- **Nunca uses `any`**. Usa tipos concretos o `unknown` si no puedes tipar mejor.
- Si necesitas un tipo flexible, define un tipo o interfaz específica.
- **Siempre tipa los parámetros de funciones de array** (`map`, `find`, `filter`, etc.), aunque sea con `any` o, mejor, con el tipo real si lo conoces.
- Si usas datos de red o de una API, **define interfaces o tipos** para los objetos que manipulas.

## 2. Código limpio
- **Elimina funciones, variables e imports no usados** antes de hacer commit.
- Usa el comando `npm run lint` localmente antes de subir código.

## 3. Hooks y componentes cliente
- Si usas hooks (`useEffect`, `useState`, etc.), asegúrate de que el archivo tiene la directiva `"use client";` en la primera línea.

## 4. Reglas de ESLint
- Respeta las reglas de ESLint del proyecto. Si necesitas desactivar una regla, hazlo solo en la línea o bloque necesario, nunca para todo el archivo.
- No ignores el lint salvo para pruebas urgentes. Corrige los errores antes de mergear a main.

## 5. Despliegue en Vercel
- Vercel ejecuta `npm run build` y no permitirá el despliegue si hay errores de lint o de tipos (a menos que ignores el lint en `next.config.js`).
- Para pruebas rápidas puedes usar:
  ```js
  // next.config.js
  module.exports = {
    eslint: {
      ignoreDuringBuilds: true,
    },
  };
  ```
  **Pero elimina esto antes de pasar a producción.**

## 6. Checklist antes de hacer push/merge
- [ ] No hay `any` ni variables sin tipo (o están justificados y controlados).
- [ ] No hay imports, variables ni funciones no usadas.
- [ ] Todos los archivos con hooks tienen `"use client";`.
- [ ] El proyecto pasa `npm run lint` y `npm run build` localmente.
- [ ] No hay reglas de ESLint desactivadas globalmente.
- [ ] Los parámetros de funciones de array (`map`, `find`, `filter`, etc.) están tipados.
- [ ] Los datos de red/API tienen interfaces o tipos definidos.

## 7. Endpoints API dinámicos en Next.js App Router
- Cuando crees endpoints dinámicos (por ejemplo, `/api/templates/[templateId]/route.ts`), **el segundo argumento debe ser**:
  ```ts
  export async function GET(
    req: NextRequest,
    context: { params: { [key: string]: string } }
  ) { /* ... */ }
  ```
- Accede al parámetro dinámico con `context.params.templateId`.
- **Nunca desestructures el segundo argumento en la firma** (no uses `{ params }` ni tipos concretos), ya que esto puede romper el build en Vercel y Next.js 15.
- Si ves errores como `invalid "GET" export` o problemas de tipado en despliegue, revisa la firma del handler.
- Siempre devuelve JSON en la respuesta, incluso en errores.

**Ejemplo correcto:**
```ts
export async function GET(
  req: NextRequest,
  context: { params: { [key: string]: string } }
) {
  // ...
}
```

---

**Sigue esta guía para evitar bloqueos en despliegues y mantener la calidad del código en producción.** 