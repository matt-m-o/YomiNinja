import { ThemeProvider, createTheme } from '@mui/material';
import NextApp, { AppContext } from 'next/app';
import React from 'react';
import { defaultTheme } from '../components/Theme';
import Head from 'next/head';




export default function App({ Component, pageProps }) {
    return (<>
        <ThemeProvider theme={defaultTheme}>
            <Head>
                <link rel="manifest" href="/manifest.webmanifest" />
                <link rel="shortcut icon" href="/logos/yomininja_512x512.png" />
            </Head>
            <Component {...pageProps} />
        </ThemeProvider>
    </> );
}

App.getInitialProps = async (appContext: AppContext) => {
    const appProps = await NextApp.getInitialProps(appContext);
    return {
      ...appProps,      
    };
};