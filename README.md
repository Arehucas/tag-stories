This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Overlay de Código de Color para Validación de Stories

Al generar la imagen final para compartir en Instagram Stories, se añade un overlay en la parte inferior de la imagen compuesto por:

1. **Cover genérica (gradiente):** Ocupa la parte inferior de la imagen.
2. **Logo del provider:** Esquina inferior derecha, encima del gradiente.
3. **Código de color:** 4 cuadrados pequeños en la esquina inferior izquierda, encima del gradiente y el logo.

### Detalles de los cuadrados de color
- **Cantidad:** 4
- **Tamaño:** 12px x 12px
- **Margen izquierdo:** 10px
- **Margen inferior:** 10px
- **Separación entre cuadrados:** 6px
- **Sin borde**
- **Colores:** Aleatorios, únicos y generados en cada recorte de imagen

### Propósito
Estos cuadrados actúan como un código de validación visual único para cada story, permitiendo su verificación posterior incluso tras la compresión de Instagram.

### Ubicación en el código
La lógica de pintado se encuentra en `app/ambassador/[providerId]/page.tsx`, dentro de la función `showCroppedImage`.

Puedes ajustar fácilmente el tamaño, margen o cantidad de cuadrados modificando las siguientes líneas:

```js
const squareSize = 12;
const margin = 10;
for (let i = 0; i < 4; i++) {
  const x = margin + i * (squareSize + 6);
  const y = canvas.height - squareSize - margin;
  ctx.fillStyle = `rgb(${c.r},${c.g},${c.b})`;
  ctx.fillRect(x, y, squareSize, squareSize);
}
```

## Acceso rápido para testing

- Acceso a login de providers: http://localhost:3000/providers/access
- Acceso a flujo ambassador: http://localhost:3000/ambassador/[providerId]

Reemplaza [providerId] por el id real del provider para probar el flujo completo.
