import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { OcrResult } from '../../electron-src/@core/domain/ocr_result/ocr_result';

export default function OcrOverlayPage() {

  const [ ocrResult, setOcrResult ] = useState< OcrResult >();

  useEffect( () => {

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
    <Layout title="Ocr Overlay">

      { ocrResult?.results?.map( ( item, idx ) => {
        return <div key={idx}> { item.text } </div>
      }) }
      
    </Layout>
  );
}
