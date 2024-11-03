IF EXIST ".\\.python\\win32\\x64\\python.exe" (
    .\\.python\\win32\\x64\\python.exe -m pip install -r requirements.txt
)

IF EXIST ".\\.python\\win32\\arm64\\python.exe" (
    .\\.python\\win32\\arm64\\python.exe -m pip install -r requirements.txt
)