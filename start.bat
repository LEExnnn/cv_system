@echo off
chcp 65001 > nul
echo ==============================================
echo       AI 简历智能润色系统 - Windows 启动脚本
echo ==============================================
echo.
echo [1/3] 正在进入目录并检查依赖...
cd backend
call npm install
echo [2/3] 启动后端本地服务...
start "CV System Backend Server" cmd /c "chcp 65001 > nul && node server.js"
echo [3/3] 正在打开浏览器访问系统 (http://127.0.0.1:3000)...
timeout /t 3 /nobreak > nul
start http://127.0.0.1:3000
echo.
echo 系统已启动！请在自动打开的浏览器窗口中进行操作。
echo.
echo 测试步骤：
echo 1. 确认左侧聊天框可以用。
echo 2. 输入“我想修改简历”，点击发送。
echo 3. 测试大模型连通性。
echo.
echo 退出方式：直接关闭黑色控制台窗口即可。
echo.
pause
