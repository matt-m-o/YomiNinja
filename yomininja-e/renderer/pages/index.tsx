import Layout, { LayoutProps } from '../components/Layout';
import React from 'react';
import { Home, Settings } from '@mui/icons-material';


export default function IndexPage() {

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
        tabContent: <div> SETTINGS CONTENT </div>
      }
    ]
  };

  return (
    <Layout {...layoutProps}/>
  );
}

