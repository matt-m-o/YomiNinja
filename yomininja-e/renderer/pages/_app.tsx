import NextApp, { AppContext } from 'next/app';
import React from 'react';

export default function App({ Component, pageProps }) {
    return (
        <Component {...pageProps} />
    );
}

App.getInitialProps = async (appContext: AppContext) => {
    const appProps = await NextApp.getInitialProps(appContext);
    return {
      ...appProps,      
    };
};