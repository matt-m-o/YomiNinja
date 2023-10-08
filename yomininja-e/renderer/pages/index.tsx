import Layout, { LayoutProps } from '../components/Layout';
import React from 'react';
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

export default function IndexPage() {

  const settingsTabContents = (
    <AppSettingsMenu/>    
  );

  const homeTabContents = (    
    <LanguagesProvider>
      <HomeContent/>
    </LanguagesProvider>
  )

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

