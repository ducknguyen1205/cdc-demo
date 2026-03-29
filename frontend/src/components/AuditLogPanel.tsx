import { useEffect, useRef, useState } from 'react'
import { auditLogApi } from '../api/auditLogs'
import type { CdcEvent, Operation } from '../types/CdcEvent'

const OP_BADGE: Record<Operation, string> = {
  INSERT:   'bg-green-900 text-green-300',
  UPDATE:   'bg-blue-900 text-blue-300',
  DELETE:   'bg-red-900 text-red-300',
  SNAPSHOT: 'bg-gray-700 text-gray-300',
}

const OP_ROW: Record<Operation, string> = {
  INSERT:   'border-l-green-600',
  UPDATE:   'border-l-blue-600',
  DELETE:   'border-l-red-600',
  SNAPSHOT: 'border-l-gray-600',
}

interface Props {
  liveEvents: CdcEvent[]  // streamed from WebSocket in App.tsx
}

export function AuditLogPanel({ liveEvents }: Props) {
  const [logs, setLogs]           = useState<CdcEvent[]>([])
  const [totalCount, setTotal]    = useState<number>(0)
  const [loading, setLoading]     = useState(true)
  const [expanded, setExpanded]   = useState<string | null>(null)
  const seenIds                   = useRef<Set<string>>(new Set())

  const load = async () => {
    setLoading(true)
    try {
      const [data, count] = await Promise.all([auditLogApi.list(), auditLogApi.count()])
      setLogs(data)
      setTotal(count)
      seenIds.current = new Set(data.map((e) => e.eventId))
    } finally {
      setLoading(false)
    }
  }

  // Load history from MongoDB on mount
  useEffect(() => { load() }, [])

  // Prepend new live events that aren't already in the list
  useEffect(() => {
    if (liveEvents.length === 0) return
    const newest = liveEvents[0]
    if (!seenIds.current.has(newest.eventId)) {
      seenIds.current.add(newest.eventId)
      setLogs((prev) => [newest, ...prev])
      setTotal((n) => n + 1)
    }
  }, [liveEvents])

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 mt-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <span className="font-bold text-sm text-gray-200">Audit Log</span>
          <span className="text-xs text-gray-500">
            stored in <span className="text-green-400 font-mono">MongoDB</span>
            {' · '}cdcaudit.audit_logs
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="text-gray-400">
            Total records: <span className="text-white font-bold">{totalCount}</span>
          </span>
          <button
            onClick={load}
            disabled={loading}
            className="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors disabled:opacity-50"
          >
            {loading ? 'Loading…' : '↺ Refresh'}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-700">
              <th className="pb-2 pr-4 font-semibold">Time</th>
              <th className="pb-2 pr-4 font-semibold">Operation</th>
              <th className="pb-2 pr-4 font-semibold">Table</th>
              <th className="pb-2 pr-4 font-semibold">Row ID</th>
              <th className="pb-2 pr-4 font-semibold">LSN</th>
              <th className="pb-2 pr-4 font-semibold">txId</th>
              <th className="pb-2 font-semibold">Before / After</th>
            </tr>
          </thead>
          <tbody>
            {loading && logs.length === 0 && (
              <tr>
                <td colSpan={7} className="py-8 text-center text-gray-600">Loading audit logs from MongoDB…</td>
              </tr>
            )}
            {!loading && logs.length === 0 && (
              <tr>
                <td colSpan={7} className="py-8 text-center text-gray-600">
                  No audit logs yet. Add, edit, or delete a product to generate events.
                </td>
              </tr>
            )}
            {logs.map((entry) => {
              const rowId = entry.after?.id ?? entry.before?.id
              const isExpanded = expanded === entry.eventId
              const style = OP_ROW[entry.operation] ?? OP_ROW.SNAPSHOT

              return (
                <>
                  <tr
                    key={entry.eventId}
                    className={`border-b border-gray-800 border-l-2 ${style} hover:bg-gray-800/40 transition-colors cursor-pointer`}
                    onClick={() => setExpanded(isExpanded ? null : entry.eventId)}
                  >
                    <td className="py-2 pr-4 text-gray-500 whitespace-nowrap">
                      {new Date(entry.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-2 pr-4">
                      <span className={`px-2 py-0.5 rounded font-bold text-xs ${OP_BADGE[entry.operation] ?? OP_BADGE.SNAPSHOT}`}>
                        {entry.operation}
                      </span>
                    </td>
                    <td className="py-2 pr-4 text-gray-300">{entry.tableName}</td>
                    <td className="py-2 pr-4 text-gray-400">{rowId !== undefined ? String(rowId) : '—'}</td>
                    <td className="py-2 pr-4 text-gray-500 font-mono">{entry.lsn ?? '—'}</td>
                    <td className="py-2 pr-4 text-gray-500">{entry.txId ?? '—'}</td>
                    <td className="py-2 text-gray-600 select-none">{isExpanded ? '▲ hide' : '▼ show'}</td>
                  </tr>

                  {isExpanded && (
                    <tr key={`${entry.eventId}-detail`} className="border-b border-gray-800 bg-gray-950">
                      <td colSpan={7} className="px-3 py-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <div className="text-gray-600 mb-1 font-bold text-xs">BEFORE</div>
                            <pre className="bg-gray-900 rounded p-2 text-gray-400 overflow-x-auto text-xs leading-relaxed">
                              {entry.before ? JSON.stringify(entry.before, null, 2) : 'null'}
                            </pre>
                          </div>
                          <div>
                            <div className="text-gray-600 mb-1 font-bold text-xs">AFTER</div>
                            <pre className="bg-gray-900 rounded p-2 text-gray-400 overflow-x-auto text-xs leading-relaxed">
                              {entry.after ? JSON.stringify(entry.after, null, 2) : 'null'}
                            </pre>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              )
            })}
          </tbody>
        </table>
      </div>

      {logs.length > 0 && (
        <p className="mt-2 text-xs text-gray-700 text-right">
          Showing last {logs.length} of {totalCount} total records
        </p>
      )}
    </div>
  )
}
