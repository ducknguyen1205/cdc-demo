import { useState } from 'react'
import type { CdcEvent, Operation } from '../types/CdcEvent'

const OP_STYLES: Record<Operation, { border: string; badge: string; label: string }> = {
  INSERT:   { border: 'border-l-green-500',  badge: 'bg-green-900 text-green-300',  label: 'INSERT' },
  UPDATE:   { border: 'border-l-blue-500',   badge: 'bg-blue-900 text-blue-300',    label: 'UPDATE' },
  DELETE:   { border: 'border-l-red-500',    badge: 'bg-red-900 text-red-300',      label: 'DELETE' },
  SNAPSHOT: { border: 'border-l-gray-500',   badge: 'bg-gray-700 text-gray-300',    label: 'SNAPSHOT' },
}

interface Props {
  event: CdcEvent
}

export function EventCard({ event }: Props) {
  const [expanded, setExpanded] = useState(false)
  const style = OP_STYLES[event.operation] ?? OP_STYLES.SNAPSHOT

  const rowId = event.after?.id ?? event.before?.id

  return (
    <div className={`border border-gray-700 border-l-4 ${style.border} bg-gray-900 rounded-lg p-3 text-xs`}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`px-2 py-0.5 rounded font-bold text-xs ${style.badge}`}>
            {style.label}
          </span>
          <span className="text-gray-300 font-semibold">
            {event.tableName}
            {rowId !== undefined ? <span className="text-gray-500"> #{String(rowId)}</span> : null}
          </span>
        </div>
        <span className="text-gray-600 flex-shrink-0">
          {new Date(event.timestamp).toLocaleTimeString()}
        </span>
      </div>

      <div className="mt-2 flex flex-wrap gap-3 text-gray-500">
        {event.lsn && (
          <span title="WAL Log Sequence Number — a unique offset in the Write-Ahead Log">
            LSN: <span className="text-gray-400 font-mono">{event.lsn}</span>
          </span>
        )}
        {event.txId && (
          <span title="PostgreSQL transaction ID">
            txId: <span className="text-gray-400">{event.txId}</span>
          </span>
        )}
      </div>

      {(event.before || event.after) && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-2 text-gray-500 hover:text-gray-300 transition-colors"
        >
          {expanded ? '▲ hide' : '▼ show'} before / after
        </button>
      )}

      {expanded && (
        <div className="mt-2 grid grid-cols-2 gap-2">
          <div>
            <div className="text-gray-600 mb-1 font-bold">BEFORE</div>
            <pre className="bg-gray-950 rounded p-2 text-gray-400 overflow-x-auto text-xs leading-relaxed">
              {event.before ? JSON.stringify(event.before, null, 2) : 'null'}
            </pre>
          </div>
          <div>
            <div className="text-gray-600 mb-1 font-bold">AFTER</div>
            <pre className="bg-gray-950 rounded p-2 text-gray-400 overflow-x-auto text-xs leading-relaxed">
              {event.after ? JSON.stringify(event.after, null, 2) : 'null'}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}
