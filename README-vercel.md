# Checklist y buenas prácticas para despliegues en Vercel (Next.js)

## 1. Tipado estricto
- **Nunca uses `any`**. Usa tipos concretos o `unknown` si no puedes tipar mejor.
- Si necesitas un tipo flexible, define un tipo o interfaz específica.

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
- [ ] No hay `any` ni variables sin tipo.
- [ ] No hay imports, variables ni funciones no usadas.
- [ ] Todos los archivos con hooks tienen `"use client";`.
- [ ] El proyecto pasa `npm run lint` y `npm run build` localmente.
- [ ] No hay reglas de ESLint desactivadas globalmente.

---

**Sigue esta guía para evitar bloqueos en despliegues y mantener la calidad del código en producción.** 