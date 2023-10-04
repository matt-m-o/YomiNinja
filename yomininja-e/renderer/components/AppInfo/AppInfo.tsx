import { useContext } from "react";
import { AppInfoContext } from "../../context/app_info.provider";
import { Box, Typography, styled } from "@mui/material";
import Image  from 'next/image';
import Link from "next/link";


const P = styled('p')({
    marginTop: '0.3rem',
    marginBottom: '0.3rem',
    fontSize: '1.2rem'
});

export default function AppInfo() {

    const { versionInfo, runUpdateCheck } = useContext( AppInfoContext );

    const logoDarkSrc = '/logos/v1-medium-size.svg';

    const size = 300;
    const width = size;
    const height = size;

    const githubReleasesPage = (
        <Link href='https://github.com/matt-m-o/YomiNinja/releases'
            style={{ color: 'white' }}
        >
            GitHub
        </Link>
    )

    return(
        <>
            <Box display='flex' flexDirection='row' justifyContent='center' padding={10}>
                <Image
                    src= {logoDarkSrc}
                    width={width}
                    height={height}
                    priority={true}
                    alt=""
                    style={{ backgroundColor: 'white', borderRadius: '100%' }}
                />

                <Box display='flex' flexDirection='column' justifyContent='center' ml={5}>

                    <Typography variant="h4" mb={1}>
                        YomiNinja
                    </Typography>                    

                    <P> Seamless text extraction right from your screen,
                    making it easy to copy text from images, videos, and games without switching applications.</P>

                    {/* <P> Perfect for language learners and anyone who values efficient text handling. </P> */}
                    <P> Dictionary look-ups with a simple hover and other features are coming soon. </P>

                    <Typography mt={2}>

                        <P>Version: {versionInfo.runningVersion}</P>
                        
                        { versionInfo.isUpToDate &&
                            <P>Running latest version</P>
                        }
                        { !versionInfo.isUpToDate &&
                            <P>Newer version available on {githubReleasesPage}</P>
                        }
                    </Typography>
                </Box>
                
            </Box>
                        
        </>
    )
}