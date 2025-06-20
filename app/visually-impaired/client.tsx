"use client"

import { useState, useEffect, useRef } from "react"
import { Mic, MicOff, Camera, CameraOff, Loader2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

// --- Custom Hook for Typewriter Effect ---
const useTypewriter = (text: string, speed = 50) => {
  const [displayText, setDisplayText] = useState("")
  useEffect(() => {
    let cancelled = false
    setDisplayText("")
    if (text) {
      const typeChar = (index: number) => {
        if (cancelled) return
        if (index < text.length) {
          setDisplayText(text.slice(0, index + 1))
          setTimeout(() => typeChar(index + 1), speed)
        }
      }
      typeChar(0)
    }
    return () => { cancelled = true }
  }, [text, speed])
  return displayText
}

// --- SpeechRecognition Interface ---
interface ISpeechRecognition extends EventTarget {
  lang: string
  continuous: boolean
  interimResults: boolean
  start(): void
  stop(): void
  onresult: ((this: ISpeechRecognition, ev: any) => any) | null
  onerror: ((this: ISpeechRecognition, ev: any) => any) | null
  onend: ((this: ISpeechRecognition, ev: Event) => any) | null
  onstart: (() => void) | null
}

declare global {
  interface Window {
    SpeechRecognition: { new(): ISpeechRecognition }
    webkitSpeechRecognition: { new(): ISpeechRecognition }
  }
}

export default function VisuallyImpairedClient() {
  type AppState = "idle" | "awaiting_capture" | "processing_image" | "image_session_active" | "general_listening" | "processing_chat"
  const [appState, setAppState] = useState<AppState>("idle")
  const [isCameraOn, setIsCameraOn] = useState(false)
  const [isMicOn, setIsMicOn] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [apiResponse, setApiResponse] = useState("Welcome! Tap the screen or the camera button to begin.")
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [permissionError, setPermissionError] = useState<string | null>(null)

  const videoRef = useRef<HTMLVideoElement>(null)
  const recogRef = useRef<ISpeechRecognition | null>(null)
  const captureTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const isProcessingApiCall = useRef(false)

  const displayedResponse = useTypewriter(apiResponse)

  // --- Text to Speech ---
  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 1
      utterance.pitch = 1
      utterance.volume = 1
      window.speechSynthesis.speak(utterance)
    }
  }

  // --- Stop speech immediately ---
  const stopSpeech = () => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel()
  }

  // --- Microphone controls (manual only) ---
  const startMicrophone = () => {
    if (recogRef.current && !isProcessingApiCall.current && !isMicOn) {
      recogRef.current.start()
    }
  }
  const stopMicrophone = () => {
    if (recogRef.current && isMicOn) {
      recogRef.current.stop()
    }
  }
  const toggleMicrophone = () => {
    isMicOn ? stopMicrophone() : startMicrophone()
  }

  // --- Image capture & API ---
  const captureAndSendImage = async () => {
    if (!videoRef.current) return
    setAppState('processing_image')
    speakText('Capturing image, please wait.')
    const canvas = document.createElement('canvas')
    canvas.width = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight
    canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0)
    canvas.toBlob(async blob => {
      if (!blob) return
      const formData = new FormData()
      formData.append('file', blob, 'capture.jpg')
      isProcessingApiCall.current = true
      try {
        const res = await fetch('http://localhost:8000/upload_image', { method: 'POST', body: formData })
        const data = await res.json()
        if (res.ok) {
          setSessionId(data.session_id)
          setApiResponse(data.response)
          speakText(data.response)
          setAppState('image_session_active')
        } else throw new Error(data.detail)
      } catch (e) {
        console.error(e)
        const errMsg = "Sorry, I couldn't analyze the image."
        setApiResponse(errMsg)
        speakText(errMsg)
      } finally {
        isProcessingApiCall.current = false
      }
    }, 'image/jpeg')
  }

  // --- Follow-up (manual mic) ---
  const handleFollowUpQuestion = async (text: string) => {
    setTranscript(text)
    setAppState('processing_chat')
    isProcessingApiCall.current = true
    stopMicrophone()
    try {
      const res = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: text, session_id: sessionId }),
      })
      const data = await res.json()
      if (res.ok) {
        setApiResponse(data.response)
        speakText(data.response)
        setAppState(isCameraOn ? 'image_session_active' : 'general_listening')
      } else throw new Error(data.detail)
    } catch (e) {
      console.error(e)
      const errMsg = 'Sorry, something went wrong.'
      setApiResponse(errMsg)
      speakText(errMsg)
    } finally {
      isProcessingApiCall.current = false
    }
  }

  // --- Camera controls ---
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      if (videoRef.current) videoRef.current.srcObject = stream
      setIsCameraOn(true)
      setSessionId(null)
      const msg = 'Camera started. Capturing image in 10 seconds.'
      setApiResponse(msg)
      speakText(msg)
      setAppState('awaiting_capture')
    } catch {
      setPermissionError('Camera access denied.')
    }
  }
  const stopCamera = () => {
    if (videoRef.current?.srcObject) (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop())
    setIsCameraOn(false)
    setSessionId(null)
    const msg = 'Camera off.'
    setApiResponse(msg)
    speakText(msg)
    setAppState('general_listening')
  }
  const toggleCamera = () => {
    isCameraOn ? stopCamera() : startCamera()
  }

  // --- Setup SpeechRecognition ---
  useEffect(() => {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRec) {
      setPermissionError('SpeechRecognition not supported.')
      return
    }
    const recog = new SpeechRec()
    recog.continuous = false
    recog.interimResults = false
    recog.lang = 'en-US'
    recog.onstart = () => setIsMicOn(true)
    recog.onend = () => setIsMicOn(false)
    recog.onresult = ev => handleFollowUpQuestion(ev.results[0][0].transcript)
    recog.onerror = err => err.error !== 'no-speech' && console.error(err)
    recogRef.current = recog
  }, [])

  // --- Capture countdown ---
  useEffect(() => {
    if (appState === 'awaiting_capture') {
      setCountdown(10)
      countdownIntervalRef.current = setInterval(() => setCountdown(prev => (prev && prev > 1 ? prev - 1 : null)), 1000)
      captureTimeoutRef.current = setTimeout(captureAndSendImage, 10000)
    } else {
      clearTimeout(captureTimeoutRef.current!) 
      clearInterval(countdownIntervalRef.current!) 
      setCountdown(null)
    }
  }, [appState])

  // --- Cleanup on unmount ---
  useEffect(
    () => () => {
      stopCamera()
      stopMicrophone()
      window.speechSynthesis.cancel()
    },
    []
  )

  return (
    <div className="min-h-screen bg-gray-900 text-white" onClick={appState === 'idle' ? toggleCamera : undefined}>
      <div className="container mx-auto px-4 py-8">
        {permissionError && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{permissionError}</AlertDescription>
          </Alert>
        )}
        <div className="grid md:grid-cols-2 gap-8">
          <div className="flex flex-col gap-6">
            <Card className="overflow-hidden rounded-2xl bg-black relative">
              <CardContent className="p-0 relative">
                <div className="absolute top-4 left-4 z-10 flex space-x-2">
                  <Button size="lg" className="rounded-full bg-blue-600 hover:bg-blue-700" onClick={toggleCamera} aria-label={isCameraOn ? 'Turn camera off' : 'Turn camera on'}>
                    {isCameraOn ? <CameraOff className="h-5 w-5" /> : <Camera className="h-5 w-5" />}
                  </Button>
                  <Button size="lg" className="rounded-full bg-gray-600 hover:bg-gray-700" onClick={toggleMicrophone} aria-label={isMicOn ? 'Mute mic' : 'Unmute mic'}>
                    {isMicOn ? <Mic className="h-5 w-5 text-green-400" /> : <MicOff className="h-5 w-5 text-red-400" />}
                  </Button>
                  <Button size="lg" className="rounded-full bg-red-600 hover:bg-red-700" onClick={stopSpeech} aria-label="Stop response">
                    <X className="h-5 w-5 text-white" />
                  </Button>
                </div>
                {countdown !== null && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-20">
                    <div className="text-9xl font-bold text-white drop-shadow-lg">{countdown}</div>
                  </div>
                )}
                {(appState === 'processing_image' || appState === 'processing_chat') && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 z-20">
                    <Loader2 className="h-24 w-24 animate-spin text-white" />
                  </div>
                )}
                <video ref={videoRef} autoPlay playsInline muted className="w-full aspect-[4/5] bg-black object-cover" />
              </CardContent>
            </Card>
          </div>
          <div className="flex flex-col gap-6">
            <Card className="rounded-2xl h-full bg-gray-800/50">
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-2">You said:</h3>
                    <div className="p-4 bg-gray-900/70 rounded-lg min-h-[50px]">
                      <p className="text-gray-200">{transcript || '...'}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-2">Assistant:</h3>
                    <div className="p-4 bg-blue-900/20 rounded-lg min-h-[150px]">
                      <p className="text-white whitespace-pre-wrap">{displayedResponse || '...'}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
