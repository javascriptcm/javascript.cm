import { Head, useForm } from '@inertiajs/react'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { format } from 'date-fns'
import {
  BarChart2,
  Calendar,
  Folder,
  Image as ImageIcon,
  Mic,
  Pause,
  Play,
  Plus,
  Send,
  Smile,
  Square,
  Trash,
  User as UserIcon,
} from 'lucide-react'
import { MouseEvent, useEffect, useRef, useState } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism'
import WaveSurfer from 'wavesurfer.js'
import Provider from '~/layouts/provider'
import LiveWaveform from '../../components/live-waveform'
import Navbar from '../../components/navbar'
import { useSocket } from '../../hooks/useSocket'

function isTempId(id: any) {
  return typeof id === 'string' && id.startsWith('temp_')
}

function AudioRecorder({
  onRecorded,
  disabled,
}: {
  onRecorded: (file: File) => void
  disabled: boolean
}) {
  const [recording, setRecording] = useState(false)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const [error, setError] = useState<string | null>(null)
  const chunks = useRef<Blob[]>([])

  useEffect(() => {
    return () => {
      if (mediaRecorder) mediaRecorder.stream.getTracks().forEach((t) => t.stop())
    }
  }, [mediaRecorder])

  async function startRecording() {
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.current.push(e.data)
      }
      recorder.onstop = () => {
        const blob = new Blob(chunks.current, { type: 'audio/webm' })
        const file = new File([blob], `audio-${Date.now()}.webm`, { type: 'audio/webm' })
        onRecorded(file)
        chunks.current = []
      }
      setMediaRecorder(recorder)
      recorder.start()
      setRecording(true)
    } catch (err) {
      setError("Impossible de démarrer l'enregistrement audio")
    }
  }
  function stopRecording() {
    mediaRecorder?.stop()
    setRecording(false)
  }
  return (
    <div className="flex items-center gap-2">
      {!recording ? (
        <button
          type="button"
          onClick={startRecording}
          disabled={disabled}
          className="bg-orange-500 text-white px-2 py-1 rounded flex items-center gap-1"
        >
          <Mic className="w-4 h-4" /> Enregistrer
        </button>
      ) : (
        <button
          type="button"
          onClick={stopRecording}
          className="bg-red-500 text-white px-2 py-1 rounded flex items-center gap-1"
        >
          <Square className="w-4 h-4" /> Stop
        </button>
      )}
      {error && <span className="text-red-500 text-xs">{error}</span>}
    </div>
  )
}

function CodeInput({ value, onChange, onCancel, onSend, disabled }: any) {
  return (
    <div className="flex flex-col gap-2 bg-gray-100 p-2 rounded">
      <textarea
        className="font-mono border rounded p-2 w-full text-sm bg-white"
        rows={6}
        placeholder="Votre code..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        spellCheck={false}
      />
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onSend}
          className="bg-blue-600 text-white px-3 py-1 rounded"
          disabled={disabled}
        >
          Envoyer le code
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-400 text-white px-3 py-1 rounded"
        >
          Annuler
        </button>
      </div>
    </div>
  )
}

function extractUrls(text: string | null | undefined): string[] {
  if (!text) return []
  const urlRegex = /https?:\/\/[\w\-._~:/?#[\]@!$&'()*+,;=%]+/gi
  return text.match(urlRegex) || []
}

function LinkPreview({ url }: { url: string }) {
  const [meta, setMeta] = useState<any>(null)
  useEffect(() => {
    let cancelled = false
    async function fetchMeta() {
      try {
        const res = await fetch(`https://opengraph.lewagon.ai/?url=${encodeURIComponent(url)}`)
        const data = await res.json()
        if (!cancelled) setMeta(data)
      } catch {
        if (!cancelled) setMeta(null)
      }
    }
    fetchMeta()
    return () => {
      cancelled = true
    }
  }, [url])
  if (!meta) return null
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 border rounded bg-gray-50 hover:bg-gray-100 p-2 mt-2 max-w-md text-xs no-underline"
    >
      {meta.image && (
        <img
          src={meta.image}
          alt="preview"
          className="h-10 w-10 object-cover rounded mr-2 flex-shrink-0"
        />
      )}
      <div className="flex-1 min-w-0">
        <div className="font-semibold truncate text-gray-800">{meta.title || url}</div>
        {meta.description && <div className="truncate text-gray-500">{meta.description}</div>}
        <div className="flex items-center gap-1 mt-1">
          {meta.favicon && (
            <img src={meta.favicon} alt="favicon" className="h-4 w-4 inline-block mr-1" />
          )}
          <span className="text-gray-400 truncate">{new URL(url).hostname}</span>
        </div>
      </div>
    </a>
  )
}

function ContextMenu({
  x,
  y,
  actions,
  onClose,
}: {
  x: number
  y: number
  actions: { label: string; icon?: string; onClick: () => void; disabled?: boolean }[]
  onClose: () => void
}) {
  useEffect(() => {
    function handle(e: MouseEvent | KeyboardEvent | Event) {
      onClose()
    }
    window.addEventListener('click', handle)
    window.addEventListener('contextmenu', handle)
    window.addEventListener('scroll', handle)
    window.addEventListener('keydown', handle)
    return () => {
      window.removeEventListener('click', handle)
      window.removeEventListener('contextmenu', handle)
      window.removeEventListener('scroll', handle)
      window.removeEventListener('keydown', handle)
    }
  }, [onClose])
  return (
    <div
      style={{ position: 'fixed', top: y, left: x, zIndex: 1000 }}
      className="bg-white border rounded shadow-lg min-w-[180px] py-1"
    >
      {actions.map((a, i) => (
        <button
          key={i}
          className={`flex items-center w-full px-3 py-2 text-left text-sm hover:bg-gray-100 ${a.disabled ? 'text-gray-300 cursor-not-allowed' : ''}`}
          onClick={() => {
            if (!a.disabled) {
              a.onClick()
              onClose()
            }
          }}
          disabled={a.disabled}
        >
          {a.icon && <span className="mr-2">{a.icon}</span>}
          {a.label}
        </button>
      ))}
    </div>
  )
}

