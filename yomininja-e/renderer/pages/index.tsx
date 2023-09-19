import { useEffect } from 'react'
import Link from 'next/link'
import Layout from '../components/Layout';
import { OcrResult } from '../../electron-src/@core/domain/ocr_result/ocr_result';

const IndexPage = () => {
  useEffect(() => {
    const handleMessage = (_event, args) => alert(args)

    // add a listener to 'message' channel
    global.ipcRenderer.addListener('message', handleMessage)

    global.ipcRenderer.on( 'ocr:result', ( event, data: OcrResult ) => {
      console.log(data);
      // drawOverlay( data.result );
  });

    return () => {
      global.ipcRenderer.removeListener('message', handleMessage)
    }
  }, [])

  const onSayHiClick = () => {
    global.ipcRenderer.send('message', 'hi from next')
  }

  return (
    <Layout title="Home | Next.js + TypeScript + Electron Example">
      <h1>Hello Next.js 👋</h1>
      <button onClick={onSayHiClick}>Say hi to electron</button>
      <p>
        <Link href="/about">About</Link>
      </p>
    </Layout>
  )
}

export default IndexPage
