#!/usr/bin/env bash
# Simulador PRO - sincronizar con GitHub (Mac / Linux)
# Doble clic (Mac: renombralo a sincronizar.command) o corré: bash local/sincronizar.sh
cd "$(dirname "$0")/.."

if ! command -v git >/dev/null 2>&1; then
  echo "[ERROR] No encuentro Git. Instalalo desde https://git-scm.com"
  exit 1
fi

while true; do
  RAMA=$(git rev-parse --abbrev-ref HEAD)
  echo
  echo "============================================"
  echo "   SIMULADOR PRO - sincronizar con GitHub"
  echo "============================================"
  echo "   Rama actual: $RAMA"
  echo "--------------------------------------------"
  echo "   1) Traer lo ultimo de GitHub  (bajar)"
  echo "   2) Subir mis cambios a GitHub (subir)"
  echo "   3) Salir"
  echo "============================================"
  read -r -p "Elegi una opcion (1/2/3): " op

  case "$op" in
    1)
      echo "Trayendo cambios de GitHub..."
      git pull
      echo "Listo. Si hubo cambios, reinicia el simulador (iniciar.sh)."
      ;;
    2)
      read -r -p "Describi en pocas palabras que cambiaste: " msg
      [ -z "$msg" ] && msg="Cambios locales"
      git add -A
      if git commit -m "$msg"; then
        git push -u origin HEAD
        echo "Cambios subidos a GitHub."
      else
        echo "No habia cambios nuevos para subir."
      fi
      ;;
    3) exit 0 ;;
    *) echo "Opcion no valida." ;;
  esac
done
