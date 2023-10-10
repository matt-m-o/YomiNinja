import React from 'react';
import { CaptureSourceProvider } from '../context/capture_source.provider';
import CaptureSourceMenu from '../components/HomeComponents/CaptureSourceMenu';
import { defaultTheme } from '../components/Theme';
import { Box, CssBaseline } from '@mui/material';



export default function CaptureSourceSelectionPage() {


  return (    
    <CaptureSourceProvider>    
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
          }}
        >
          <CssBaseline />

          <CaptureSourceMenu/>
          
        </Box>
    </CaptureSourceProvider>
  );
}