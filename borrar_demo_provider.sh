#!/bin/bash

# Borra el provider demo de la base de datos
mongosh "$MONGODB_URI" --eval 'db.getSiblingDB("providers").providers.deleteOne({email: "demo@demo.com"})'
echo "Provider demo eliminado." 