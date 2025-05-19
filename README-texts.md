# Estrategia de Textos e Internacionalización (i18n)

## Principios clave

- **Nunca dejes textos hardcodeados en el frontend.**
- **Usa siempre el hook `useT()`** importado desde `@/lib/useT` para acceder a textos traducidos.
- **Agrupa las claves por contexto funcional** en los archivos JSON de traducción (por ejemplo, `templates`, `onboarding`, `dashboard`).
- **Mantén la estructura y convenciones descritas en `locales/README.md`.**

## Ejemplo de uso correcto

```tsx
import { useT } from '@/lib/useT';

const t = useT();
return <h1>{t('templates.select_template')}</h1>;
```

## Estructura recomendada para nuevas secciones

- Usa un objeto/sección por contexto funcional:
  - `"templates"` para todo lo relacionado con plantillas
  - `"campaign"` para campañas
  - etc.
- Para textos reutilizables, usa una sola clave y reutilízala.
- Usa interpolación para nombres dinámicos: `t('templates.aria_select', { name: tpl.templateName })`

## ¿Qué hacer si necesitas un texto nuevo?

1. Añade la clave en el archivo de idioma correspondiente bajo la sección adecuada.
2. Usa el hook `useT()` para acceder a la clave.
3. Si es un texto temporal, márcalo con un comentario `// TODO: texto temporal` y elimina cuando no sea necesario.

## Consistencia con otras normas

- **locales/README.md** es la referencia principal para la estrategia de i18n.
- No dupliques reglas, pero sí enlaza o referencia ese archivo si es necesario.
- Si cambias la estructura de los textos, **actualiza ambos README**.

## Buenas prácticas adicionales

- No dejes claves no usadas en los archivos de traducción.
- Revisa los textos en contexto visual antes de dar por buena una traducción.
- Mantén los textos cortos y claros para evitar desbordes en la UI.

---

**Resumen:**
Todos los textos deben estar centralizados en los archivos de traducción, accederse mediante el hook `useT` y organizarse por contexto funcional. Consulta siempre `locales/README.md` para detalles y actualiza este README si cambias la estrategia. 