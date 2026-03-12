import { useEffect } from 'react'
import { listen } from '@tauri-apps/api/event'
import { useSessionStore } from '../stores/sessionStore'
import type { SessionOutputEvent, SessionStatusEvent } from '../types'

export function useSessionEvents() {
  const { appendOutput, updateSessionStatus } = useSessionStore()

  useEffect(() => {
    let unlistenOutput: (() => void) | undefined
    let unlistenStatus: (() => void) | undefined

    listen<SessionOutputEvent>('session-output', (event) => {
      appendOutput(event.payload.session_id, event.payload.line)
    }).then((fn) => {
      unlistenOutput = fn
    })

    listen<SessionStatusEvent>('session-status-changed', (event) => {
      updateSessionStatus(event.payload.session_id, event.payload.status)
    }).then((fn) => {
      unlistenStatus = fn
    })

    return () => {
      unlistenOutput?.()
      unlistenStatus?.()
    }
  }, [appendOutput, updateSessionStatus])
}
