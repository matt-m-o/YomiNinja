import { useContext, useEffect, useState } from "react";
import { CaptureSourceContext, CaptureSourceProvider } from '../context/capture_source.provider';
import { ipcRenderer } from "../utils/ipc-renderer";


class Capturer {
    
    mediaSourceId: string;
    mediaStream: MediaStream;
    track: MediaStreamTrack; 
    imageCapture: ImageCapture;
    canvas: OffscreenCanvas;
    grabbingFrame: boolean = false;
    intervalBetweenFrames: number = 333; // ms

    keepStreaming: boolean = false;

    createdAt: number = 0;
    frameGrabbedAt: number = Date.now();

    init = async ( input: {
        mediaSourceId: string,
        mediaSize?: { width: number, height: number },
        canvasSize?: { width: number, height: number },
        force?: boolean;
    }) => {
        const {
            mediaSourceId,
            mediaSize,
            canvasSize,
            force
        } = input;

        if ( Date.now() < this.createdAt )
            return;

        this.createdAt = Date.now();

        if ( this.mediaStream ) {

            if (
                !force &&
                this.canvas &&
                this.mediaSourceId === mediaSourceId &&
                canvasSize.width === this.canvas.width &&
                canvasSize.height === this.canvas.height
            )
                return;

            this.mediaStream.getTracks()
                .forEach( t => t.stop() );
        }

        this.mediaSourceId = mediaSourceId;

        let mandatory: any = {
            chromeMediaSource: 'desktop',
            chromeMediaSourceId: mediaSourceId,
            maxFrameRate: 10,
            cursor: "never"
        };

        if ( mediaSize ) {
            mandatory = {
                ...mandatory,
                maxWidth: mediaSize.width,
                maxHeight: mediaSize.height
            };
        }

        this.mediaStream = await navigator.mediaDevices.getUserMedia({
            audio: false,
            video: {
                // @ts-expect-error
                mandatory
            }
        });

        this.track = this.mediaStream.getVideoTracks()[0];
        this.imageCapture = new ImageCapture( this.track );
        
        if ( canvasSize ) {
            this.canvas = new OffscreenCanvas(
                canvasSize.width,
                canvasSize.height
            );
        }

        this.updatePreviewSource();
    }

    setCanvasSize = async ( width?: number, height?: number ) => {

        if ( !window && !height) {
            const { width, height } = this.track.getSettings();
            this.canvas = new OffscreenCanvas( width, height );
        }

        this.canvas = new OffscreenCanvas( width, height );
    }
    
    grabFrame = async ( format: 'jpeg' | 'png' = 'jpeg' ): Promise< Buffer | undefined > => {

        if (
            this.grabbingFrame ||
            !this.imageCapture ||
            !this.canvas
        ) return;
        
        try {

            if ( await this.autoResetCapturer() )
                return;
            
            this.grabbingFrame = true;

            // console.time('grabFrame')
            const frame = await this.imageCapture.grabFrame();

            const context = this.canvas.getContext('2d');
            context.drawImage( frame, 0, 0, frame.width, frame.height );

            const blob = await new Promise<Blob>((resolve, reject) => {
                this.canvas.convertToBlob({ type: `image/${format}`, quality: 1 })
                    .then((blob) => {
                        if (!blob) reject();
                        resolve(blob);
                    });
            });

            const buffer = Buffer.from( await blob.arrayBuffer() );

            this.grabbingFrame = false;

            this.frameGrabbedAt = Date.now();

            // console.timeEnd('grabFrame')
            return buffer;
        } catch (error) {
            console.log(error);
            await this.reset(); 
        }

        this.grabbingFrame = false;
    }

    startStream = async ( resultCallBack: ( frame: Buffer ) => Promise<any>  ) => {

        this.keepStreaming = true;

        while (
            this.mediaStream !== undefined &&
            this.keepStreaming
        ) {
            // console.log({ interval: this.intervalBetweenFrames });
            await this.sleep( this.intervalBetweenFrames );
            const frame = await this.grabFrame('jpeg');
            await resultCallBack( frame );
        }
    }

