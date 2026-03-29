import type { CdcEvent, Operation } from '../types/CdcEvent'
import { EventCard } from './EventCard'
import type { ConnectionStatus } from '../hooks/useWebSocket'

const STATUS_DOT: Record<ConnectionStatus, string> = {
  connecting:   'bg-yellow-400 animate-pulse',
  connected:    'bg-green-400',
  disconnected: 'bg-red-500',
}

interface Props {
  events: CdcEvent[]
  status: ConnectionStatus
  onClear: () => void
}

export function EventStream({ events, status, onClear }: Props) {
  const counts = events.reduce<Record<Operation, number>>(
    (acc, e) => { acc[e.operation] = (acc[e.operation] ?? 0) + 1; return acc },
    {} as Record<Operation, number>
  )

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${STATUS_DOT[status]}`} />
          <span className="font-bold text-sm text-gray-200">Live CDC Events</span>
          <span className="text-xs text-gray-500 capitalize">({status})</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-2 text-xs">
            {counts.INSERT   && <span className="text-green-400">{counts.INSERT}  INS</span>}
            {counts.UPDATE   && <span className="text-blue-400">{counts.UPDATE}   UPD</span>}
            {counts.DELETE   && <span className="text-red-400">{counts.DELETE}    DEL</span>}
            {counts.SNAPSHOT && <span className="text-gray-400">{counts.SNAPSHOT} SNAP</span>}
          </div>
          {events.length > 0 && (
            <button
              onClick={onClear}
              className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
            >
              clear
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {events.length === 0 ? (
          <div className="text-center text-gray-600 text-sm mt-12">
            <p className="text-3xl mb-3">📡</p>
            <p>Waiting for CDC events…</p>
            <p className="mt-1 text-xs">Add, edit, or delete a product to see events appear here.</p>
          </div>
        ) : (
          events.map((e) => <EventCard key={e.eventId} event={e} />)
        )}
      </div>
    </div>
  )
}
