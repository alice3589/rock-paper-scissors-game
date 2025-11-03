import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/router'
import * as tmImage from '@teachablemachine/image'

export default function Practice() {
  const router = useRouter()
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [model, setModel] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [prediction, setPrediction] = useState(null)
  const [isPredicting, setIsPredicting] = useState(false)

  useEffect(() => {
    init()
    return () => {
      if (videoRef.current) {
        const stream = videoRef.current.srcObject
        if (stream) {
          stream.getTracks().forEach(track => track.stop())
        }
      }
    }
  }, [])

  const init = async () => {
    try {
      // Next.jsのbasePathを取得（GitHub Pages対応）
      const basePath = router.basePath || ''
      const URL = `${basePath}/model`
      const modelURL = URL + '/model.json'
      const metadataURL = URL + '/metadata.json'

      const loadedModel = await tmImage.load(modelURL, metadataURL)
      setModel(loadedModel)
      
      const video = videoRef.current
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 }
        })
        video.srcObject = stream
        video.play()
        setIsLoading(false)
        
        predictLoop(loadedModel)
      }
    } catch (error) {
      console.error('Error loading model or camera:', error)
      alert('エラーが発生しました。モデルファイルが見つからない可能性があります。モデルファイルをpublic/model/ フォルダに配置してください。')
    }
  }

  const predictLoop = async (modelToUse) => {
    if (!modelToUse || !videoRef.current || isPredicting) return
    
    setIsPredicting(true)
    const predictions = await modelToUse.predict(videoRef.current)
    setPrediction(predictions[0]?.className || '検出中...')
    setIsPredicting(false)
    
    requestAnimationFrame(() => predictLoop(modelToUse))
  }

  const getGestureIcon = (gesture) => {
    switch(gesture) {
      case 'グー': return '✊'
      case 'パー': return '🖐'
      case 'チョキ': return '✌'
      case '予測中...': return '🤔'
      default: return '❓'
    }
  }

  return (
    <div className="container">
      <h1 style={{ textAlign: 'center', marginBottom: '1rem' }}>
        ジャンケン練習モード
      </h1>
      
      {isLoading ? (
        <div className="loading">
          <p>モデルとカメラを読み込み中...</p>
          <p style={{ fontSize: '0.9rem', marginTop: '0.5rem', color: '#999' }}>
            初回起動時はモデルファイルを読み込むのに時間がかかります
          </p>
        </div>
      ) : (
        <>
          <div className="camera-container">
            <video
              ref={videoRef}
              className="video"
              autoPlay
              playsInline
              muted
            />
            <div className="prediction-box">
              <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                現在の手:
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                {prediction ? (
                  <>
                    {getGestureIcon(prediction)} {prediction}
                  </>
                ) : (
                  '検出中...'
                )}
              </div>
            </div>
          </div>

          <div className="guide-box">
            <h4>手の形ガイド</h4>
            <div className="guide-gestures">
              <div className="gesture-sample">
                <div className="gesture-icon">✊</div>
                <div><strong>グー</strong></div>
                <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.5rem' }}>
                  手をグーに握ってください
                </div>
              </div>
              <div className="gesture-sample">
                <div className="gesture-icon">🖐</div>
                <div><strong>パー</strong></div>
                <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.5rem' }}>
                  全ての指を開いてください
                </div>
              </div>
              <div className="gesture-sample">
                <div className="gesture-icon">✌</div>
                <div><strong>チョキ</strong></div>
                <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.5rem' }}>
                  人差し指と中指を立ててください
                </div>
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <button 
              className="button"
              onClick={() => router.push('/')}
            >
              ホームに戻る
            </button>
            <button 
              className="button"
              onClick={() => router.push('/game')}
            >
              ゲームを始める
            </button>
          </div>
        </>
      )}
    </div>
  )
}
