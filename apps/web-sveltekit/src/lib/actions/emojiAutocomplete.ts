import { searchEmojis } from '$lib/data/emojis'

export type EmojiMatch = { shortcode: string; emoji: string }

export type EmojiAutocompleteState = {
  open: boolean
  query: string
  results: EmojiMatch[]
  triggerStart: number
  selectedIndex: number
}

export type EmojiAutocompleteEvents = {
  'emoji:open': CustomEvent<EmojiAutocompleteState>
  'emoji:close': CustomEvent<void>
  'emoji:select': CustomEvent<EmojiMatch>
}

// Returns the :query text immediately before the caret, or null if not in a trigger
function getTrigger(el: HTMLInputElement | HTMLTextAreaElement): { query: string; start: number } | null {
  const pos = el.selectionStart ?? 0
  const text = el.value.slice(0, pos)
  const match = text.match(/:([a-zA-Z0-9_+\-]*)$/)
  if (!match) return null
  return { query: match[1], start: pos - match[0].length }
}

export function emojiAutocomplete(node: HTMLInputElement | HTMLTextAreaElement) {
  let state: EmojiAutocompleteState = {
    open: false, query: '', results: [], triggerStart: 0, selectedIndex: 0,
  }

  function emit(type: string, detail?: any) {
    node.dispatchEvent(new CustomEvent(type, { detail, bubbles: false }))
  }

  function open(query: string, start: number) {
    const results = searchEmojis(query)
    if (!results.length) { close(); return }
    state = { open: true, query, results, triggerStart: start, selectedIndex: 0 }
    emit('emoji:open', state)
  }

  function close() {
    if (!state.open) return
    state = { ...state, open: false }
    emit('emoji:close')
  }

  function select(match: EmojiMatch) {
    const before = node.value.slice(0, state.triggerStart)
    const after = node.value.slice((node.selectionStart ?? 0))
    node.value = before + match.emoji + after
    // Move caret after the inserted emoji
    const newPos = before.length + match.emoji.length
    node.setSelectionRange(newPos, newPos)
    node.dispatchEvent(new Event('input', { bubbles: true }))
    close()
    emit('emoji:select', match)
    node.focus()
  }

  function onInput() {
    const trigger = getTrigger(node)
    if (!trigger) { close(); return }
    if (trigger.query.length === 0) { close(); return }
    open(trigger.query, trigger.start)
  }

  function onKeydown(e: KeyboardEvent) {
    if (!state.open) return
    if (e.key === 'Escape') { e.preventDefault(); close(); return }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      state = { ...state, selectedIndex: (state.selectedIndex + 1) % state.results.length }
      emit('emoji:open', state)
      return
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      state = { ...state, selectedIndex: (state.selectedIndex - 1 + state.results.length) % state.results.length }
      emit('emoji:open', state)
      return
    }
    if (e.key === 'Enter' || e.key === 'Tab') {
      if (state.results.length) {
        e.preventDefault()
        select(state.results[state.selectedIndex])
      }
    }
  }

  function onBlur() {
    // Small delay so click on dropdown registers first
    setTimeout(close, 150)
  }

  node.addEventListener('input', onInput)
  node.addEventListener('keydown', onKeydown)
  node.addEventListener('blur', onBlur)

  // Expose select so the dropdown component can call it
  ;(node as any).__emojiSelect = select
  ;(node as any).__emojiClose = close

  return {
    destroy() {
      node.removeEventListener('input', onInput)
      node.removeEventListener('keydown', onKeydown)
      node.removeEventListener('blur', onBlur)
    },
  }
}
