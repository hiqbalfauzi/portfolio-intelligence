'use client'

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine,
} from 'recharts'

export interface PerPoint { year: string; PER: number | null }

export function PerHistoryChart({ data, avgPer }: { data: PerPoint[]; avgPer: number | null }) {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
          <XAxis dataKey="year" />
          <YAxis />
          <Tooltip formatter={(value) => `${value}x`} />
          <Legend />
          {avgPer != null && (
            <ReferenceLine y={+avgPer.toFixed(2)} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: `Rata² ${avgPer.toFixed(1)}x`, fill: '#f59e0b', fontSize: 12 }} />
          )}
          <Bar dataKey="PER" name="PER" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