function ForwardModal({ open, onClose, onForward, discussions, message }: any) {
  const [targetId, setTargetId] = useState('')
  if (!open) return null
  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
      <div className="bg-white rounded shadow p-6 min-w-[300px]">
        <h3 className="font-bold mb-2">Transférer le message</h3>
        <select
          className="border rounded p-2 w-full mb-4"
          value={targetId}
          onChange={(e) => setTargetId(e.target.value)}
        >
          <option value="">Choisir une discussion</option>
          {discussions.map((d: any) => (
            <option key={d.id} value={d.id}>
              {d.title}
            </option>
          ))}
        </select>
        <div className="flex gap-2">
          <button
            className="bg-blue-600 text-white px-3 py-1 rounded"
            disabled={!targetId}
            onClick={() => onForward(targetId)}
          >
            Transférer
          </button>
          <button className="bg-gray-400 text-white px-3 py-1 rounded" onClick={onClose}>
            Annuler
          </button>
        </div>
      </div>
    </div>
  )
}

function Toast({
  message,
  type,
  onClose,
}: {
  message: string
  type: 'success' | 'error'
  onClose: () => void
}) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000)
    return () => clearTimeout(t)
  }, [onClose])
  return (
    <div
      className={`fixed bottom-4 right-4 z-50 px-4 py-2 rounded shadow text-white ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}
    >
      {message}
    </div>
  )
}

function HistoryTimeline({ history, current }: { history: any[]; current: any }) {
  return (
    <div className="max-h-96 overflow-y-auto p-2">
      {[...history, current].map((v, i) => (
        <div key={i} className="mb-4 border-l-2 pl-4 relative">
          <div className="absolute -left-2 top-1 w-3 h-3 rounded-full bg-blue-400 border-2 border-white" />
          <div className="text-xs text-gray-400 mb-1">
            {v.updatedAt ? format(new Date(v.updatedAt), 'Pp') : 'Création'}
          </div>
          <div className="bg-gray-50 rounded p-2 font-mono text-sm whitespace-pre-line">
            {v.content}
          </div>
          {v.fileUrl && <div className="text-xs text-blue-600">[Fichier joint]</div>}
          {i === history.length && current.status === 'edited' && (
            <span className="text-xs text-yellow-600 ml-2">(édité)</span>
          )}
          {i === history.length && current.status === 'deleted' && (
            <span className="text-xs text-red-600 ml-2">(supprimé)</span>
          )}
        </div>
      ))}
    </div>
  )
}

function getInitials(name: string) {
  if (!name) return ''
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function FileBox({ name, size, url }: { name: string; size: number; url: string }) {
  return (
    <div className="flex items-center gap-2 bg-gray-100 rounded p-2 mt-2">
      <div className="flex-1 truncate">
        <div className="font-semibold text-sm truncate">{name}</div>
        <div className="text-xs text-gray-500">{(size / 1024).toFixed(1)} Ko</div>
      </div>
      <a href={url} download className="bg-blue-600 text-white px-2 py-1 rounded text-xs">
        Télécharger
      </a>
    </div>
  )
}

function PlusMenu({
  open,
  onClose,
  onSelect,
}: {
  open: boolean
  onClose: () => void
  onSelect: (type: string) => void
}) {
  if (!open) return null
  return (
    <div className="absolute bottom-14 left-0 z-50 bg-gray-800 rounded-xl shadow-lg py-2 w-56 animate-fade-in">
      <button
        className="flex items-center w-full px-4 py-3 hover:bg-gray-700 text-white text-left gap-3"
        onClick={() => {
          onSelect('file')
          onClose()
        }}
      >
        <Folder className="text-blue-400 w-5 h-5" /> Fichier
      </button>
      <button
        className="flex items-center w-full px-4 py-3 hover:bg-gray-700 text-white text-left gap-3"
        onClick={() => {
          onSelect('media')
          onClose()
        }}
      >
        <ImageIcon className="text-blue-500 w-5 h-5" /> Photos & vidéos
      </button>
      <button
        className="flex items-center w-full px-4 py-3 hover:bg-gray-700 text-white text-left gap-3"
        onClick={() => {
          onSelect('contact')
          onClose()
        }}
      >
        <UserIcon className="text-orange-400 w-5 h-5" /> Contact
      </button>
      <button
        className="flex items-center w-full px-4 py-3 hover:bg-gray-700 text-white text-left gap-3"
        onClick={() => {
          onSelect('poll')
          onClose()
        }}
      >
        <BarChart2 className="text-yellow-400 w-5 h-5" /> Sondage
      </button>
      <button
        className="flex items-center w-full px-4 py-3 hover:bg-gray-700 text-white text-left gap-3"
        onClick={() => {
          onSelect('event')
          onClose()
        }}
      >
        <Calendar className="text-pink-400 w-5 h-5" /> Événement
      </button>
    </div>
  )
}

// NOUVEAU VoiceRecorderBar
function VoiceRecorderBar({
  onSend,
  disabled,
  onRecordingChange,
}: {
  onSend: (file: File) => void
  disabled: boolean
  onRecordingChange?: (rec: boolean) => void
}) {
  const [state, setState] = useState<'idle' | 'recording' | 'preview'>('idle')
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const [audioChunks, setAudioChunks] = useState<Blob[]>([])
  const audioChunksRef = useRef<Blob[]>([])
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [timer, setTimer] = useState(0)
  const [intervalId, setIntervalId] = useState<any>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [wavesurfer, setWavesurfer] = useState<any>(null)
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const waveformRef = useRef<HTMLDivElement>(null)
  const [isCancelled, setIsCancelled] = useState(false)
  const isCancelledRef = useRef(false)
  const [audioDuration, setAudioDuration] = useState(0)
  const prevBlobsRef = useRef<Blob[]>([])

  // Timer
  useEffect(() => {
    if (state === 'recording') {
      const id = setInterval(() => setTimer((t) => t + 1), 1000)
      setIntervalId(id)
      return () => clearInterval(id)
    } else if (intervalId) {
      clearInterval(intervalId)
    }
  }, [state])

  // WaveSurfer pour preview
  useEffect(() => {
    if (state === 'preview' && audioUrl && waveformRef.current) {
      if (wavesurfer) {
        wavesurfer.destroy()
      }
      const ws = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: '#fff',
        progressColor: '#4f8cff',
        height: 36,
        barWidth: 2,
        barRadius: 2,
        cursorWidth: 2,
        interact: true,
      })
      ws.load(audioUrl)
      ws.on('ready', () => {
        setCurrentTime(0)
        setAudioDuration(ws.getDuration())
      })
      ws.on('audioprocess', () => setCurrentTime(ws.getCurrentTime()))
      ws.on('seek', () => setCurrentTime(ws.getCurrentTime()))
      ws.on('finish', () => setPlaying(false))
      setWavesurfer(ws)
      return () => ws.destroy()
    }
    // eslint-disable-next-line
  }, [state, audioUrl])

  // Notifier parent
  useEffect(() => {
    if (onRecordingChange) onRecordingChange(state !== 'idle')
  }, [state])

  function formatTimer(sec: number) {
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return `${m}:${s.toFixed(0).padStart(2, '0')}`
  }

  async function startRecording(append = false) {
    setTimer(0)
    setAudioChunks([])
    audioChunksRef.current = []
    setAudioUrl(null)
    setAudioFile(null)
    setState('recording')
    setIsCancelled(false)
    isCancelledRef.current = false
    if (append && audioUrl) {
      // On garde le blob courant pour concaténer après
      const res = await fetch(audioUrl)
      const oldBlob = await res.blob()
      prevBlobsRef.current = [oldBlob]
    } else {
      prevBlobsRef.current = []
    }
    try {
      const s = await navigator.mediaDevices.getUserMedia({ audio: true })
      setStream(s)
      const recorder = new MediaRecorder(s)
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          setAudioChunks((prev) => [...prev, e.data])
          audioChunksRef.current.push(e.data)
        }
      }
      recorder.onstop = async () => {
        if (isCancelledRef.current) return
        const chunks = audioChunksRef.current
        const newBlob = new Blob(chunks.length ? chunks : [], { type: 'audio/webm' })
        let finalBlob = newBlob
        if (prevBlobsRef.current.length > 0) {
          finalBlob = new Blob([...prevBlobsRef.current, newBlob], { type: 'audio/webm' })
        }
        const file = new File([finalBlob], `audio-${Date.now()}.webm`, { type: 'audio/webm' })
        setAudioFile(file)
        setAudioUrl(URL.createObjectURL(finalBlob))
        setState('preview')
        if (stream) stream.getTracks().forEach((t) => t.stop())
      }
      setMediaRecorder(recorder)
      recorder.start()
    } catch (err) {
      alert("Impossible de démarrer l'enregistrement audio")
      setState('idle')
    }
  }
  function stopRecording() {
    mediaRecorder?.stop()
    // setState('preview')
    if (intervalId) clearInterval(intervalId)
    if (stream) stream.getTracks().forEach((t) => t.stop())
  }
  function pauseRecording() {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop()
      // Le handler onstop va générer le blob et passer en preview
    }
  }
  function resumeRecording() {
    mediaRecorder?.resume()
  }
  function deleteRecording() {
    setIsCancelled(true)
    isCancelledRef.current = true
    setState('idle')
    setAudioChunks([])
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
      setAudioUrl(null)
    }
    setAudioFile(null)
    setTimer(0)
    setPlaying(false)
    setCurrentTime(0)
    if (intervalId) clearInterval(intervalId)
    if (mediaRecorder) {
      if (mediaRecorder.state === 'recording' || mediaRecorder.state === 'paused') {
        mediaRecorder.stop()
      }
      mediaRecorder.stream.getTracks().forEach((t) => t.stop())
    }
    if (stream) stream.getTracks().forEach((t) => t.stop())
    if (wavesurfer) {
      wavesurfer.destroy()
      setWavesurfer(null)
    }
    if (onRecordingChange) onRecordingChange(false)
  }
  function sendAudio() {
    if (audioFile) onSend(audioFile)
    deleteRecording()
  }
  function togglePlay() {
    if (!wavesurfer) return

    if (playing) {
      wavesurfer.pause()
      setPlaying(false)
    } else {
      wavesurfer.play()
      setPlaying(true)
    }
  }
  function seekWaveform(e: any) {
    if (wavesurfer) {
      const bbox = e.target.getBoundingClientRect()
      const x = e.clientX - bbox.left
      const percent = x / bbox.width
      wavesurfer.seekTo(percent)
    }
  }

  console.log('state', state)

  // UI rendering
  if (state === 'idle') {
    return (
      <button
        type="button"
        onClick={startRecording}
        disabled={disabled}
        className="text-gray-400 hover:text-blue-500 text-2xl flex items-center justify-center"
      >
        <Mic className="w-6 h-6" />
      </button>
    )
  }
  if (state === 'recording') {
    return (
      <div className="flex items-center w-full bg-primary-900 rounded-full px-3 py-2 gap-2">
        <button type="button" onClick={deleteRecording} className="text-red-400">
          <Trash />
        </button>
        <span
          className="w-4 h-4 mr-2 rounded-full bg-green-500 animate-pulse block"
          style={{ boxShadow: '0 0 8px #22c55e' }}
        />
        <span className="text-primary-200 text-xs mr-2">{formatTimer(timer)}</span>
        <div style={{ minWidth: 120, flex: 1 }}>
          <LiveWaveform stream={stream} />
        </div>
        <button type="button" onClick={pauseRecording} className="text-primary-200 mx-2">
          <Pause />
        </button>
        <button
          type="button"
          onClick={stopRecording}
          className="bg-primary-600 hover:bg-primary-700 text-primary-200 rounded-full p-2 ml-2 flex items-center justify-center text-xl"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    )
  }
  if (state === 'preview' && audioUrl) {
    const percent = audioDuration ? (currentTime / audioDuration) * 100 : 0
    return (
      <div className="flex items-center w-full bg-primary-900 rounded-full px-3 py-2 gap-2">
        <button type="button" onClick={deleteRecording} className="text-red-400">
          <Trash />
        </button>
        <button type="button" onClick={togglePlay} className="text-primary-200 mr-2">
          {playing ? <Pause /> : <Play />}
        </button>
        <div
          ref={waveformRef}
          className="flex-1 relative w-full h-4"
          style={{ minWidth: 120, height: 36 }}
          onClick={seekWaveform}
        >
          {/* Dot animé */}
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-[calc(50%-1px)] z-10"
            style={{ left: `${percent}%`, pointerEvents: 'none' }}
          >
            <span className="block w-4 h-4 bg-green-400 rounded-full shadow" />
          </div>
        </div>
        <span className="text-primary-200 text-xs ml-2 w-10 text-right">
          {formatTimer(currentTime || audioDuration)}
        </span>
        {/* Bouton micro pour continuer l'enregistrement */}
        <button
          type="button"
          onClick={() => startRecording(true)}
          className="text-gray-400 hover:text-blue-500 text-2xl flex items-center justify-center ml-2"
        >
          <Mic className="w-6 h-6" />
        </button>
        <button
          type="button"
          onClick={sendAudio}
          className="bg-primary-600 hover:bg-primary-700 text-primary-200 rounded-full p-2 ml-2 flex items-center justify-center text-xl"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    )
  }
  return null
}

// Nouveau composant pour afficher les messages audio façon WhatsApp
function AudioMessageBubble({
  url,
  duration,
  avatar,
  isAuthor,
}: {
  url: string
  duration?: number
  avatar: React.ReactNode
  isAuthor: boolean
}) {
  const waveformRef = useRef<HTMLDivElement>(null)
  const wavesurfer = useRef<any>(null)
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [audioDuration, setAudioDuration] = useState(duration || 0)

  // Utilise React Query pour obtenir l'URL signée
  const {
    data: audioPreviewUrl,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['audio-preview-url', url],
    queryFn: async () => {
      if (!url) return null
      if (url.startsWith('http')) return url
      const res = await axios.get(`/api/upload/presign-view?key=${encodeURIComponent(url)}`)
      return res.data.url
    },
    enabled: !!url,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  useEffect(() => {
    if (waveformRef.current && audioPreviewUrl) {
      if (wavesurfer.current) {
        wavesurfer.current.destroy()
      }
      wavesurfer.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: '#b7e0c7',
        progressColor: '#fff',
        height: 36,
        barWidth: 3,
        barRadius: 2,
        cursorWidth: 0,
        interact: true,
      })
      wavesurfer.current.load(audioPreviewUrl)
      wavesurfer.current.on('ready', () => {
        setAudioDuration(wavesurfer.current.getDuration())
      })
      wavesurfer.current.on('audioprocess', () => {
        setCurrentTime(wavesurfer.current.getCurrentTime())
      })
      wavesurfer.current.on('seek', () => {
        setCurrentTime(wavesurfer.current.getCurrentTime())
      })
      wavesurfer.current.on('finish', () => {
        setPlaying(false)
        setCurrentTime(audioDuration)
      })
    }
    return () => {
      if (wavesurfer.current) wavesurfer.current.destroy()
    }
  }, [audioPreviewUrl])

  function togglePlay() {
    if (!wavesurfer.current) return
    if (playing) {
      wavesurfer.current.pause()
      setPlaying(false)
    } else {
      wavesurfer.current.play()
      setPlaying(true)
    }
  }
  function formatTimer(sec: number) {
    const m = Math.floor(sec / 60)
    const s = Math.floor(sec % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }
  const dotLeft = audioDuration ? `${(currentTime / audioDuration) * 100}%` : '0%'

  // Affichage loading ou erreur
  if (isLoading) {
    return (
      <div
        className={`flex items-center gap-3 px-3 py-2 rounded-2xl ${isAuthor ? 'bg-blue-700' : 'bg-green-800'} relative`}
        style={{ minWidth: 220 }}
      >
        <span className="text-gray-200 text-xs">Chargement audio...</span>
      </div>
    )
  }
  if (isError || !audioPreviewUrl) {
    return (
      <div
        className={`flex items-center gap-3 px-3 py-2 rounded-2xl ${isAuthor ? 'bg-blue-700' : 'bg-green-800'} relative`}
        style={{ minWidth: 220 }}
      >
        <span className="text-red-200 text-xs">Erreur de chargement audio</span>
      </div>
    )
  }
  return (
    <div
      className={`flex items-center gap-3 px-3 py-2 rounded-2xl ${isAuthor ? 'bg-blue-700' : 'bg-green-800'} relative`}
      style={{ minWidth: 220 }}
    >
      {!isAuthor && <div className="mr-2">{avatar}</div>}
      <button onClick={togglePlay} className="text-white mr-2 flex-shrink-0">
        {playing ? <Pause /> : <Play />}
      </button>
      <div className="relative flex-1" style={{ minWidth: 120, maxWidth: 220 }}>
        <div ref={waveformRef} className="w-full" />
        <div className="absolute top-1/2 -translate-y-1/2" style={{ left: dotLeft }}>
          <span className="block w-3 h-3 bg-white rounded-full shadow" />
        </div>
      </div>
      <span className="text-gray-200 text-xs ml-2 w-10 text-right">
        {formatTimer(currentTime || audioDuration)}
      </span>
      {isAuthor && <div className="ml-2">{avatar}</div>}
    </div>
  )
}

function DiscussionShow({ discussion, messages: initialMessages, auth, allDiscussions }: any) {
  const [sending, setSending] = useState(false)
  const [filePreview, setFilePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [messages, setMessages] = useState(initialMessages)
  const [error, setError] = useState<string | null>(null)
  const { data, setData, post, reset } = useForm({
    content: '',
    type: 'text',
    fileUrl: '',
  })
  const userId = auth?.user?.id
  const socket = useSocket(userId)
  const [showCodeInput, setShowCodeInput] = useState(false)
  const [codeValue, setCodeValue] = useState('')
  // Menu contextuel
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; message: any } | null>(
    null
  )
  // Modal de forward
  const [forwardModal, setForwardModal] = useState<{ open: boolean; message: any } | null>(null)
  // Toast/feedback
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  // Historique modal
  const [historyModal, setHistoryModal] = useState<{
    open: boolean
    history: any[]
    current: any
  } | null>(null)
  const [plusMenuOpen, setPlusMenuOpen] = useState(false)
  const [recordingInputBar, setRecordingInputBar] = useState(false)

  // Ref pour le scroll automatique
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll automatique vers le bas à chaque ajout de message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Join/leave room
  useEffect(() => {
    if (!userId || !discussion?.id) return
    socket.joinDiscussion(discussion.id)
    return () => {
      socket.leaveDiscussion(discussion?.id)
    }
  }, [userId, discussion?.id])

  // Listen to socket events
  useEffect(() => {
    function handleNew(msg: any) {
      console.log('SOCKET message:new', msg)
      setMessages((prev: any) => {
        // Remplace le message temporaire si tempId match
        if (msg.tempId && prev.some((m: any) => m.tempId && m.tempId === msg.tempId)) {
          return prev.map((m: any) => (m.tempId === msg.tempId ? msg : m))
        }
        // Sinon, fallback sur l'ancienne logique
        if (
          msg.sender?.id === userId &&
          msg.content &&
          prev.some(
            (m: any) =>
              isTempId(m.id) &&
              m.content === msg.content &&
              m.type === msg.type &&
              m.fileUrl === msg.fileUrl
          )
        ) {
          return prev.map((m: any) =>
            isTempId(m.id) &&
            m.content === msg.content &&
            m.type === msg.type &&
            m.fileUrl === msg.fileUrl
              ? msg
              : m
          )
        }
        return [...prev, msg]
      })
    }
    function handleEdit(msg: any) {
      setMessages((prev: any) => prev.map((m: any) => (m.id === msg.id ? { ...m, ...msg } : m)))
    }
    function handleDelete(msg: any) {
      setMessages((prev: any) => prev.map((m: any) => (m.id === msg.id ? { ...m, ...msg } : m)))
    }
    socket.on('message:new', handleNew)
    socket.on('message:edit', handleEdit)
    socket.on('message:delete', handleDelete)
    return () => {
      socket.off('message:new', handleNew)
      socket.off('message:edit', handleEdit)
      socket.off('message:delete', handleDelete)
    }
  }, [socket, userId])

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setData(
      'type',
      f.type.startsWith('image') ? 'image' : f.type.startsWith('video') ? 'video' : 'file'
    )
    setFilePreview(URL.createObjectURL(f))
  }

  async function handleAudioRecorded(audioFile: File) {
    setFile(audioFile)
    setData('type', 'audio')
    setFilePreview(null)
    await handleSend({ preventDefault: () => {} } as React.FormEvent, audioFile)
  }

  async function handleSend(e: React.FormEvent, fileToSend?: File) {
    e.preventDefault()
    setSending(true)
    setError(null)
    let fileUrl = ''
    let tempId = `temp_${Math.random().toString(36).slice(2)}`
    const fileForUpload = fileToSend || file
    if (fileForUpload) {
      try {
        const presignRes = await axios.post('/api/upload/presign', {
          fileName: fileForUpload.name,
          mimeType: fileForUpload.type,
        })
        const { url, key } = presignRes.data
        console.log('presignRes', presignRes.data)
        await fetch(url, {
          method: 'PUT',
          body: fileForUpload,
          headers: { 'Content-Type': fileForUpload.type },
          credentials: 'same-origin',
        })
        fileUrl = key
      } catch (err) {
        setError("Erreur lors de l'upload du fichier")
        console.log('handleSend error', err)
        setSending(false)
        return
      }
    }
    // Optimistic UI
    const optimisticMsg = {
      ...data,
      fileUrl,
      discussionId: discussion.id || 0,
      sender: auth.user,
      status: 'sending',
      createdAt: new Date().toISOString(),
      id: tempId,
      tempId, // Ajoute tempId pour le matching
    }
    setMessages((prev: any) => [...prev, optimisticMsg])
    socket.sendMessage('message:send', optimisticMsg)
    console.log('Sending message with fileUrl:', fileUrl)
    try {
      await axios.post('/messages', {
        ...data,
        fileUrl,
        discussionId: discussion.id,
        tempId, // Passe tempId au backend
      })
      reset()
      setFile(null)
      setFilePreview(null)
    } catch (err) {
      setMessages((prev: any) =>
        prev.map((m: any) => (m.id === tempId ? { ...m, status: 'error' } : m))
      )
      setError("Erreur lors de l'envoi du message")
    }
    setSending(false)
  }

  function handleOpenCodeInput() {
    setShowCodeInput(true)
    setCodeValue('')
  }
  function handleCancelCodeInput() {
    setShowCodeInput(false)
    setCodeValue('')
  }
  async function handleSendCode() {
    setShowCodeInput(false)
    setFile(null)
    setFilePreview(null)
    setData('type', 'code')
    setData('content', codeValue)
    await handleSend({ preventDefault: () => {} } as React.FormEvent)
  }

  // Menu contextuel
  function handleContextMenu(e: React.MouseEvent, message: any) {
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY, message })
  }
  function handleCloseContextMenu() {
    setContextMenu(null)
  }
  async function handleCopy(msg: any) {
    if (msg.type === 'text' || msg.type === 'code') {
      await navigator.clipboard.writeText(msg.content)
    } else if (msg.fileUrl) {
      await navigator.clipboard.writeText(
        window.location.origin + `/api/upload/presign-view?key=${encodeURIComponent(msg.fileUrl)}`
      )
    }
  }
  async function handleEdit(msg: any) {
    if (msg.type === 'text' || msg.type === 'code') {
      const newContent = prompt('Modifier le message', msg.content)
      if (newContent && newContent !== msg.content) {
        try {
          await axios.put(`/messages/${msg.id}`, { content: newContent })
          setToast({ message: 'Message modifié', type: 'success' })
        } catch {
          setToast({ message: 'Erreur lors de la modification', type: 'error' })
        }
      }
    }
  }
  async function handleDelete(msg: any) {
    if (window.confirm('Supprimer ce message ?')) {
      try {
        await axios.delete(`/messages/${msg.id}`)
        setToast({ message: 'Message supprimé', type: 'success' })
      } catch {
        setToast({ message: 'Erreur lors de la suppression', type: 'error' })
      }
    }
  }
  function handleDownload(msg: any) {
    if (msg.fileUrl) {
      window.open(`/api/upload/presign-view?key=${encodeURIComponent(msg.fileUrl)}`)
    }
  }
  function handleProfile(msg: any) {
    window.open(`/@${msg.sender?.username || msg.sender?.id}`)
  }
  async function handleHistory(msg: any) {
    try {
      const res = await axios.get(`/messages/${msg.id}/history`)
      setHistoryModal({ open: true, history: res.data.history, current: msg })
    } catch {
      setToast({ message: "Erreur lors de la récupération de l'historique", type: 'error' })
    }
  }
  async function handleBan(msg: any) {
    if (window.confirm('Bannir cet utilisateur de la discussion ?')) {
      try {
        await axios.post(`/discussions/${discussion.id}/ban`, { userId: msg.sender.id })
        setToast({ message: 'Utilisateur banni', type: 'success' })
      } catch {
        setToast({ message: 'Erreur lors du bannissement', type: 'error' })
      }
    }
  }
  function handleForward(msg: any) {
    setForwardModal({ open: true, message: msg })
  }
  async function handleDoForward(targetDiscussionId: string) {
    if (!forwardModal) return
    try {
      await axios.post('/messages', {
        discussionId: targetDiscussionId,
        type: forwardModal.message.type,
        content: forwardModal.message.content,
        fileUrl: forwardModal.message.fileUrl,
      })
      setToast({ message: 'Message transféré', type: 'success' })
    } catch {
      setToast({ message: 'Erreur lors du transfert', type: 'error' })
    }
    setForwardModal(null)
  }

  return (
    <>
      <Head title={discussion.title + ' - Discussions'} />
      <Navbar />
      <div className="max-w-3xl mx-auto py-8 px-4 bg-gray-100 min-h-screen flex flex-col">
        <h1 className="text-2xl font-bold mb-2">{discussion.title}</h1>
        {discussion.banner && (
          <img
            src={discussion.banner}
            alt="banner"
            className="h-32 w-full object-cover rounded mb-4"
          />
        )}
        <div className="mb-6 text-gray-500 text-sm">
          Par {discussion.author?.name || discussion.author?.username}
        </div>
        <div
          className="flex-1 flex flex-col bg-white rounded shadow p-4 mb-6 max-h-[60vh] overflow-y-auto space-y-2"
          style={{ minHeight: 300 }}
        >
          {messages.length === 0 && (
            <div className="text-gray-400">Aucun message pour l'instant.</div>
          )}
          {messages.map((m: any, idx: number) => {
            const isAuthor = m.sender?.id === auth?.user?.id
            const isLastOfSeries =
              idx === messages.length - 1 || messages[idx + 1]?.sender?.id !== m.sender?.id
            const isFirstOfSeries = idx === 0 || messages[idx - 1]?.sender?.id !== m.sender?.id
            const isAdmin = auth?.user?.role === 'ADMIN'
            const canEdit = isAuthor && (m.type === 'text' || m.type === 'code')
            const canDelete = isAuthor || isAdmin
            const canDownload = !!m.fileUrl
            const canCopy = m.type === 'text' || m.type === 'code' || !!m.fileUrl
            const canProfile = !!m.sender
            const isDeleted = m.status === 'deleted'
            const isBanned = m.sender?.banned
            const actions = [
              {
                label: 'Copier',
                icon: '📋',
                onClick: () => handleCopy(m),
                disabled: !canCopy || isDeleted || isBanned,
              },
              {
                label: 'Éditer',
                icon: '✏️',
                onClick: () => handleEdit(m),
                disabled: !canEdit || isDeleted || isBanned,
              },
              {
                label: 'Supprimer',
                icon: '🗑️',
                onClick: () => handleDelete(m),
                disabled: !canDelete || isDeleted || isBanned,
              },
              {
                label: 'Télécharger',
                icon: '⬇️',
                onClick: () => handleDownload(m),
                disabled: !canDownload || isDeleted || isBanned,
              },
              {
                label: 'Voir le profil',
                icon: '👤',
                onClick: () => handleProfile(m),
                disabled: !canProfile,
              },
              {
                label: 'Transférer',
                icon: '🔀',
                onClick: () => handleForward(m),
                disabled: isDeleted || isBanned,
              },
              {
                label: 'Voir historique',
                icon: '🕓',
                onClick: () => handleHistory(m),
                disabled: false,
              },
              {
                label: 'Bannir',
                icon: '🚫',
                onClick: () => handleBan(m),
                disabled:
                  auth?.user?.role !== 'ADMIN' ||
                  m.sender?.id === auth?.user?.id ||
                  isDeleted ||
                  isBanned,
              },
            ]
            const bubbleColor = isAuthor
              ? 'bg-blue-600 text-white'
              : 'bg-primary-100 text-primary-900'
            // Avatar/initiales
            const avatar = auth.user?.avatar ? (
              <img
                src={auth.user.avatar}
                alt="avatar"
                className="h-7 w-7 rounded-full border-2 border-white shadow"
              />
            ) : (
              <div className="h-7 w-7 rounded-full bg-blue-700 text-white flex items-center justify-center font-bold text-sm border-2 border-white shadow">
                {getInitials(
                  isAuthor
                    ? auth.user?.name || auth.user?.username || ''
                    : m.sender?.name || m.sender?.username || ''
                )}
              </div>
            )
            return (
              <div
                key={m.id}
                className={`flex items-end ${isAuthor ? 'justify-end' : 'justify-start'} w-full mb-2`}
                onContextMenu={(e) => handleContextMenu(e, m)}
              >
                {console.log('m.type, ', m.type, m.fileUrl)}
                {/* Avatar ou espace réservé à gauche pour reçu, à droite pour envoyé */}
                {!isAuthor &&
                  (isLastOfSeries ? (
                    <div className="mr-2">{avatar}</div>
                  ) : isFirstOfSeries ? (
                    <div className="mr-2" style={{ width: 28, height: 28 }} />
                  ) : (
                    <div className="mr-2" style={{ width: 28 }} />
                  ))}
                <div
                  className={`relative max-w-[75%] rounded-2xl px-4 py-2 shadow-md ${bubbleColor} ${m.status === 'error' ? 'opacity-50' : ''}`}
                  style={{
                    borderBottomRightRadius: isAuthor ? 4 : 24,
                    borderBottomLeftRadius: isAuthor ? 24 : 4,
                  }}
                >
                  {/* Nom expéditeur au-dessus pour reçu */}
                  {!isAuthor && (
                    <div className="text-xs text-gray-500 mb-1">
                      {m.sender?.name || m.sender?.username}
                    </div>
                  )}
                  {m.type === 'text' && (
                    <div className="whitespace-pre-line">
                      {m.content}
                      {extractUrls(m.content).map((url, i) => (
                        <LinkPreview url={url} key={i} />
                      ))}
                    </div>
                  )}
                  {m.type === 'image' && m.fileUrl && (
                    <img
                      src={`/api/upload/presign-view?key=${encodeURIComponent(m.fileUrl)}`}
                      alt="media"
                      className="h-40 rounded mt-2 object-cover"
                    />
                  )}
                  {m.type === 'video' && m.fileUrl && (
                    <div className="relative mt-2">
                      {/* TODO: bouton download/loader/preview */}
                      <video
                        src={`/api/upload/presign-view?key=${encodeURIComponent(m.fileUrl)}`}
                        controls
                        className="h-40 rounded object-cover"
                        poster="/video-poster.png"
                      />
                    </div>
                  )}
                  {m.type === 'file' && m.fileUrl && (
                    <FileBox
                      name={m.fileName || 'Fichier'}
                      size={m.fileSize || 0}
                      url={`/api/upload/presign-view?key=${encodeURIComponent(m.fileUrl)}`}
                    />
                  )}
                  {m.type === 'audio' && m.fileUrl && (
                    <AudioMessageBubble url={`${m.fileUrl}`} avatar={avatar} isAuthor={isAuthor} />
                  )}
                  {m.type === 'code' && m.content && (
                    <div className="mt-2">
                      <SyntaxHighlighter
                        language="javascript"
                        style={oneDark}
                        customStyle={{ borderRadius: 6, fontSize: 14, padding: 12 }}
                      >
                        {m.content}
                      </SyntaxHighlighter>
                    </div>
                  )}
                  {/* Statut + heure */}
                  <div className="flex items-center justify-end gap-2 mt-1 text-xs">
                    <span className="text-gray-300">{format(new Date(m.createdAt), 'HH:mm')}</span>
                    {m.status === 'sending' && <span className="text-blue-200">⏳</span>}
                    {m.status === 'error' && <span className="text-red-500">Erreur</span>}
                    {m.status === 'edited' && <span className="text-gray-200">(édité)</span>}
                    {m.status === 'deleted' && <span className="text-red-200">(supprimé)</span>}
                  </div>
                  {/* Menu contextuel */}
                  {contextMenu && contextMenu.message.id === m.id && (
                    <ContextMenu
                      x={contextMenu.x}
                      y={contextMenu.y}
                      actions={actions}
                      onClose={handleCloseContextMenu}
                    />
                  )}
                </div>
                {isAuthor &&
                  (isLastOfSeries ? (
                    <div className="ml-2">{avatar}</div>
                  ) : isFirstOfSeries ? (
                    <div className="ml-2" style={{ width: 28, height: 28 }} />
                  ) : (
                    <div className="ml-2" style={{ width: 28 }} />
                  ))}
              </div>
            )
          })}
          {/* Ancre pour le scroll automatique */}
          <div ref={messagesEndRef} />
        </div>
        {error && <div className="text-red-500 mb-2">{error}</div>}
        <form
          onSubmit={handleSend}
          className="flex items-center gap-2 bg-primary-900 rounded-full px-3 py-2 shadow mt-2 relative"
        >
          {/* Bouton + pour fichiers */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setPlusMenuOpen((v) => !v)}
              className="text-gray-400 hover:text-blue-500 text-2xl mr-2 flex items-center justify-center"
            >
              <Plus className="w-6 h-6" />
            </button>
            <PlusMenu
              open={plusMenuOpen}
              onClose={() => setPlusMenuOpen(false)}
              onSelect={(type) => {
                if (type === 'file' || type === 'media') fileInputRef.current?.click()
                // Ajoute ici d'autres actions selon le type
              }}
            />
          </div>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
            accept="image/*,video/*,audio/*"
          />
          {/* Zone de texte masquée si enregistrement */}
          {!recordingInputBar && (
            <textarea
              className="flex-1 bg-transparent border-none outline-none text-primary-200 resize-none px-2 placeholder-gray-400"
              rows={1}
              placeholder="Écrire un message..."
              value={data.content}
              onChange={(e) => setData('content', e.target.value)}
              disabled={sending}
              style={{ minHeight: 36, maxHeight: 120 }}
            />
          )}
          {/* Emoji */}
          {!recordingInputBar && (
            <button
              type="button"
              className="text-gray-400 hover:text-yellow-400 text-2xl mx-2 flex items-center justify-center"
            >
              <Smile className="w-6 h-6" />
            </button>
          )}
          {/* Audio/Envoyer dynamique */}
          {data.content.trim() ? (
            <button
              type="submit"
              className="bg-primary-600 hover:bg-primary-700 text-primary-200 rounded-full p-2 ml-2 flex items-center justify-center text-xl"
              disabled={sending}
            >
              <Send className="w-5 h-5" />
            </button>
          ) : (
            <VoiceRecorderBar
              onSend={handleAudioRecorded}
              disabled={sending}
              onRecordingChange={setRecordingInputBar}
            />
          )}
          {/* Code */}
          {!recordingInputBar && (
            <button
              type="button"
              onClick={handleOpenCodeInput}
              className="bg-primary-700 text-primary-200 px-2 py-1 rounded-full font-mono text-lg ml-2 flex items-center justify-center"
            >
              {'</>'}
            </button>
          )}
        </form>
        {/* Modal de forward */}
        <ForwardModal
          open={!!forwardModal}
          onClose={() => setForwardModal(null)}
          onForward={handleDoForward}
          discussions={allDiscussions || []}
          message={forwardModal?.message}
        />
        {/* Toast/feedback */}
        {toast && (
          <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        )}
        {/* Historique modal */}
        {historyModal && historyModal.open && (
          <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
            <div className="bg-white rounded shadow p-6 min-w-[350px] max-w-lg">
              <h3 className="font-bold mb-2">Historique du message</h3>
              <HistoryTimeline history={historyModal.history} current={historyModal.current} />
              <button
                className="mt-4 bg-gray-600 text-white px-4 py-2 rounded"
                onClick={() => setHistoryModal(null)}
              >
                Fermer
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default function Page(props: any) {
  return (
    <Provider>
      <DiscussionShow {...props} />
    </Provider>
  )
}
