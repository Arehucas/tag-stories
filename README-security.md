# Buenas Prácticas de Seguridad

## 1. Autenticación
- Todos los endpoints que acceden, modifican o exponen datos sensibles deben requerir autenticación de usuario.
- Utilizar `getServerSession()` de NextAuth para validar la sesión en cada endpoint protegido.
- Rechazar cualquier petición no autenticada con un error 401.

## 2. Autorización y Control de Acceso
- Verificar siempre que el usuario autenticado solo pueda acceder o modificar sus propios datos.
- Comparar el email de la sesión (`session.user.email`) con el recurso solicitado (por ejemplo, el email del provider).
- Rechazar cualquier intento de acceso a datos de otro usuario con un error 403.
- No confiar nunca en datos enviados por el cliente (body, query params) para identificar recursos sensibles sin validación adicional.

## 3. Exposición de Datos
- Nunca exponer datos sensibles (tokens, emails, información personal) a usuarios no autenticados o no autorizados.
- Limitar la información devuelta por los endpoints a lo estrictamente necesario.

## 4. Manejo de localStorage y almacenamiento en cliente
- No guardar nunca tokens, credenciales ni datos sensibles en `localStorage`, `sessionStorage` o cookies no seguras.
- Limitar el uso de almacenamiento local a datos no críticos y limpiar siempre tras el logout.

## 5. Pruebas y Auditoría
- Realizar pruebas automáticas y manuales para validar que los controles de autenticación y autorización funcionan correctamente.
- Usar herramientas de pentesting para detectar posibles accesos indebidos o fugas de datos.

## 6. Reglas para desarrollo y despliegue
- Revisar y aplicar estas buenas prácticas en cada nuevo endpoint o funcionalidad.
- No permitir nunca endpoints públicos que permitan acceso o modificación de datos sensibles sin control de sesión y autorización.
- Revisar periódicamente el código y dependencias para detectar vulnerabilidades.

---

**Estas reglas son obligatorias para todo el desarrollo y deben ser revisadas antes de cada despliegue.** 