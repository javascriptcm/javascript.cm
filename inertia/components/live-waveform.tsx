import { useEffect, useRef } from 'react'

interface LiveWaveformProps {
  stream: MediaStream | null
  width?: number
  height?: number
}

export default function LiveWaveform({ stream, width = 220, height = 36 }: LiveWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const analyserRef = useRef<AnalyserNode | null>(null)
  const dataArrayRef = useRef<Uint8Array | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null)

  useEffect(() => {
    if (!stream || !canvasRef.current) return
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
    audioCtxRef.current = audioCtx
    const analyser = audioCtx.createAnalyser()
    analyser.fftSize = 128
    analyserRef.current = analyser
    const bufferLength = analyser.frequencyBinCount
    dataArrayRef.current = new Uint8Array(bufferLength)
    const source = audioCtx.createMediaStreamSource(stream)
    sourceRef.current = source
    source.connect(analyser)

    function draw() {
      if (!canvasRef.current || !analyserRef.current || !dataArrayRef.current) return
      const ctx = canvasRef.current.getContext('2d')!
      analyserRef.current.getByteTimeDomainData(dataArrayRef.current)
      ctx.clearRect(0, 0, width, height)
      ctx.beginPath()
      const sliceWidth = width / dataArrayRef.current.length
      let x = 0
      for (let i = 0; i < dataArrayRef.current.length; i++) {
        const v = dataArrayRef.current[i] / 128.0
        const y = (v * height) / 2
        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
        x += sliceWidth
      }
      ctx.strokeStyle = '#4f8cff'
      ctx.lineWidth = 2
      ctx.stroke()
      animationRef.current = requestAnimationFrame(draw)
    }
    draw()
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
      analyser.disconnect()
      source.disconnect()
      audioCtx.close()
    }
  }, [stream, width, height])

  return <canvas ref={canvasRef} width={width} height={height} style={{ background: 'transparent', display: 'block' }} />
} 