    stopStream = () => {
        this.keepStreaming = false;
    }

    sleep( ms: number ) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    setIntervalBetweenFrames = ( ms: number ) => {
        this.intervalBetweenFrames = ms;
    }

    updatePreviewSource() {
        const element = document.getElementById('video-element');

        if ( !element ) return;
        
        const videoElement = element as HTMLVideoElement;

        videoElement.srcObject = this.mediaStream;
    }

    async reset( force?: boolean ) {
        if ( !this.mediaStream ) return;

        let canvasSize: Electron.Size | undefined;

        if ( this.canvas ) {
            canvasSize = {
                width: this.canvas.width,
                height: this.canvas.height
            };
        }

        await this.init({
            mediaSourceId: this.mediaSourceId,
            canvasSize,
            force
        });
    }

    async autoResetCapturer(): Promise<boolean> {

        const idleTime = Date.now() - this.frameGrabbedAt;
        const maxIdleTime = 1000 * 60 * 60 * 2; // 2 hours;

        const streamEnded = this.track.readyState === 'ended';

        // console.log({
        //     idleTime,
        //     maxIdleTime 
        // });

        if ( this.track.readyState === 'ended' )
            console.log(`track.readyState: ${this.track.readyState}`);

        if ( idleTime < maxIdleTime && !streamEnded )
            return false;

        console.log('auto reset');

        await this.reset(true);

        return true
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

    const [ preview, setPreview ] = useState<JSX.Element | undefined >();

    const capturer = new Capturer();

    useEffect( () => {
        console.log({ activeCaptureSource });
        if ( !activeCaptureSource?.id ) return;

        if ( capturer.keepStreaming )
            return;

        capturer.init({ mediaSourceId: activeCaptureSource.id })
            .then( async () => {

                setPreview( VideoElement(capturer) );

                ipcRenderer.on( 'screen_capturer:start_stream', () => {
                    if ( capturer.keepStreaming ) return;
                    capturer.startStream( sendStreamFrame )
                        .catch(console.error);
                });

                ipcRenderer.on( 'screen_capturer:set_interval', ( _, interval: number ) => {
                    capturer.setIntervalBetweenFrames( interval );
                });

                ipcRenderer.on( 'screen_capturer:grab_frame', async () => {
                    
                    try {
                        const frame = await capturer.grabFrame('jpeg');
                        if ( frame ) {
                            sendFrame( frame )
                                .catch( console.error );
                        }
                    } catch (error) {
                        console.error(error);
                        await capturer.reset(true)
                            .catch( console.error );
                    }
                });

                ipcRenderer.on( 'screen_capturer:stop_stream', async () => {
                    capturer.stopStream();
                });

                const interval = await ipcRenderer.invoke( 'screen_capturer:get_interval');
                capturer.setIntervalBetweenFrames( interval );
            });

        
        
        return () => {
            ipcRenderer.removeAllListeners( 'screen_capturer:set_interval' );
            ipcRenderer.removeAllListeners( 'screen_capturer:grab_frame' );
        };
        

    }, [activeCaptureSource] );


    
    function VideoElement( capturer: Capturer ) {
        return (
            <video id='video-element'
                ref={ (videoElement) => {
                    if ( !videoElement || !capturer.mediaStream )
                        return;
                    videoElement.srcObject = capturer.mediaStream;
                }}
                autoPlay
                onResize={ (e) => {
                    const { videoWidth, videoHeight } = e.currentTarget;
                    capturer.init({
                        mediaSourceId: capturer.mediaSourceId,
                        canvasSize: {
                            width: videoWidth,
                            height: videoHeight
                        }
                    });
                }}
            />
        );
    }

    async function sendFrame( frame: Buffer ) {
        await ipcRenderer.invoke(
            'screen_capturer:screenshot',
            frame
        );
    }

    async function sendStreamFrame( frame: Buffer ) {
        await ipcRenderer.invoke(
            'screen_capturer:stream_frame',
            frame
        );
    }

    // return <></>;
    return <> {preview} </>;
}