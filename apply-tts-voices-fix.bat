@echo off

setlocal enabledelayedexpansion

REM Windows Natural Voices
REG COPY HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Speech\Voices\TokenEnums HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Speech_OneCore\Voices\TokenEnums /s /f

REM Third-party voices
for /f "tokens=*" %%A in ('REG QUERY HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Speech\Voices\Tokens') do (

    for /f "tokens=3*" %%B in ('REG QUERY "HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Speech\Voices\Tokens\%%~nxA\Attributes" /v Vendor') do (
        set "vendorValue=%%B"

        REM Check if the vendor is not Microsoft
        echo !vendorValue! | findstr /i "Microsoft" >nul
        if !errorlevel! neq 0 (
            echo Copying voice: %%~nxA
            REG COPY HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Speech\Voices\Tokens\%%~nxA HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Speech_OneCore\Voices\Tokens\%%~nxA /s /f
        )

    )

)

echo Done

endlocal
pause