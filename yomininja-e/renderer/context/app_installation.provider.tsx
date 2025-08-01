import { createContext, PropsWithChildren, useEffect, useState } from "react";


interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}


export type AppInstallationContextType = {
  installButtonVisibility: boolean;
  install: () => Promise< boolean >;
};



export const AppInstallationContext = createContext( {} as AppInstallationContextType );


export const AppInstallationProvider = ( { children }: PropsWithChildren ) => {

  // This variable will save the event for later use.
  const [ deferredPrompt, setDeferredPrompt ] = useState< BeforeInstallPromptEvent | undefined >();    

  const [ installButtonVisibility, setInstallButtonVisibility ] = useState< boolean >( false );

  
  async function install() {

    if ( !deferredPrompt )
      return false;

    // Show prompt
    deferredPrompt.prompt();

    // Find out whether the user confirmed the installation or not
    const { outcome } = await deferredPrompt.userChoice;

    // The deferredPrompt can only be used once.
    setDeferredPrompt( undefined );

    // Act on the user's choice
    if ( outcome === 'accepted' ){
      console.log('User accepted the install prompt.');
      setInstallButtonVisibility(false);
      return true;
    }
    else if (outcome === 'dismissed') {
      console.log('User dismissed the install prompt');      
    }

    return false;
  }

  
  useEffect( () => {
        
    window.addEventListener( 'beforeinstallprompt', ( e ) => {

      console.log(e)

      // Prevents the default mini-infobar or install dialog from appearing on mobile
      e.preventDefault();

      // Save the event to trigger it later.
      setDeferredPrompt( e );

      setInstallButtonVisibility( true );
    });
    
  }, [] );  
  

  return (
    <AppInstallationContext.Provider
      value={{
        installButtonVisibility,
        install,
      }}
    >
      {children}
    </AppInstallationContext.Provider>
  );
}