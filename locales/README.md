# Guía de Internacionalización (i18n)

## ¿Cómo funciona la internacionalización en este proyecto?

- **Hook de traducción:**
  Se utiliza **exclusivamente** el hook `useT()` importado desde `@/lib/useT` para obtener la función `t`, que traduce claves a textos según el idioma activo.

  **Nunca uses `react-i18next` ni ningún otro sistema de internacionalización.** Esto es imprescindible para evitar problemas de despliegue en Vercel y mantener la coherencia del proyecto.

  **Import correcto:**
  ```js
  import { useT } from '@/lib/useT';
  ```

- **Archivos de traducción:**
  Las cadenas están en archivos como `es/common.json`, agrupadas por secciones (ejemplo: `onboarding`).

- **Uso en el código:**
  Se llama a `t('onboarding.clave')` para obtener el texto traducido.
  Para metadatos, se accede directamente a la importación: `common.metadata.onboarding.title`.

- **Estructura del JSON:**
  El archivo debe tener la siguiente estructura:

  ```json
  {
    "onboarding": {
      "title": "...",
      "name": "...",
      ...
    },
    "metadata": {
      "onboarding": {
        "title": "...",
        "description": "..."
      }
    },
    "landing_rework": {
      "testimonials": [
        { "name": "...", "role": "...", "company": "...", "text": "..." },
        ...
      ],
      "faqs": [
        { "q": "...", "a": "..." },
        ...
      ]
    }
  }
  ```

- **¿Qué pasa si falta una clave?**
  Si una clave no existe, la función `t` puede devolver la clave literal o un string vacío, según la implementación del hook.

## ¿Qué hacer para agregar o modificar textos?

1. Edita el archivo de idioma correspondiente (por ejemplo, `es/common.json`) y agrega o modifica la clave bajo la sección adecuada.
2. Usa `t('onboarding.nueva_clave')` en el código.
3. Si es para metadatos, accede como `common.metadata.onboarding.nueva_clave`.
4. Para arrays de objetos (testimonios, FAQS, etc.), accede como `common.landing_rework.testimonials` y recórrelos en el frontend.

## ¿Cómo agregar otro idioma?

1. Crea un archivo similar en `locales/xx/common.json` (donde `xx` es el código del idioma, por ejemplo, `en` para inglés).
2. Mantén la misma estructura de claves que en el archivo original.
3. El sistema de traducción debe detectar el idioma y cargar el archivo adecuado automáticamente.

## Buenas prácticas y lecciones aprendidas

- **No uses nunca `react-i18next` ni dependencias externas de i18n:**
  Solo el hook `useT` es compatible con Vercel y Next.js en este proyecto.

- **No dejes cadenas hardcodeadas en el frontend:**
  Todas las cadenas visibles deben estar en los archivos de traducción y accederse vía `t()`.

- **Evita imports innecesarios:**
  No importes archivos de traducción (`common.json`) si solo necesitas textos simples. Usa siempre el hook.

- **Escapa correctamente las comillas en JSX:**
  Usa `&quot;` en vez de comillas dobles sin escapar para evitar errores de linting (`react/no-unescaped-entities`).

- **No dejes claves no usadas:**
  Limpia los archivos de traducción eliminando claves que ya no se usan en el código.

- **Agrupa por contexto:**
  Organiza las claves por sección funcional (ej: `onboarding`, `dashboard`, `landing_rework`, etc) para facilitar el mantenimiento.

- **Evita duplicados:**
  Si un texto se repite en varias partes, usa una sola clave y reutilízala.

- **Revisa los textos en contexto:**
  Antes de dar por buena una traducción, comprueba que el texto se ve bien en la interfaz y no se corta ni desborda.

- **Mantén el README actualizado:**
  Si cambias la estructura de los archivos de traducción o la forma de internacionalizar, documenta el cambio aquí.

---

**Resumen:**
Las cadenas de texto se gestionan centralizadamente en archivos JSON, se accede a ellas mediante el hook `useT` y la estructura del JSON debe ser coherente y anidada por secciones. Esto permite escalar fácilmente a otros idiomas y mantener el código limpio y mantenible. 