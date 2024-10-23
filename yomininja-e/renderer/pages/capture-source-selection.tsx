import React from 'react';
import { CaptureSourceProvider } from '../context/capture_source.provider';
import CaptureSourceMenu from '../components/HomeComponents/CaptureSourceMenu';
import { defaultTheme } from '../components/Theme';
import { Box, CssBaseline } from '@mui/material';
import { AppInfoProvider } from '../context/app_info.provider';



export default function CaptureSourceSelectionPage() {


  return (
    <CaptureSourceProvider>
      <AppInfoProvider>
        <Box
          component="main"
          sx={{
            backgroundColor: (theme) =>
              theme.palette.mode === 'light'
                ? theme.palette.grey[100]
                : theme.palette.grey[900],
            flexGrow: 1,          
            height: '100vh',
            overflow: 'auto',
            m: 0,
            colorScheme:  ( theme ) => theme.palette.mode
          }}
        >
          <CssBaseline />

          <CaptureSourceMenu/>
          
        </Box>
      </AppInfoProvider>
    </CaptureSourceProvider>
  );
}