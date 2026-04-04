@echo off
chcp 65001 > nul
echo [obs-vision] 起動中...

:: Ollama サービス起動
tasklist /fi "imagename eq ollama.exe" 2>nul | find /i "ollama.exe" > nul
if errorlevel 1 (
    echo [Ollama] 起動中...
    start /min "" "C:\Users\akuta\AppData\Local\Programs\Ollama\ollama.exe" serve
    timeout /t 3 /nobreak > nul
) else (
    echo [Ollama] 起動済み
)

:: Electron アプリ起動
echo [Electron] obs-vision 起動中...
npm start
