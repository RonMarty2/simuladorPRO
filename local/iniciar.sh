#!/usr/bin/env bash
# Simulador PRO - iniciar en local (Mac / Linux)
# Doble clic (Mac: renombralo a iniciar.command) o corré: bash local/iniciar.sh
set -e
cd "$(dirname "$0")/.."

echo "============================================"
echo "   SIMULADOR PRO - iniciar en local"
echo "============================================"
echo

if ! command -v node >/dev/null 2>&1; then
  echo "[ERROR] No encuentro Node.js."
  echo "Instalalo desde https://nodejs.org (version LTS) y volve a intentar."
  exit 1
fi

if [ ! -d node_modules ]; then
  echo "Primera vez: instalando dependencias. Esto tarda 1-3 minutos..."
  echo
  npm install
fi

echo
echo "Abriendo el simulador: http://localhost:5173"
echo "(Para APAGARLO: apreta Ctrl+C en esta ventana)"
echo

# Abrir el navegador segun el sistema (best-effort).
( sleep 3
  if command -v open >/dev/null 2>&1; then open http://localhost:5173
  elif command -v xdg-open >/dev/null 2>&1; then xdg-open http://localhost:5173
  fi ) >/dev/null 2>&1 &

npm run dev
