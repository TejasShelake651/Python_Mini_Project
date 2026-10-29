@echo off
title StudySphere — AI Multi-Format Learning Studio
color 0b
echo ========================================================
echo   Starting StudySphere Server...
echo ========================================================
cd /d "%~dp0"
start http://127.0.0.1:8000
python manage.py runserver 127.0.0.1:8000
pause
