import { useEffect, useRef, useState } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import type { CdcEvent } from '../types/CdcEvent'

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected'

const MAX_EVENTS = 50

export function useWebSocket() {
  const [events, setEvents] = useState<CdcEvent[]>([])
  const [status, setStatus] = useState<ConnectionStatus>('connecting')
  const clientRef = useRef<Client | null>(null)

  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS('/ws'),
      reconnectDelay: 3000,
      onConnect: () => {
        setStatus('connected')
        client.subscribe('/topic/cdc-events', (message) => {
          const event: CdcEvent = JSON.parse(message.body)
          setEvents((prev) => [event, ...prev].slice(0, MAX_EVENTS))
        })
      },
      onDisconnect: () => setStatus('disconnected'),
      onStompError: () => setStatus('disconnected'),
    })

    client.activate()
    clientRef.current = client

    return () => {
      client.deactivate()
    }
  }, [])

  const clearEvents = () => setEvents([])

  return { events, status, clearEvents }
}
