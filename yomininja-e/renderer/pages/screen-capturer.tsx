import { useContext, useEffect, useState } from "react";
import { CaptureSourceContext, CaptureSourceProvider } from '../context/capture_source.provider';


class Capturer {

    mediaStream: MediaStream;
    track: MediaStreamTrack; 
    imageCapture: ImageCapture;
    canvas: OffscreenCanvas;
    grabbingFrame: boolean = false;
    intervalBetweenFrames: number = 333; // ms

    keepStreaming: boolean = false;

    init = async (
        mediaSourceId: string,
        screenSize: { width: number, height: number }
    ) => {
        this.mediaStream = await navigator.mediaDevices.getUserMedia({
            audio: false,
            video: {
                // @ts-expect-error
                mandatory: {
                    chromeMediaSource: 'desktop',
                    chromeMediaSourceId: mediaSourceId,
                    maxWidth: screenSize.width,
                    maxHeight: screenSize.height,
                    // maxWidth: 1920,
                    // maxHeight: 1000,
                    maxFrameRate: 10,
                    // minAspectRatio: 0.1,
                    maxAspectRatio: 40
                }
            }
        });

        this.track = this.mediaStream.getVideoTracks()[0];
        this.imageCapture = new ImageCapture( this.track );
        const { width, height } = this.track.getSettings();
        this.canvas = new OffscreenCanvas( width, height );
    }
    
    grabFrame = async (): Promise< Buffer > => {

        if ( this.grabbingFrame || !this.imageCapture ) return;
        this.grabbingFrame = true;

        const { width, height } = this.track.getSettings();

        // console.time('grabFrame')
        const frame = await this.imageCapture.grabFrame();

        const context = this.canvas.getContext('2d');
        context.drawImage( frame, 0, 0, width, height );

        const blob = await new Promise<Blob>((resolve, reject) => {
            this.canvas.convertToBlob({ type: 'image/jpeg', quality: 1 })
                .then((blob) => {
                    if (!blob) reject();
                    resolve(blob);
                });
        });

        const buffer = Buffer.from( await blob.arrayBuffer() )

        this.grabbingFrame = false;

        // console.timeEnd('grabFrame')
        return buffer;
    }

    startStream = async ( resultCallBack: ( frame: Buffer ) => Promise<any>  ) => {

        this.keepStreaming = true;

        while (
            this.mediaStream !== undefined &&
            this.keepStreaming
        ) {
            // console.log({ interval: this.intervalBetweenFrames });
            await this.sleep( this.intervalBetweenFrames );
            const frame = await this.grabFrame();
            await resultCallBack( frame );
        }
    }

    stopStream = () => {
        this.mediaStream.stop();
        this.keepStreaming = false;
    }

    sleep( ms: number ) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    setIntervalBetweenFrames = ( ms: number ) => {
        this.intervalBetweenFrames = ms;
    }
}

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

    const capturer = new Capturer();

    useEffect( () => {
        refreshCaptureSources();
    }, [] );

    useEffect( () => {
        console.log({ activeCaptureSource });
        if ( !activeCaptureSource?.id ) return;

        if ( capturer.keepStreaming )
            return;

        global.ipcRenderer.invoke( 'screen_capturer:get_display_size')
            .then( displaySize => {

                const windowSize = activeCaptureSource?.window?.size;

                capturer.init( activeCaptureSource.id, windowSize || displaySize )
                    .then( async () => {

                        // This makes the render independent
                        capturer.startStream( sendFrame );

                        global.ipcRenderer.on( 'screen_capturer:set_interval', ( _, interval: number ) => {
                            capturer.setIntervalBetweenFrames( interval );
                        });

                        global.ipcRenderer.on( 'screen_capturer:grab_frame', async () => {
                
                            const frame = await capturer.grabFrame();
                            
                            if ( frame )
                                sendFrame( frame );
                        });

                        global.ipcRenderer.on( 'screen_capturer:stop_stream', async () => {
                            capturer.stopStream();
                        });

                        const interval = await global.ipcRenderer.invoke( 'screen_capturer:get_interval');
                        capturer.setIntervalBetweenFrames( interval );
                    });

            });

        
        
        return () => {
            global.ipcRenderer.removeAllListeners( 'screen_capturer:set_interval' );
            global.ipcRenderer.removeAllListeners( 'screen_capturer:grab_frame' );
        };
        

    }, [activeCaptureSource] );


    
    // function VideoElement() {
    //     return (
    //         <video
    //             ref={ (videoElement) => {
    //                 if ( !videoElement || !mediaStream )
    //                     return;
    //                 // videoElement.srcObject = mediaStream;
    //             }}
    //             autoPlay
    //             style={{
    //                 width: '100%',
    //                 height: '100%',
    //             }}
    //         />
    //     );
    // }

    async function sendFrame( frame: Buffer ) {
        await global.ipcRenderer.invoke(
            'screen_capturer:frame',
            frame
        );
    }

    // return <VideoElement/>;
    return <></>;
}