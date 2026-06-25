@echo off
setlocal

cls & color 0F

REM run node -v for the return value
node -v

REM Capture the exit code
set "code=%ERRORLEVEL%"


IF %code% equ 0 (
    echo Node works!!!
    echo Checking if NPM is available ...
    npm -v
    set "code=%ERRORLEVEL%"
    IF %code% equ 0 (
        echo Looking for vulnerabilities in dependencies and starting the Server ...
        pause
        npm run online %*
        goto end
    ) ELSE (
        echo NPM not installed; please install it.
        goto end
    )
) ELSE (
    choco -v
    set "code=%ERRORLEVEL%"
    IF %code% equ 0 (
        REM With versions - choco install nodejs --version="24.18.0"
        echo Installing NodeJS...
        choco install nodejs
    ) ELSE (
        echo Installing the chocolatey package manager ...
        powershell -c "irm https://community.chocolatey.org/install.ps1|iex"
        echo Installing NodeJS
        choco install nodejs
    )
)

:end
endlocal
exit /b %code%

