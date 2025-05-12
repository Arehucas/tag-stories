# Buenas prácticas MongoDB + NextAuth

## Inicialización de campos custom en modelos gestionados por NextAuth

Cuando se usan adapters como MongoDBAdapter con NextAuth, **los campos custom (por ejemplo, `plan`) no se añaden automáticamente al crear un usuario**. Solo se crean los campos estándar (`name`, `email`, `image`, etc).

### ¿Qué hacer para inicializar campos custom?

- **Siempre** usa el evento `createUser` en la configuración de NextAuth para inicializar cualquier campo custom en el usuario recién creado.
- Ejemplo para el campo `plan`:

```ts
// En la configuración de NextAuth
  events: {
    async createUser({ user }) {
      const db = await (await import('@/lib/mongo')).getDb();
      await db.collection('users').updateOne(
        { _id: user.id ? new (await import('mongodb')).ObjectId(user.id) : undefined },
        { $set: { plan: 'free' } }
      );
    }
  }
```

- Si añades más campos custom en el futuro, **debes inicializarlos aquí** para garantizar que todos los usuarios nuevos los tengan.
- Para usuarios existentes, usa un script de migración para añadir el campo a todos los documentos que no lo tengan.

---

**Resumen:**
- Los campos custom no se crean automáticamente.
- Usa eventos de NextAuth para inicializarlos.
- Migra los usuarios existentes con scripts si es necesario. 