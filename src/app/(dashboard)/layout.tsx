import Sidebar from '@/components/Sidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
