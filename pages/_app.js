import '../styles/globals.css'
import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function App({ Component, pageProps }) {
  const router = useRouter()

  useEffect(() => {
    // basePathを考慮した背景画像のパスを設定
    const basePath = router.basePath || ''
    const backgroundImageUrl = `${basePath}/background.jpeg`
    
    document.body.style.backgroundImage = `url('${backgroundImageUrl}')`
    
    return () => {
      // クリーンアップ（必要に応じて）
    }
  }, [router.basePath])

  return <Component {...pageProps} />
}