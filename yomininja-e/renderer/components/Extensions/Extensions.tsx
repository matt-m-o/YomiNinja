import { Box, Button, Card, CardContent, Container, Divider, Grid, Typography, styled } from "@mui/material";
import { CSSProperties, useContext, useEffect, useState } from "react";
import { ExtensionsContext } from "../../context/extensions.provider";
import Image  from 'next/image';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ExtensionItem from "./ExtensionItem";
import AlertDialog from "../common/AlertDialog";
import { BrowserExtension } from "../../../electron-src/extensions/browser_extension";


const SectionDivider = styled( Divider )({
    marginTop: '30px',
    marginBottom: '30px',
});


export default function Extensions() {

    const { 
        installedExtensions,
        installExtension,
        uninstallExtension,
        openExtensionOptions,
    } = useContext( ExtensionsContext );

    const [ openUninstallDialog, setOpenUninstallDialog ] = useState< boolean >( false );
    const [ itemToUninstall, setItemToUninstall ] = useState< BrowserExtension | null >();

    function handleConfirmation() {
        uninstallExtension( itemToUninstall );
    }

    const InstalledExtensions = (
        installedExtensions?.map( item => {
            return (
                <Grid item key={item.id}>
                    <ExtensionItem
                        extension={ item }
                        openOptions={ () => openExtensionOptions( item ) }
                        uninstall={ () => {
                            setItemToUninstall( item );
                            setOpenUninstallDialog( true );
                        }}
                    />
                </Grid>
            )
        })
    );

    useEffect( () => {
        console.log(installedExtensions);
    }, [installedExtensions] );

    const linkStyle: CSSProperties = {
        // textDecoration: 'none',
        color: 'inherit',
        fontWeight: 700
    };

    const chromeStatsLink = (
        <a href="#"
            style={linkStyle}
            onClick={ () => openLink('https://chrome-stats.com/top')  }
        >
            chrome-stats.com
        </a>
    );

    const crxExtractorLink = (
        <a href="#"
            style={linkStyle}
            onClick={ () => openLink('https://chromewebstore.google.com/detail/crx-extractordownloader/ajkhmmldknmfjnmeedkbkkojgobmljda')  }
        >
            CRX Extractor/Downloader
        </a>
    );

    function openLink( link: string ) {
        global.ipcRenderer.invoke( 'open_link', link );
    }

    return (
        <Card variant="elevation" sx={{ borderRadius: 4, userSelect: 'none' }}>

            <AlertDialog
                title={'Confirm removal'}
                message="Are you sure you want to uninstall this extension?"
                okButtonText="Yes"
                cancelButtonText="No"
                open={ openUninstallDialog }
                handleCancel={ () => {
                    setOpenUninstallDialog( false );
                    setItemToUninstall( null );
                }}
                handleOk={ handleConfirmation }
                handleClose={ () => setOpenUninstallDialog( false ) }
            />

            <CardContent>
                <Container maxWidth='xl'>

                    <Box sx={{ flexGrow: 1, margin: 1, mb: 2 }}>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }} m={2} ml={0} mr={0}>
                            <Typography gutterBottom variant="h6" component="div" margin={0} ml={0} mb={4}>
                                Installed Chrome Extensions
                            </Typography>
                            <Button 
                                variant="outlined"
                                onClick={ installExtension }
                                startIcon={< AddRoundedIcon/> }
                                sx={{ maxHeight: '36px' }}
                            >
                                Install (zip)
                            </Button>
                        </Box>
                        

                        {/* <Typography gutterBottom component="div" margin={2} ml={0} mb={1}>
                            You can install Chrome web browser extensions.
                        </Typography> */}


                        <Box display='flex'
                            flexDirection='column'
                            justifyContent='center'
                            alignItems='center'
                            mb={1}
                        >
                            <Box display='flex'
                                sx={{ flexGrow: 1, margin: 1 }}
                            >
                                <Grid container display={'flex'}
                                    spacing={{ xs: 2, md: 2 }}
                                    columns={{ xs: 1, sm: 4, md: 12 }}
                                >
                                    { InstalledExtensions }

                                </Grid>
                            </Box>

                        </Box>

                        <Typography fontSize='1rem' lineHeight={2} mt='56px'>
                            Important notes:
                        </Typography>                        
                        <ul
                            style={{
                                fontSize: '1rem',                                
                                lineHeight: 2,
                                marginTop: 0,
                                marginLeft: 5
                            }}
                        >
                            <li> Not all Chrome extensions are currently supported. </li>
                            <li> Compatibility may improve in the future as Electron development progresses. </li>
                            <li> Download extensions using {crxExtractorLink} or from {chromeStatsLink} </li>
                            <li> Clicking on the refresh button might resolve some extension-related problems. </li>
                        </ul>

                    </Box>

                    <SectionDivider/>

                    <Typography gutterBottom variant="h6" component="div" margin='16px' ml={0} mb={10}>
                        Test Extensions
                    </Typography>

                    <Box display='flex' 
                        alignItems='center'
                        flexDirection='row'
                        justifyContent='space-evenly'
                        mb={10}
                        sx={{ userSelect: 'text' }}
                    >
                        <Typography gutterBottom m={0} fontSize={'1.75rem'} pr={0} lang='ja'>
                            🇯🇵 日本語
                        </Typography>
                        <Typography gutterBottom m={0} fontSize={'1.75rem'} pr={0} lang='ko'>
                            🇰🇷 한국어
                        </Typography>
                        <Typography gutterBottom m={0} fontSize={'1.75rem'} pr={0} lang='zh'>
                            🇨🇳 中文
                        </Typography>
                    </Box>

                </Container>

            </CardContent>

        </Card>
    )
}