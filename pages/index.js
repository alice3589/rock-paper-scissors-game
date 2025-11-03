import { useRouter } from 'next/router'
import styles from '../styles/Home.module.css'

export default function Home() {
  const router = useRouter()
  return (
    <div className={styles.container}>
      <div className={styles.main}>
        <h1 className={styles.title}>ジャンケンゲーム</h1>
        <p className={styles.description}>カメラを使って手でジャンケンできるゲーム</p>
        <div className={styles.buttonContainer}>
          <button className={styles.button} onClick={() => router.push('/game')}>ゲーム開始</button>
        </div>
        <div className={styles.infoBox}>
          <h3>ゲームの遊び方</h3>
          <ul>
            <li>3本勝負でジャンケン</li>
            <li>カメラを起動し、手がしっかり映る位置に座ってください</li>
            <li>カメラに向けて手を挙げてグー、パー、チョキを出してください</li>
            <li>手の形をしっかり認識できるようにしてください</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
