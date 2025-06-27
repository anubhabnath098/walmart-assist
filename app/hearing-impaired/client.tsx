"use client"

import { useState, useEffect, useRef } from "react"
import { Camera, CameraOff, X, Loader2 } from "lucide-react"
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

export default function HearingImpairedClient() {
  const [isCameraOn, setIsCameraOn] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [inputText, setInputText] = useState("")
  const [apiResponse, setApiResponse] = useState(
    "Welcome! Type your question or turn on the camera."
  )
  const [permissionError, setPermissionError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isProcessingImage, setIsProcessingImage] = useState(false)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [femaleVoice, setFemaleVoice] = useState<SpeechSynthesisVoice | null>(null)

  const videoRef = useRef<HTMLVideoElement>(null)
  const captureTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const displayedResponse = useTypewriter(apiResponse)

  // --- Preload and select female voice once ---
  useEffect(() => {
    const synth = window.speechSynthesis
    const loadVoices = () => {
      const voices = synth.getVoices()
      if (voices.length) {
        const fv =
          voices.find(v =>
            /female|woman|zira|susan|kathleen/i.test(v.name)
          ) || voices[0]
        setFemaleVoice(fv)
      }
    }
    loadVoices()
    synth.onvoiceschanged = loadVoices
    return () => { synth.onvoiceschanged = null }
  }, [])

  const speakText = (text: string) => {
    if ("speechSynthesis" in window && femaleVoice) {
      window.speechSynthesis.cancel()
      const utter = new SpeechSynthesisUtterance(text)
      utter.voice = femaleVoice
      utter.rate = 1.4
      window.speechSynthesis.speak(utter)
    }
  }

  const stopSpeech = () => {
    if ("speechSynthesis" in window) window.speechSynthesis.cancel()
  }

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      if (videoRef.current) videoRef.current.srcObject = stream
      setIsCameraOn(true)
      setSessionId(null)
      setApiResponse("Capturing image in 5 seconds...")
      speakText("Capturing image in five seconds. Please hold steady.")
      setCountdown(5)
      countdownIntervalRef.current = setInterval(() => {
        setCountdown(prev => (prev !== null && prev > 1 ? prev - 1 : null))
      }, 1000)
      captureTimeoutRef.current = setTimeout(captureImage, 5000)
    } catch {
      setPermissionError("Camera access denied.")
    }
  }

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      ;(videoRef.current.srcObject as MediaStream)
        .getTracks()
        .forEach(t => t.stop())
      videoRef.current.srcObject = null
    }
    setIsCameraOn(false)
    setSessionId(null)
    setCountdown(null)
    clearTimeout(captureTimeoutRef.current!)
    clearInterval(countdownIntervalRef.current!)
    setApiResponse("Camera off. You can ask general questions below.")
    speakText("Camera off.")
  }

  const toggleCamera = () =>
    isCameraOn ? stopCamera() : startCamera()

  const captureImage = async () => {
    if (!videoRef.current) return
    setIsProcessingImage(true)
    const canvas = document.createElement("canvas")
    canvas.width = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight
    canvas.getContext("2d")?.drawImage(videoRef.current, 0, 0)
    canvas.toBlob(async blob => {
      if (!blob) return
      const fd = new FormData()
      fd.append("file", blob, "capture.jpg")
      try {
        const res = await fetch("http://localhost:8000/upload_image", {
          method: "POST",
          body: fd
        })
        const data = await res.json()
        if (res.ok) {
          setSessionId(data.session_id)
          setApiResponse(data.response)
          speakText(data.response)
        }
      } catch {
        console.error("Image upload failed")
      } finally {
        setIsProcessingImage(false)
      }
    }, "image/jpeg")
  }

  const sendQuestion = async () => {
    if (!inputText.trim()) return
    setIsLoading(true)
    try {
      const res = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: inputText, session_id: sessionId })
      })
      const data = await res.json()
      if (res.ok) {
        setApiResponse(data.response)
        speakText(data.response)
      }
    } catch {
      console.error("Chat error")
    } finally {
      setIsLoading(false)
      setInputText("")
    }
  }

  useEffect(
    () => () => {
      stopCamera()
      stopSpeech()
    },
    []
  )

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {permissionError && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{permissionError}</AlertDescription>
          </Alert>
        )}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Camera Column */}
          <div className="flex flex-col gap-6">
            <Card className="overflow-hidden rounded-2xl bg-black relative">
              <CardContent className="p-0 relative">
                <div className="absolute top-4 left-4 z-10 flex space-x-2">
                  <Button
                    size="lg"
                    onClick={toggleCamera}
                    aria-label={
                      isCameraOn ? "Turn camera off" : "Turn camera on"
                    }
                    className="rounded-full bg-blue-600 hover:bg-blue-700"
                  >
                    {isCameraOn ? (
                      <CameraOff className="h-5 w-5" />
                    ) : (
                      <Camera className="h-5 w-5" />
                    )}
                  </Button>
                  <Button
                    size="lg"
                    className="rounded-full bg-red-600 hover:bg-red-700"
                    onClick={stopSpeech}
                    aria-label="Stop response"
                  >
                    <X className="h-5 w-5 text-white" />
                  </Button>
                </div>

                {countdown !== null && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-20">
                    <div className="text-9xl font-bold text-white">
                      {countdown}
                    </div>
                  </div>
                )}

                {isProcessingImage && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 z-20">
                    <Loader2 className="h-16 w-16 animate-spin text-white" />
                  </div>
                )}

                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full aspect-[4/5] bg-black object-cover"
                />
              </CardContent>
            </Card>
          </div>

          {/* Input & Response Column */}
          <div>
            <Card className="rounded-2xl h-full bg-gray-800/50">
              <CardContent className="p-8">
                <div className="space-y-6">
                  {/* Input Row */}
                  <div className="flex items-center space-x-3">
                    <input
                      type="text"
                      value={inputText}
                      onChange={e => setInputText(e.target.value)}
                      onKeyDown={e =>
                        e.key === "Enter" && sendQuestion()
                      }
                      placeholder="Type your question here..."
                      className="w-full p-4 bg-gray-900/70 rounded-lg text-white"
                    />
                    {isLoading && (
                      <span className="text-gray-300 italic">
                        Generating response…
                      </span>
                    )}
                  </div>

                  {/* Response */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-2">
                      Response:
                    </h3>
                    <div className="p-4 bg-blue-900/20 rounded-lg min-h-[150px]">
                      <p className="text-white whitespace-pre-wrap">
                        {displayedResponse || "..."}
                      </p>
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
