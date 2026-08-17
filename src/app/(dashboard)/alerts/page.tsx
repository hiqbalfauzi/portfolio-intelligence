import { prisma } from '@/lib/prisma'
import { Card, CardHeader, CardContent } from '@/components/Card'
import { Bell, AlertTriangle, Info, CheckCircle, AlertCircle } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AlertsPage() {
  const alerts = await prisma.alertEvent.findMany({
    take: 50,
    orderBy: { createdAt: 'desc' },
    include: {
      rule: true,
    },
  })

  const rules = await prisma.alertRule.findMany({
    orderBy: { createdAt: 'desc' },
  })

  const unreadCount = alerts.filter(a => !a.isRead).length
  const criticalCount = alerts.filter(a => a.rule.priority === 'CRITICAL').length
  const reviewCount = alerts.filter(a => a.rule.priority === 'REVIEW').length

  const priorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
      case 'REVIEW': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
      default: return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
    }
  }

  const priorityIcon = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return <AlertTriangle className="h-4 w-4" />
      case 'REVIEW': return <AlertCircle className="h-4 w-4" />
      default: return <Info className="h-4 w-4" />
    }
  }

  const fmt = (date: Date) => {
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Alerts</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Notifikasi dan peringatan untuk portofolio Anda</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-blue-100 dark:bg-blue-900/30 p-2">
                <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{unreadCount}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Belum Dibaca</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-red-100 dark:bg-red-900/30 p-2">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{criticalCount}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Kritis</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-yellow-100 dark:bg-yellow-900/30 p-2">
                <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{reviewCount}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Perlu Ditinjau</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alert Rules */}
      <Card>
        <CardHeader title="Alert Rules" description="Aturan alert yang aktif" />
        <CardContent>
          {rules.length > 0 ? (
            <div className="space-y-2">
              {rules.map((rule) => (
                <div key={rule.id} className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 p-3">
                  <div className="flex items-center gap-3">
                    <div className={`rounded-full p-1.5 ${priorityColor(rule.priority)}`}>
                      {priorityIcon(rule.priority)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{rule.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{rule.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded ${priorityColor(rule.priority)}`}>
                      {rule.priority}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${rule.isActive ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
                      {rule.isActive ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Bell className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">Belum ada alert rule</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Alert rule akan dibuat saat ada kondisi yang perlu dipantau</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alert Events */}
      <Card>
        <CardHeader title="Riwayat Alert" description="Notifikasi yang telah diterima" />
        <CardContent>
          {alerts.length > 0 ? (
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`rounded-lg border p-4 ${
                    alert.isRead
                      ? 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                      : 'border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/10'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`rounded-full p-1.5 ${priorityColor(alert.rule.priority)}`}>
                      {priorityIcon(alert.rule.priority)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {alert.title}
                        </h4>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-1 rounded ${priorityColor(alert.rule.priority)}`}>
                            {alert.rule.priority}
                          </span>
                          {!alert.isRead && (
                            <span className="text-xs px-2 py-1 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                              Baru
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {alert.message}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                        <span>{fmt(alert.createdAt)}</span>
                        <span>Rule: {alert.rule.name}</span>
                        {alert.previousValue && alert.currentValue && (
                          <span>
                            {alert.previousValue} → {alert.currentValue}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-300 dark:text-green-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">Tidak ada alert</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Semua baik-baik saja!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
