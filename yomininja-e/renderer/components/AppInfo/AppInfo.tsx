import { PropsWithChildren, ReactNode, useContext, useEffect } from "react";
import { AppInfoContext, GithubReleasesLink } from "../../context/app_info.provider";
import { Box, Grid, Typography, styled } from "@mui/material";
import Image  from 'next/image';
import Link from "next/link";
import { Stick, Sirin_Stencil } from 'next/font/google'
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import patreonIcon from "../../public/logos/PATREON_SYMBOL_1_WHITE_RGB.svg";
import githubIcon from "../../public/logos/github-mark-white.svg";
import supporters from './supporters.json';

const AppNameFont = Stick({ // Stick | Sirin_Stencil
    weight: '400',
    subsets: ['latin'],
})

const AppNameFirstLetter = styled('span')({
    marginRight: -3,
});

const AboutText = styled(Typography)({
    marginTop: '0.5rem',
    marginBottom: '0.5rem',
    lineHeight: '1.9rem',
    fontSize: '1.2rem'
});

const LinkWithoutDecoration = styled(Link)({
    color: 'inherit',
    textDecoration: 'unset'
});

export default function AppInfo() {

    const {
        versionInfo,
        runUpdateCheck,
        openGithubRepoPage,
        openPatreonPage
    } = useContext( AppInfoContext );
    
    let versionText = 'Version: '+ versionInfo?.runningVersion;
    versionText +=  versionInfo?.isUpToDate ? ' (latest)' : '';

    let newVersionText: string | undefined = versionInfo?.isUpToDate ? undefined : 'Newer version available on ';    


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
                        <AboutText sx={{ mb: 0 }} >
                            {versionText}
                        </AboutText>

                        { !versionInfo?.isUpToDate &&
                            <AboutText sx={{ mt: 0 }}>
                                ✨{newVersionText} <GithubReleasesLink />
                            </AboutText>
                        }
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