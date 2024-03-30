import { Box } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { CaptureSourceContext, CaptureSourceProvider } from '../context/capture_source.provider';


export default function ScreenCapturer() {

    return <>
        <CaptureSourceProvider>
            <ScreenCapturerElement/>
        </CaptureSourceProvider>
    </>
}

function ScreenCapturerElement() {
    const {
        activeCaptureSource,
        refreshCaptureSources
    } = useContext( CaptureSourceContext );

    const [ mediaStream, setMediaStream ] = useState<MediaStream>();
    const [ imageCapture, setImageCapture ] = useState<ImageCapture>();

    useEffect( () => {
        refreshCaptureSources();
    }, [] );

    useEffect( () => {
        console.log({ activeCaptureSource });
        if ( !activeCaptureSource ) return;

        getMediaStream({ mediaSourceId: activeCaptureSource.id, maxWidth: 960 })
            .then( stream => {
                if ( !stream ) return;
                setMediaStream( stream );
                // const imageCapture = new ImageCapture( stream.getVideoTracks()[0]);
                // setImageCapture(imageCapture);
                capture( stream );
            });

    }, [activeCaptureSource] );

    async function getMediaStream( input: { mediaSourceId: string, maxWidth: number }): Promise<MediaStream> {

        const stream = await navigator.mediaDevices.getUserMedia({
                audio: false,
                video: {
                    // @ts-expect-error
                    mandatory: {
                        chromeMediaSource: 'desktop',
                        chromeMediaSourceId: input.mediaSourceId,
                        // maxWidth: input.maxWidth,
                        maxFrameRate: 10,
                    }
                }
            });

        return stream;
    }

    function VideoElement() {
        return (
            <video
                ref={ (videoElement) => {
                    if ( !videoElement || !mediaStream )
                        return;
                    // videoElement.srcObject = mediaStream;
                }}
                autoPlay
                style={{
                    width: '100%',
                    height: '100%',
                }}
            />
        );
    }


    const capture = async ( stream: MediaStream ) => {

        if ( !stream ) return;

        const videoTrack = stream.getVideoTracks()[0]; // Assuming there's only one video track
        const { width, height } = videoTrack.getSettings();
        const imageCapture = new ImageCapture( videoTrack );

        async function sleep(ms) {
            return new Promise((resolve) => setTimeout(resolve, ms));
        }

        let offscreenCanvas = new OffscreenCanvas(width, height);
        
        const task = async ( offscreenCanvas: OffscreenCanvas ) => {
            // console.time('task')
            const frame = await imageCapture.grabFrame();

            const context = offscreenCanvas.getContext('2d');
            context.drawImage(frame, 0, 0, width, height);

            const blob = await new Promise<Blob>((resolve, reject) => {
                offscreenCanvas.convertToBlob({ type: 'image/jpeg', quality: 1 }).then((blob) => {
                    if (!blob) reject();
                    resolve(blob);
                });
            });

            const buffer = Buffer.from( await blob.arrayBuffer() );

            await global.ipcRenderer.invoke(
                'screen_capturer:frame',
                buffer
            );
            // console.timeEnd('task')
            
        }

        // setInterval( task, 250);

        while ( true ) {
            await sleep(300); // 250
            console.time('while task')
            await task( offscreenCanvas );
            console.timeEnd('while task')
        }
    }


    return <VideoElement/>;
}