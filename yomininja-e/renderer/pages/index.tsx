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


export default function IndexPage() {

  const homeTabContents = (    
    <LanguagesProvider>
      <HomeContent/>
    </LanguagesProvider>
  )
  
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
    document.addEventListener( 'contextmenu', event => {
        event.preventDefault();
    });        
  }, [] );

  return (
    <CaptureSourceProvider>
      <ProfileProvider>
        <AppInfoProvider>
          <SettingsProvider>

            <Layout {...layoutProps}/>

          </SettingsProvider>
        </AppInfoProvider>
      </ProfileProvider>
    </CaptureSourceProvider>
  );
}

