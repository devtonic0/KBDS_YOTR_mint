import "@/styles/globals.css"
import type { AppProps } from "next/app"
import dynamic from "next/dynamic"
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const WalletProvider = dynamic(() => import("@/components/WalletProvider"), {
  ssr: false,
})

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div>
    <WalletProvider>
      
      <Component {...pageProps} />
     
    </WalletProvider>
    <ToastContainer />
    </div>
  )
}
