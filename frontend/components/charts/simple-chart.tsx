'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'

interface SimpleChartProps {
  data: any[]
  type?: 'bar' | 'line' | 'pie'
  dataKey: string
  nameKey: string
  colors?: string[]
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']

export function SimpleChart({ data, type = 'bar', dataKey, nameKey, colors = COLORS }: SimpleChartProps) {
  if (type === 'pie') {
    // Filter out zero values to prevent overlapping labels
    const filteredData = data.filter((entry) => entry[dataKey] > 0)
    
    // Custom label renderer that only shows labels for significant slices
    const renderLabel = ({ name, percent, value }: any) => {
      // Only show label if percentage is significant (> 5%) or if it's the only slice
      if (percent < 0.05 && filteredData.length > 1) {
        return ''
      }
      return `${name} ${(percent * 100).toFixed(0)}%`
    }

    return (
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={filteredData}
            cx="50%"
            cy="50%"
            labelLine={true}
            label={renderLabel}
            outerRadius={80}
            fill="#8884d8"
            dataKey={dataKey}
            nameKey={nameKey}
          >
            {filteredData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: any, name: any) => [`${value}`, name]}
            contentStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.8)', border: 'none', borderRadius: '4px' }}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            formatter={(value) => {
              const entry = filteredData.find((d: any) => d[nameKey] === value)
              return entry ? `${value} (${entry[dataKey]})` : value
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    )
  }

  if (type === 'line') {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={nameKey} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey={dataKey} stroke={colors[0]} />
        </LineChart>
      </ResponsiveContainer>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={nameKey} />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey={dataKey} fill={colors[0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

