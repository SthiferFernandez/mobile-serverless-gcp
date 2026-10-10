@echo off
title Android Emulator - Pixel 7 (Google DNS)
set ANDROID_HOME=C:\Android\sdk
set ANDROID_SDK_ROOT=C:\Android\sdk
echo ==================================================
echo   Iniciando Emulador Pixel 7 con DNS 8.8.8.8
echo ==================================================
"C:\Android\sdk\emulator\emulator.exe" -avd Pixel_7 -dns-server 8.8.8.8,8.8.4.4
pause
