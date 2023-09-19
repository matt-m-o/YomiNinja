import { useEffect, useState } from 'react';
import { OcrResult } from '../../electron-src/@core/domain/ocr_result/ocr_result';
import { styled } from '@mui/material/styles';


const OverlayFrame = styled('div')({
  border: 'solid 2px red',
  height: '99.5vh',
  overflow: 'hidden',
});

const OcrItem = styled('div')({
  border: 'solid 1px red',
  borderRadius: '10px',  
});

export default function OcrOverlayPage() {

  const [ ocrResult, setOcrResult ] = useState< OcrResult >();

  useEffect( () => {
    document.body.style.margin = "0";
    document.body.style.padding = "0";
    document.body.style.overflow = "hidden";
    

    function handleOcrResult( _event, args: OcrResult ) {
      console.log( args );
      setOcrResult( args )
    }
    // add a listener to 'message' channel
    global.ipcRenderer.addListener('message', handleOcrResult)

    global.ipcRenderer.on( 'ocr:result', handleOcrResult );

    return () => {
      global.ipcRenderer.removeListener( 'ocr:result', handleOcrResult )
    }
  }, []);
  

  return (    
    <OverlayFrame>
      { ocrResult?.results?.map( ( item, idx ) => {
        return <OcrItem key={idx}> { item.text } </OcrItem>
      }) }      
    </OverlayFrame>
  );
}
