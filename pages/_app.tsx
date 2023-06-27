import { AppProps } from 'next/app'
import PreviewLayout from "../components/preview-layout";
import '../styles/index.css'

export default function MyApp({ Component, pageProps }: AppProps) {
  // return <PreviewLayout><Component {...pageProps} /></PreviewLayout>
  return <Component {...pageProps} />
}
