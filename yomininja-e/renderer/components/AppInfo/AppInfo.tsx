import { PropsWithChildren, ReactNode, useContext, useEffect, useState } from "react";
import { AppInfoContext, GithubReleasesLink } from "../../context/app_info.provider";
import { Box, Fade, Grid, Modal, Paper, Popover, Popper, PopperPlacementType, Typography, styled } from "@mui/material";
import Image  from 'next/image';
import Link from "next/link";
// import { Stick, Sirin_Stencil } from 'next/font/google'
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import patreonIcon from "../../public/logos/PATREON_SYMBOL_1_WHITE_RGB.svg";
import githubIcon from "../../public/logos/github-mark-white.svg";
import supporters from './supporters.json';
import React from "react";
import Backdrop from '@mui/material/Backdrop';


// const AppNameFont = Stick({ // Stick | Sirin_Stencil
//     weight: '400',
//     subsets: ['latin'],
//     display: 'swap'
// })

const AppNameFirstLetter = styled('span')({
    marginRight: -3,
});

const AboutText = styled(Typography)({
    marginTop: '0.5rem',
    marginBottom: '0.5rem',
    lineHeight: '1.9rem',
    fontSize: '1.2rem',
    position: 'relative',
});

const LinkWithoutDecoration = styled(Link)({
    color: 'inherit',
    textDecoration: 'unset'
});

