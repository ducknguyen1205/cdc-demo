import { useWebSocket } from './hooks/useWebSocket'
import { PipelineDiagram } from './components/PipelineDiagram'
import { ProductTable } from './components/ProductTable'
import { EventStream } from './components/EventStream'

export default function App() {
  const { events, status, clearEvents } = useWebSocket()
  const latestEvent = events[0] ?? null

  // Count streaming (non-snapshot) events
  const streamingCount = events.filter((e) => e.operation !== 'SNAPSHOT').length

  return (
    <div className="min-h-screen flex flex-col p-4 max-w-screen-2xl mx-auto">
      {/* Header */}
      <header className="mb-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              PostgreSQL CDC Demo
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Change Data Capture with Debezium Embedded + WebSocket
            </p>
          </div>
          <div className="flex gap-4 text-xs text-gray-400">
            <span>
              Total events: <span className="text-white font-bold">{events.length}</span>
            </span>
            <span>
              Streaming: <span className="text-green-400 font-bold">{streamingCount}</span>
            </span>
          </div>
        </div>
      </header>

      {/* Pipeline Visualization */}
      <PipelineDiagram latestEvent={latestEvent} />

      {/* Main content: table + event stream */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[55%_45%] gap-4 min-h-0">
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 overflow-auto">
          <ProductTable />
        </div>
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 overflow-hidden flex flex-col" style={{ maxHeight: 'calc(100vh - 280px)' }}>
          <EventStream events={events} status={status} onClear={clearEvents} />
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-4 text-center text-xs text-gray-700">
        DB change → WAL write → Debezium reads replication slot → WebSocket push → UI update
      </footer>
    </div>
  )
}
