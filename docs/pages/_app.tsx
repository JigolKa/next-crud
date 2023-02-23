import "../styles/globals.css"
import { Inter } from "@next/font/google"
import Navbar from "../components/Navbar"
import type { AppProps } from "next/app"
import SelectedCategoryProvider from "../contexts/SelectedCategory"
import { AppShell } from "@mantine/core"
import { Analytics } from "@vercel/analytics/react"
const font = Inter({ subsets: ["latin"] })

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Analytics />
      <SelectedCategoryProvider>
        <div className={font.className}>
          {/* <AppShell
            style={{ paddingTop: 20, paddingLeft: 10 }}
            navbar={<Navbar />}
          > */}
          <Component {...pageProps} />
          {/* </AppShell> */}
        </div>
      </SelectedCategoryProvider>
    </>
  )
}
