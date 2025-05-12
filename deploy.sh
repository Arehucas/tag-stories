#!/bin/bash

# Colores
RED='\033[1;31m'
GREEN='\033[1;32m'
NC='\033[0m' # No Color

# Emojis
WARNING="⚠️"
SUCCESS="✅"
FIRE="🔥"
ROCKET="🚀"

# Comprobación de argumentos
if [ "$1" != "dev" ] && [ "$1" != "prod" ]; then
  echo -e "${RED}${WARNING} Uso incorrecto. Ejecuta: ./deploy.sh [dev|prod]${NC}"
  exit 1
fi

# Mensaje inicial
echo ""
if [ "$1" == "prod" ]; then
  echo -e "${RED}${FIRE} ¡¡¡ CUIDADO DEPLOYANDO A PRODUCCIÓN !!! ${FIRE}"
  echo -e "${RED}${ROCKET} Deploy a Producción ${ROCKET}${NC}"
else
  echo -e "${GREEN}${ROCKET} Deploy a Desarrollo ${ROCKET}${NC}"
fi

# Obtener último mensaje de commit como sugerencia
LAST_COMMIT=$(git log -1 --pretty=%B)

# Pedir mensaje con autocompletado
read -e -i "$LAST_COMMIT" -p "Nombre del commit: " COMMIT_MSG
echo ""

# Añadir cambios y hacer commit solo si hay cambios
if git diff-index --quiet HEAD --; then
  echo -e "${GREEN}No hay cambios para commitear. Se usará el último commit.${NC}"
else
  git add .
  git commit -m "$COMMIT_MSG"
fi

# Push a dev
git push origin dev

# Si es producción, merge a main
if [ "$1" == "prod" ]; then
  git checkout main
  git pull origin main
  git merge dev
  git push origin main
  git checkout dev
fi

# Mensaje final
echo ""
echo -e "${GREEN}${SUCCESS} Deploy a $1 realizado con éxito ${SUCCESS}${NC}"
echo ""