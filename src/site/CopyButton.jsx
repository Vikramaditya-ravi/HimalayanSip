import { useEffect, useRef, useState } from 'react'

/**
 * Copy-to-clipboard control for a contact value.
 *
 * A desktop visitor clicking "Call the sales desk" gets a tel: handoff to
 * whatever app the OS picked, which is usually not what they wanted — they
 * wanted the number, to dial on a phone or paste into a CRM. This gives them
 * that without leaving the page.
 *
 * It renders as a SIBLING of the row's anchor, not inside it: a <button> nested
 * in an <a> is invalid HTML, and browsers recover from it by splitting the
 * anchor, which would break both the link and the delegated analytics that read
 * its href.
 */

/**
 * The old synchronous copy: a throwaway textarea, selected, then execCommand.
 * Deprecated, universally supported, and — unlike the async API — it cannot
 * leave a promise pending, which is the property that matters here.
 */
function copySync(text) {
  try {
    const node = document.createElement('textarea')
    node.value = text
    node.setAttribute('readonly', '')
    node.style.cssText = 'position:fixed;top:0;left:0;opacity:0;pointer-events:none'
    document.body.appendChild(node)
    node.select()
    node.setSelectionRange(0, text.length)
    const ok = document.execCommand('copy')
    node.remove()
    return ok
  } catch {
    return false
  }
}

/**
 * Write to the clipboard without ever hanging.
 *
 * navigator.clipboard.writeText can sit unresolved indefinitely when the
 * clipboard-write permission is neither granted nor denied — it neither
 * fulfils nor rejects, so awaiting it plainly means the button never reports
 * anything back and the visitor cannot tell whether it worked. Observed
 * happening, not theorised.
 *
 * So the promise is raced against a short timer and the synchronous path picks
 * up whatever it drops.
 */
async function writeClipboard(text) {
  if (navigator.clipboard?.writeText) {
    const result = await Promise.race([
      navigator.clipboard.writeText(text).then(() => true, () => false),
      new Promise((resolve) => setTimeout(() => resolve(false), 400)),
    ])
    if (result) return true
  }
  return copySync(text)
}

export function CopyButton({ value, label, placement = 'contact_panel', className = '' }) {
  // null = idle, true = copied, false = failed. Failure gets its own state
  // rather than borrowing the success one: telling someone their number is on
  // the clipboard when it is not is worse than telling them nothing.
  const [state, setState] = useState(null)
  const timer = useRef(0)

  useEffect(() => () => clearTimeout(timer.current), [])

  const copy = async () => {
    const ok = await writeClipboard(value)
    setState(ok)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setState(null), 1800)
  }

  const copied = state === true
  const failed = state === false

  return (
    <button
      type="button"
      className={className ? `ch-copy ${className}` : 'ch-copy'}
      data-state={copied ? 'copied' : failed ? 'failed' : undefined}
      onClick={copy}
      // The label is the live region here: aria-live on a control this small
      // would be more interruption than it is worth, but the name changing
      // means a screen reader reports the result on next focus.
      aria-label={copied ? `${label} copied` : failed ? `Could not copy ${label}` : `Copy ${label}`}
      data-evt="contact_intent_clicked"
      data-evt-props={JSON.stringify({ channel: 'copy', placement })}
    >
      {copied ? (
        <>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M4 12.5 9.5 18 20 6.5" />
          </svg>
          Copied
        </>
      ) : failed ? (
        'Press Ctrl+C'
      ) : (
        <>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="9" y="9" width="12" height="12" rx="2.5" />
            <path d="M15 6V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h1" />
          </svg>
          Copy
        </>
      )}
    </button>
  )
}
