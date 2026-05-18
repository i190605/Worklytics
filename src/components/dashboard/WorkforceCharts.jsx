import { memo, useMemo } from 'react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'

const PIE_COLORS = ['#2563eb', '#0ea5e9', '#22c55e', '#f59e0b', '#f43f5e', '#8b5cf6']

function WorkforceChartsBase({ departments }) {
  const topDepartments = useMemo(() => departments.slice(0, 6), [departments])
  const pieData = useMemo(
    () =>
      topDepartments.map((dept) => ({
        name: dept.name,
        value: dept.totalEmployees,
      })),
    [topDepartments],
  )

  return (
    <section className="charts-grid">
      <article className="panel chart-panel">
        <h2>Localization by Team</h2>
        <div className="chart-wrap">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={topDepartments}>
              <CartesianGrid strokeDasharray="4 4" stroke="#dbe5ff" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="localEmployees" name="Local" fill="#2563eb" radius={[6, 6, 0, 0]} />
              <Bar dataKey="externalEmployees" name="Global" fill="#7dd3fc" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </article>

      <article className="panel chart-panel">
        <h2>Headcount Distribution</h2>
        <div className="chart-wrap">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={56}
                outerRadius={94}
                paddingAngle={2}
                dataKey="value"
                nameKey="name"
              >
                {pieData.map((entry, index) => (
                  <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </article>
    </section>
  )
}

export const WorkforceCharts = memo(WorkforceChartsBase)