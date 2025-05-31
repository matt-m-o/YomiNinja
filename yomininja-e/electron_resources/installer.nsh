!macro customInstall

    SetShellVarContext current

    RMDir /r "$APPDATA\${APP_FILENAME}\ppocr"

    RMDir /r "$APPDATA\${APP_FILENAME}\bin\py_ocr_service\python"

    ; CreateDirectory "$APPDATA\${APP_FILENAME}\bin\py_ocr_service\python"

    ; CopyFiles /FILESONLY "$INSTDIR\resources\bin\py_ocr_service\python\*" "$APPDATA\${APP_FILENAME}\bin\py_ocr_service\python"
    ; CopyFiles "$INSTDIR\resources\bin\py_ocr_service\python\Scripts\*" "$APPDATA\${APP_FILENAME}\bin\py_ocr_service\python\Scripts"
    ; CopyFiles "$INSTDIR\resources\bin\py_ocr_service\python\share\*" "$APPDATA\${APP_FILENAME}\bin\py_ocr_service\python\share"

!macroend

!macro customUnInstall

  SetShellVarContext current

  MessageBox MB_YESNO "Keep app configuration and data?" \
    /SD IDYES IDNO DeleteData IDYES KeepData

  DeleteData:
    RMDir /r "$APPDATA\${APP_FILENAME}"
    !ifdef APP_PRODUCT_FILENAME
      RMDir /r "$APPDATA\${APP_PRODUCT_FILENAME}"
    !endif
    Goto done

  KeepData:
    Goto done
    
  done:
    RMDir /r "$APPDATA\${APP_FILENAME}\ppocr"
    RMDir /r "$APPDATA\${APP_FILENAME}\bin\py_ocr_service\python"

!macroend