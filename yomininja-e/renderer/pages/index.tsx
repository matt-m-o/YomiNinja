import Layout, { LayoutProps } from '../components/Layout';
import React from 'react';
import { Home, Settings } from '@mui/icons-material';
import AppSettingsMenu from '../components/AppSettings/AppSettings';
import { SettingsProvider } from '../context/settings.provider';
import { AppInfoProvider } from '../context/app_info.provider';
import AppInfo from '../components/AppInfo/AppInfo';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';

export default function IndexPage() {


  const settingsTabContents = (
    <SettingsProvider>
      <AppSettingsMenu/>
    </SettingsProvider>
  )

  const layoutProps: LayoutProps = {
    contents: [
      {
        tabLabel: {
          text: 'Home',
          icon: <Home/>,
        },
        tabContent: <div> HOME CONTENT </div>
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
    <AppInfoProvider>
      <Layout {...layoutProps}/>
    </AppInfoProvider>
  );
}

