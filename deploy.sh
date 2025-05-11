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

# Pedir mensaje de commit
read -p "Nombre del commit: " COMMIT_MSG
echo ""

# Commit en rama actual (dev)
git add .
git commit -m "$COMMIT_MSG"
git push origin dev

# Si es a producción, hacer merge
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