export default function AppInfo() {

    const {
        versionInfo,
        systemInfo,
        runUpdateCheck,
        openGithubRepoPage,
        openPatreonPage
    } = useContext( AppInfoContext );
    
    let versionText = 'Version: '+ versionInfo?.runningVersion;
    versionText +=  versionInfo?.isUpToDate ? ' (latest)' : '';

    let newVersionText: string | undefined = versionInfo?.isUpToDate ? undefined : 'Newer version available on ';    

    let systemPlatform = systemInfo.platform;

    if ( systemInfo.platform === 'darwin' )
        systemPlatform += ` (macOS)`;
    else if ( systemInfo.platform === 'win32' )
        systemPlatform += ` (Windows)`;

    const AppName = ( props ) => (
        <Typography variant="h4" mb={1} {...props}>
            YomiNinja
        </Typography>
    );

    useEffect( () => {
        runUpdateCheck();        
    }, []);

    const IconWithLink = ( props: { onClick: () => void, children: ReactNode } ) => (
        <LinkWithoutDecoration href='#' onClick={ props.onClick }>
            <Box display='flex' flexDirection='column' alignItems='center'>
                { props.children }
            </Box>
        </LinkWithoutDecoration>
    );

    const [ openInfoDetails, setOpenInfoDetails ] = useState(false);
    const handleOpenInfoDetails = () => setOpenInfoDetails(true);
    const handleCloseInfoDetails = () => setOpenInfoDetails(false);

    const infoDetails = (
        <Modal
            aria-labelledby="transition-modal-title"
            aria-describedby="transition-modal-description"
            open={openInfoDetails}
            onClose={handleCloseInfoDetails}
            closeAfterTransition
            slots={{ backdrop: Backdrop }}
            slotProps={{
                backdrop: {
                    timeout: 500,
                },
            }}
        >
            <Fade in={openInfoDetails}>
                <Box
                    sx={{
                        position: 'absolute' as 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: 500,
                        bgcolor: 'background.paper',
                        border: '0px solid #000',
                        outline: 'solid black',
                        // boxShadow: 24,
                        p: 4,
                    }}
                >
                    <Typography id="transition-modal-title" variant="h6" component="h2">
                        App and System Information
                    </Typography>
                        <Typography sx={{ p: 2 }}>
                            <Typography sx={{ pb: 1 }}>
                                <strong>App Version: </strong>
                                {versionInfo?.runningVersion}
                            </Typography>
                            <Typography sx={{ pb: 1 }}>
                                <strong>App Arch: </strong>
                                {systemInfo.appArch}
                            </Typography>

                            <Typography sx={{ pb: 1 }}>
                                <strong>OS Platform: </strong>
                                { systemPlatform } 
                            </Typography>

                            <Typography sx={{ pb: 1 }}>
                                <strong>OS Version: </strong>
                                { systemInfo.osVersion } 
                            </Typography>

                            { systemInfo.windowSystem &&
                                <Typography sx={{ pb: 1 }}>
                                    <strong>Window System: </strong>
                                    { systemInfo.windowSystem } 
                                </Typography>
                            }

                            { systemInfo.desktopEnvironment &&
                                <Typography sx={{ pb: 1 }}>
                                    <strong>Desktop Environment: </strong>
                                    { systemInfo.desktopEnvironment } 
                                </Typography>
                            }

                            <Typography sx={{ pb: 1 }}>
                                <strong>CPU: </strong>
                                {systemInfo.cpuModel.trim() + ` (${systemInfo.cpuArch})` } 
                            </Typography>
                            
                        </Typography>
                </Box>
            </Fade>
        </Modal>
    )

    

    return(
        <>
            <Box display='flex' flexDirection='column' justifyContent='center' 
                m='auto'
                pl={5}
                pr={5}
                pt={0}
                maxWidth='1600px'
                sx={{ userSelect: 'none' }}
            >

                <Box display='flex' flexDirection='column' justifyContent='center' mb={6}>

                    <Box>
                        <AppName/>
                        <AboutText
                            aria-owns={openInfoDetails ? 'mouse-over-popover' : undefined}
                            aria-haspopup="true"
                            title="Click for more information"
                            onClick={ handleOpenInfoDetails }
                            sx={{
                                mb: 0,
                                textDecoration: 'underline',
                                ':hover': {
                                    cursor: 'pointer',
                                }
                            }}
                        >
                            {versionText}
                        </AboutText>

                        { !versionInfo?.isUpToDate &&
                            <AboutText sx={{ mt: 0 }}>
                                ✨{newVersionText} <GithubReleasesLink />
                            </AboutText>
                        }

                        {infoDetails}
                    </Box>

                    <Box mt={2}>

                        <AboutText> 
                            YomiNinja is an application for extracting text from any type of visual content.
                            making it easy to copy text from images, videos, and games without switching applications or devices.
                        </AboutText>

                        <AboutText> The built-in popup dictionary makes it perfect for language learners. </AboutText>                                            
                        
                    </Box>

                    <AboutText sx={{ fontSize: '1.35rem', mt: '2rem', lineHeight: '2.1rem' }}>
                        If you enjoy the project and would like to contribute to its growth,
                        check out the Patreon page.<br/>
                        You can have access to the latest features and bug fixes before the public release.
                    </AboutText>
                  
                </Box>                
                
                
                <Grid container justifyContent="center" 
                    spacing={{ xs: 20, md: 40 }}
                    columns={{ xs: 1, sm: 2}}
                    flexGrow={1}
                >

                    <Grid item>
                        <IconWithLink onClick={ openPatreonPage }>
                            <Image
                                // priority // for some reason this breaks the window title
                                src={patreonIcon}                            
                                alt="Support the project on Patreon"
                                height={60}
                            />
                            <Typography mt={2} textAlign='center'
                                fontSize={'1.25rem'}
                                fontWeight={600}
                            >
                                Patreon page
                            </Typography>
                        </IconWithLink>
                    </Grid>
                    
                    
                    <Grid item>
                        <IconWithLink onClick={ openGithubRepoPage }>
                            <Image
                                // priority // for some reason this breaks the window title
                                src={githubIcon}
                                alt="GitHub repository"
                                height={60}                            
                                />
                            <Typography mt={2} textAlign='center'
                                fontWeight={600}
                                fontSize={'1.25rem'}
                                >
                                GitHub repository
                            </Typography>                                                        
                        </IconWithLink>
                    </Grid>

                </Grid>

                <Typography variant="h4" mb={2} mt={7}>
                    Supporters
                </Typography>
                
                <Grid container spacing={1} columns={16}>                
                    { supporters.map( ( supporter, idx ) => (
                        <Grid item key={idx} xl={4} md={4} sm={8} xs={16}>
                            <Typography variant="h5"
                                // sx={{ textTransform: 'capitalize' }}
                            >
                                { supporter }
                            </Typography>
                        </Grid>
                    )) }
                </Grid>
                
            </Box>
                        
        </>
    )
}