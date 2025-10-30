import { useState, KeyboardEvent } from 'react'

interface TagInputProps {
  value: string[]
  onChange: (tags: string[]) => void
}

export default function TagInput({ value, onChange }: TagInputProps) {
  const [input, setInput] = useState('')

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if ((e.key === 'Enter' || e.key === ',' || e.key === ' ') && input.trim()) {
      e.preventDefault()
      if (value.length >= 3) return
      if (!value.includes(input.trim())) {
        onChange([...value, input.trim()])
      }
      setInput('')
    } else if (e.key === 'Backspace' && !input && value.length) {
      onChange(value.slice(0, -1))
    }
  }

  function removeTag(tag: string) {
    onChange(value.filter(t => t !== tag))
  }

  return (
    <div className="flex mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm">
      {value.map((tag) => (
        <span
          key={tag}
          className="flex items-center bg-indigo-100 text-indigo-700 rounded px-2 mx-1 text-xs"
        >
          {tag}
          <button
            type="button"
            className="ml-1 text-indigo-400 hover:text-red-500"
            onClick={() => removeTag(tag)}
          >
            &times;
          </button>
        </span>
      ))}
      <input
        type="text"
        className={`flex-1 border-none outline-none text-sm min-w-[80px] ${value.length >= 3 ? 'opacity-50 cursor-not-allowed' : ''}`}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={value.length ? '' : 'Ajouter un tag...'}
        disabled={value.length >= 3}

      />
      <div className="flex items-center">
        <span className="ml-2 text-xs text-gray-500">{value.length}/3</span>
      </div>
    </div>
  )
} 