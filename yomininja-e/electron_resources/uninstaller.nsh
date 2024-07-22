!macro customUnInstall

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

!macroend