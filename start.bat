@echo off
chcp 65001 > nul
echo [obs-vision] 起動中...

:: Electron アプリ起動
echo [Electron] obs-vision 起動中...
npm start
