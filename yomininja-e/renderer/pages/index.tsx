import Layout, { LayoutProps } from '../components/Layout';
import React from 'react';
import { Home, Settings } from '@mui/icons-material';
import AppSettingsMenu from '../components/AppSettings';
import { SettingsProvider } from '../context/settings.provider';


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
      }
    ]
  };

  return (
    <Layout {...layoutProps}/>
  );
}

