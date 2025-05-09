@echo off
echo -----------------------------
echo       NOTEXT INDÍTÁSA
echo -----------------------------

:: Backend indítása külön ablakban
start "" cmd /k "cd backend && node server.js"

:: Várunk 2 másodpercet
timeout /t 2 >nul

:: Frontend indítása külön ablakban
start "" cmd /k "cd frontend && npx serve ."

echo -----------------------------
echo KÉSZ! Backend és frontend elindult.
pause >nul
