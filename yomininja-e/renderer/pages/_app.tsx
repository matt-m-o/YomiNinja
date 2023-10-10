import { ThemeProvider, createTheme } from '@mui/material';
import NextApp, { AppContext } from 'next/app';
import React from 'react';
import { defaultTheme } from '../components/Theme';




export default function App({ Component, pageProps }) {
    return (
        <ThemeProvider theme={defaultTheme}>
            <Component {...pageProps} />
        </ThemeProvider>
    );
}

App.getInitialProps = async (appContext: AppContext) => {
    const appProps = await NextApp.getInitialProps(appContext);
    return {
      ...appProps,      
    };
};