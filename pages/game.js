import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/router'
import * as tmImage from '@teachablemachine/image'

export default function Game() {
  const router = useRouter()
  const videoRef = useRef(null)
  const [model, setModel] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [prediction, setPrediction] = useState(null)
  const [isPredicting, setIsPredicting] = useState(false)
  const [round, setRound] = useState(1)
  const [userScore, setUserScore] = useState(0)
  const [computerScore, setComputerScore] = useState(0)
  const [gameStatus, setGameStatus] = useState('playing')
  const [computerChoice, setComputerChoice] = useState(null)
  const [roundResult, setRoundResult] = useState(null)

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
      const URL = '/model'
      const modelURL = URL + '/model.json'
      const metadataURL = URL + '/metadata.json'

      console.log('Loading model from:', modelURL)
      console.log('Metadata URL:', metadataURL)

      // ファイルが存在するか確認
      try {
        const metadataResponse = await fetch(metadataURL)
        if (!metadataResponse.ok) {
          throw new Error(`Metadata file not found: ${metadataResponse.status}`)
        }
        const metadata = await metadataResponse.json()
        console.log('Metadata loaded:', metadata)
      } catch (fetchError) {
        console.error('Error fetching metadata:', fetchError)
        throw new Error(`メタデータファイルの読み込みに失敗しました: ${metadataURL}`)
      }

      const loadedModel = await tmImage.load(modelURL, metadataURL)
      console.log('Model loaded successfully')
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
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      })
      alert(`エラーが発生しました: ${error.message}\n\nコンソールに詳細なエラー情報が表示されています。`)
      setIsLoading(false)
    }
  }

  const translateLabel = (englishLabel) => {
    const labelMap = {
      'rock': 'グー',
      'paper': 'パー',
      'scissors': 'チョキ',
      'none': '検出中...'
    }
    return labelMap[englishLabel] || englishLabel
  }

  const translateToEnglish = (japaneseLabel) => {
    const labelMap = {
      'グー': 'rock',
      'パー': 'paper',
      'チョキ': 'scissors'
    }
    return labelMap[japaneseLabel] || japaneseLabel
  }

  const predictLoop = async (modelToUse) => {
    if (!modelToUse || !videoRef.current || isPredicting) return
    
    setIsPredicting(true)
    const predictions = await modelToUse.predict(videoRef.current)
    const englishLabel = predictions[0]?.className || 'none'
    const japaneseLabel = translateLabel(englishLabel)
    setPrediction(japaneseLabel === '検出中...' ? '検出中...' : englishLabel)
    setIsPredicting(false)
    
    requestAnimationFrame(() => predictLoop(modelToUse))
  }

  const getGestureIcon = (gesture) => {
    // 英語ラベルと日本語ラベルの両方に対応
    switch(gesture) {
      case 'rock':
      case 'グー': return '✊'
      case 'paper':
      case 'パー': return '🖐'
      case 'scissors':
      case 'チョキ': return '✌'
      default: return '❓'
    }
  }

  const getComputerChoice = () => {
    const choices = ['rock', 'paper', 'scissors']
    return choices[Math.floor(Math.random() * choices.length)]
  }

  const getResult = (userChoice, computerChoice) => {
    // ユーザーの選択は既に英語ラベル（rock, paper, scissors）で保存されている
    if (userChoice === computerChoice) return 'draw'
    if (
      (userChoice === 'rock' && computerChoice === 'scissors') ||
      (userChoice === 'paper' && computerChoice === 'rock') ||
      (userChoice === 'scissors' && computerChoice === 'paper')
    ) {
      return 'win'
    }
    return 'lose'
  }

  const playRound = () => {
    if (!prediction || prediction === '検出中...' || prediction === 'none') {
      alert('手の形を認識できません。もう一度試してください。')
      return
    }

    const compChoice = getComputerChoice()
    setComputerChoice(compChoice)
    const result = getResult(prediction, compChoice)

    setRoundResult(result)
    
    if (result === 'win') {
      setUserScore(userScore + 1)
    } else if (result === 'lose') {
      setComputerScore(computerScore + 1)
    }

    if (round >= 3) {
      setTimeout(() => {
        if (userScore + (result === 'win' ? 1 : 0) > computerScore + (result === 'lose' ? 1 : 0)) {
          setGameStatus('won')
        } else if (userScore + (result === 'win' ? 1 : 0) < computerScore + (result === 'lose' ? 1 : 0)) {
          setGameStatus('lost')
        } else {
          setGameStatus('draw')
        }
      }, 2000)
    } else {
      setRound(round + 1)
    }
  }

  const resetGame = () => {
    setRound(1)
    setUserScore(0)
    setComputerScore(0)
    setGameStatus('playing')
    setComputerChoice(null)
    setRoundResult(null)
  }

  return (
    <div className="container">
      <h1 style={{ textAlign: 'center', marginBottom: '1rem' }}>
        ジャンケンゲーム
      </h1>

      {isLoading ? (
        <div className="loading">
          <p>モデルとカメラを読み込み中...</p>
        </div>
      ) : gameStatus !== 'playing' ? (
        <div className="result-screen">
          <h2>
            {gameStatus === 'won' && '🎉 あなたの勝ち！'}
            {gameStatus === 'lost' && '😢 あなたの負け...'}
            {gameStatus === 'draw' && '🤝 引き分け！'}
          </h2>
          <div style={{ fontSize: '1.5rem', marginTop: '1rem' }}>
            <p>あなた: {userScore}点</p>
            <p>コンピュータ: {computerScore}点</p>
          </div>
          <button className="button" onClick={resetGame} style={{ marginTop: '2rem' }}>
            もう一度遊ぶ
          </button>
          <button className="button" onClick={() => router.push('/')} style={{ marginTop: '1rem' }}>
            ホームに戻る
          </button>
        </div>
      ) : (
        <>
          <div className="score-board">
            <div className="score-item">
              <div>あなた</div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{userScore}</div>
            </div>
            <div className="score-item">
              <div>ラウンド {round} / 3</div>
            </div>
            <div className="score-item">
              <div>コンピュータ</div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{computerScore}</div>
            </div>
          </div>

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
                あなたの手:
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                {prediction && prediction !== '検出中...' ? (
                  <>
                    {getGestureIcon(prediction)} {translateLabel(prediction)}
                  </>
                ) : (
                  '検出中...'
                )}
              </div>
            </div>
          </div>

          {roundResult && (
            <div className="round-result">
              <div style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>
                コンピュータ: {getGestureIcon(computerChoice)} {translateLabel(computerChoice)}
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                {roundResult === 'win' && '🎉 あなたの勝ち！'}
                {roundResult === 'lose' && '😢 あなたの負け...'}
                {roundResult === 'draw' && '🤝 引き分け！'}
              </div>
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <button 
              className="button"
              onClick={playRound}
              disabled={!prediction || prediction === '検出中...' || prediction === 'none' || roundResult !== null}
              style={{ fontSize: '1.2rem', padding: '1rem 2rem' }}
            >
              決定！
            </button>
          </div>

          {roundResult && (
            <button 
              className="button"
              onClick={() => setRoundResult(null)}
              style={{ marginTop: '1rem', display: 'block', margin: '1rem auto 0' }}
            >
              次のラウンドへ
            </button>
          )}
        </>
      )}
    </div>
  )
}
