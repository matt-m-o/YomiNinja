import { Box, Button, Card, CardContent, Container, Divider, Grid, SxProps, Theme, Typography, styled } from "@mui/material";
import { CSSProperties, ReactNode, useContext, useEffect, useState } from "react";
import { ExtensionsContext } from "../../context/extensions.provider";
import Image  from 'next/image';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ExtensionItem from "./ExtensionItem";
import AlertDialog from "../common/AlertDialog";
import { BrowserExtensionJson } from "../../../electron-src/@core/domain/browser_extension/browser_extension";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { CustomAccordion } from "../common/CustomAccordion";

const SectionDivider = styled( Divider )({
    marginTop: '30px',
    marginBottom: '30px',
});

const UL = styled( 'ul' )({
    fontSize: '1rem',
    lineHeight: 2,
    marginTop: 0,
    marginLeft: 5
});

const OL = styled( 'ol' )({
    fontSize: '1rem',
    lineHeight: 2,
    marginTop: 0,
    marginLeft: 5
});

export default function Extensions() {

    const { 
        installedExtensions,
        installExtension,
        uninstallExtension,
        openExtensionOptions,
        toggleExtension
    } = useContext( ExtensionsContext );

    const [ openUninstallDialog, setOpenUninstallDialog ] = useState< boolean >( false );
    const [ itemToUninstall, setItemToUninstall ] = useState< BrowserExtensionJson | null >();

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
                        onToggle={ toggleExtension }
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

    const accordionStyle: CSSProperties = {
        backgroundColor: '#202124'
    };
    const accordionDetailsSx: SxProps<Theme> = {
        pl: 1
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

                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }} mb={2} ml={0} mr={0}>
                            <Typography gutterBottom variant="h6" component="div" margin={0} ml={0} mb={4}>
                                Installed Chrome Extensions
                            </Typography>
                            <Button 
                                variant="outlined"
                                onClick={ installExtension }
                                startIcon={< AddRoundedIcon/> }
                                sx={{ maxHeight: '42px' }}
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

                        <Box m={1} mt={5}>
                            <CustomAccordion
                                summary={
                                    <Typography fontSize={'1.1rem'}>
                                        Important notes
                                    </Typography>
                                }
                                style={accordionStyle}
                            >
                                <UL>
                                    <li> Not all Chrome extensions are currently supported. </li>
                                    <li> Compatibility may improve in the future as Electron development progresses. </li>
                                    <li> Download extensions using {crxExtractorLink} or from {chromeStatsLink} </li>
                                    <li> Clicking on the refresh button might resolve some extension-related problems. </li>
                                </UL>
                            </CustomAccordion>

                            <CustomAccordion
                                summary={
                                    <Typography fontSize={'1.1rem'}>
                                        How to open Yomitan/Yomichan options
                                    </Typography>
                                }
                                detailsSx={{ pl: 4 }}
                                style={accordionStyle}
                            >
                                To open Yomitan/Yomichan options:
                                <OL>
                                    <li> Right-click the Yomitan icon. </li>
                                    <li> Click on <strong>Options</strong>. </li>
                                </OL>

                                For a better experience, it's recommended to enable <strong>"Hide popup on cursor exit"</strong>:

                                <OL>
                                    <li> Open Yomitan/Yomichan settings. </li>
                                    <li> Go to the <strong>Scanning</strong> section. </li>
                                    <li> Enable <strong>"Hide popup on cursor exit"</strong>. </li>
                                </OL>
                            </CustomAccordion>

                            <CustomAccordion
                                summary={
                                    <Typography fontSize={'1.1rem'}>
                                        How to open JPDBReader options and set the API key
                                    </Typography>
                                }
                                detailsSx={{ }}
                                style={accordionStyle}
                            >
                                <OL>
                                    <li> Make sure JPDB Reader is enabled. </li>
                                    <li> Click on its icon (upper-right corner). </li>
                                    <li> Click on <strong>Settings</strong>. </li>
                                    <li> Paste your JPDB.io API key into the <strong>API Token</strong> field. </li>
                                    <li> Click on <strong>Save</strong>. </li>
                                </OL>

                                <Typography fontSize={'1.1rem'}>
                                    To log into jpdb.io, you can click on the "jpdb settings page" link from the JPDBReader extension settings screen.
                                </Typography>

                            </CustomAccordion>

                        </Box>

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