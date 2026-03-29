import { useEffect, useState } from 'react'
import type { CdcEvent } from '../types/CdcEvent'

interface Stage {
  id: string
  label: string
  sublabel: string
  icon: string
}

const STAGES: Stage[] = [
  { id: 'postgres',  label: 'PostgreSQL',      sublabel: 'Source database',      icon: '🐘' },
  { id: 'wal',       label: 'WAL / pgoutput',   sublabel: 'Write-Ahead Log',      icon: '📜' },
  { id: 'debezium',  label: 'Debezium Engine',  sublabel: 'Logical decoding',     icon: '⚙️' },
  { id: 'websocket', label: 'WebSocket',        sublabel: 'STOMP / SockJS',       icon: '🔌' },
  { id: 'ui',        label: 'React UI',         sublabel: 'Live event stream',    icon: '🖥️' },
]

interface Props {
  latestEvent: CdcEvent | null
}

export function PipelineDiagram({ latestEvent }: Props) {
  const [activeStageIndex, setActiveStageIndex] = useState<number>(-1)

  useEffect(() => {
    if (!latestEvent) return

    // Animate through each stage sequentially when a new event arrives
    let index = 0
    const advance = () => {
      setActiveStageIndex(index)
      index++
      if (index < STAGES.length) {
        setTimeout(advance, 320)
      } else {
        setTimeout(() => setActiveStageIndex(-1), 400)
      }
    }
    advance()
  }, [latestEvent])

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-5 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs font-bold uppercase tracking-widest text-gray-400">CDC Pipeline</span>
        {latestEvent && (
          <span className="ml-2 px-2 py-0.5 rounded text-xs bg-green-900 text-green-300 animate-pulse">
            Event flowing
          </span>
        )}
      </div>

      <div className="flex items-center justify-between gap-1">
        {STAGES.map((stage, i) => (
          <div key={stage.id} className="flex items-center flex-1">
            {/* Stage box */}
            <div
              className={`
                flex-1 rounded-lg border px-3 py-3 text-center transition-all duration-200
                ${activeStageIndex === i
                  ? 'stage-active border-green-400 bg-green-900/40'
                  : 'border-gray-600 bg-gray-800 text-gray-300'}
              `}
            >
              <div className="text-2xl mb-1">{stage.icon}</div>
              <div className="text-xs font-bold leading-tight">{stage.label}</div>
              <div className="text-xs text-gray-500 mt-0.5 leading-tight">{stage.sublabel}</div>
            </div>

            {/* Arrow between stages */}
            {i < STAGES.length - 1 && (
              <div
                className={`
                  flex-shrink-0 mx-1 text-lg font-bold transition-colors duration-200
                  ${activeStageIndex === i ? 'text-green-400' : 'text-gray-600'}
                `}
              >
                →
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Educational description */}
      <div className="mt-4 grid grid-cols-5 gap-1 text-center">
        {STAGES.map((stage, i) => {
          const descriptions = [
            'You INSERT / UPDATE / DELETE rows via the table below',
            'PostgreSQL writes every change to the Write-Ahead Log',
            'Debezium reads the logical replication slot (pgoutput)',
            'Change events are pushed over STOMP WebSocket',
            'React receives the event and updates the stream',
          ]
          return (
            <p key={stage.id} className={`text-xs px-1 leading-tight transition-colors duration-200 ${activeStageIndex === i ? 'text-green-300' : 'text-gray-600'}`}>
              {descriptions[i]}
            </p>
          )
        })}
      </div>
    </div>
  )
}
