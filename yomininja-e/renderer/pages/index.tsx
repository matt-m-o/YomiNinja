import Layout, { LayoutProps } from '../components/Layout';
import React, { useEffect } from 'react';
import { Home, Settings } from '@mui/icons-material';
import AppSettingsMenu from '../components/AppSettings/AppSettings';
import { SettingsProvider } from '../context/settings.provider';
import { AppInfoProvider } from '../context/app_info.provider';
import AppInfo from '../components/AppInfo/AppInfo';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import HomeContent from '../components/HomeComponents/HomeContent';
import { LanguagesProvider } from '../context/languages.provider';
import { Profile } from '../../electron-src/@core/domain/profile/profile';
import { ProfileProvider } from '../context/profile.provider';
import { CaptureSourceProvider } from '../context/capture_source.provider';
import AutoStoriesRoundedIcon from '@mui/icons-material/AutoStoriesRounded';
import Dictionary from '../components/Dictionary/Dictionary';
import { DictionaryProvider } from '../context/dictionary.provider';
import { ExtensionsProvider } from '../context/extensions.provider';
import ExtensionRoundedIcon from '@mui/icons-material/ExtensionRounded';
import Extensions from '../components/Extensions/Extensions';
import { NotificationsProvider } from '../context/notifications.provider';
import ViewComfyRoundedIcon from '@mui/icons-material/ViewComfyRounded';
import OcrTemplates from "../components/OcrTemplates/OcrTemplates";
import { OcrTemplatesProvider } from '../context/ocr_templates.provider';
import { TTSProvider } from '../context/text-to-speech.provider';


export default function IndexPage() {

  const homeTabContents = (
    <CaptureSourceProvider>
      <OcrTemplatesProvider>
        <LanguagesProvider>
          <HomeContent/>
        </LanguagesProvider>
      </OcrTemplatesProvider>
    </CaptureSourceProvider>
  );
  
  const settingsTabContents = (
    <AppSettingsMenu/>    
  );

  const dictionariesTabContents = (
    <LanguagesProvider>    
      <DictionaryProvider>
        <Dictionary/>
      </DictionaryProvider>
    </LanguagesProvider>
  );

  const extensionsTabContents = (
    <Extensions/>
  );

  const ocrTemplatesTabContents = (
    <OcrTemplatesProvider>
      <CaptureSourceProvider>
        <OcrTemplates/>
      </CaptureSourceProvider>
    </OcrTemplatesProvider>
  );

  const layoutProps: LayoutProps = {
    contents: [
      {
        tabLabel: {
          text: 'Home',
          icon: <Home/>,
        },
        tabContent: homeTabContents
      },
      {
        tabLabel: {
          text: 'OCR Templates',
          icon: <ViewComfyRoundedIcon/>,
        },
        tabContent: ocrTemplatesTabContents
      },
      {
        tabLabel: {
          text: 'Extensions',
          icon: <ExtensionRoundedIcon/>,
        },
        tabContent: extensionsTabContents
      },
      {
        tabLabel: {
          text: 'Dictionaries',
          icon: <AutoStoriesRoundedIcon/>,
        },
        tabContent: dictionariesTabContents
      },
      {
        tabLabel: {
          text: 'Settings',
          icon: <Settings/>,
        },
        tabContent: settingsTabContents
      },      
      {
        tabLabel: {
          text: 'About',
          icon: <InfoRoundedIcon/>
        },
        tabContent: <AppInfo/>
      }
    ]
  };

  useEffect( () => {
    // document.addEventListener( 'contextmenu', event => {
    //     event.preventDefault();
    // });
  }, [] );

  return ( <>
    <title>YomiNinja</title>
    <ProfileProvider>
      <AppInfoProvider>
        <SettingsProvider>
          <ExtensionsProvider>
            <NotificationsProvider>
              <TTSProvider>

                <Layout {...layoutProps}/>

              </TTSProvider>
            </NotificationsProvider>
          </ExtensionsProvider>
        </SettingsProvider>
      </AppInfoProvider>
    </ProfileProvider>
  </> );
}

