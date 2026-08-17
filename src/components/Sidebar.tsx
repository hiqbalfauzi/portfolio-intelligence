'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { 
  LayoutDashboard, 
  Briefcase, 
  LineChart, 
  Brain, 
  Shield, 
  Bell, 
  BookOpen, 
  Settings,
  TrendingUp,
  ArrowLeftRight,
  LogOut,
  User
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ThemeToggle } from './ThemeToggle'

const navigation = [
  { name: 'Overview', href: '/', icon: LayoutDashboard },
  { name: 'Portfolio', href: '/portfolio', icon: Briefcase },
  { name: 'Stocks', href: '/stocks', icon: LineChart },
  { name: 'Transaksi', href: '/transactions', icon: ArrowLeftRight },
  { name: 'AI Analyst', href: '/ai-analyst', icon: Brain },
  { name: 'Risk Center', href: '/risk', icon: Shield },
  { name: 'Alerts', href: '/alerts', icon: Bell },
  { name: 'Journal', href: '/journal', icon: BookOpen },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
      router.refresh()
    } catch {
      setLoggingOut(false)
    }
  }

  return (
    <aside className="flex h-full w-64 flex-col border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <div className="flex h-16 items-center justify-between border-b border-gray-200 dark:border-gray-700 px-6">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">Portfolio Intelligence</span>
        </div>
        <ThemeToggle />
      </div>
      
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== '/' && pathname.startsWith(item.href))
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>
      
      <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-3">
        <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-3">
          <p className="text-xs font-medium text-blue-900 dark:text-blue-300">Data terakhir diperbarui</p>
          <p className="text-xs text-blue-700 dark:text-blue-400">16 Agu 2026, 16:00 WIB</p>
        </div>

        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
        >
          <LogOut className="h-5 w-5" />
          {loggingOut ? 'Keluar...' : 'Keluar'}
        </button>
      </div>
    </aside>
  )
}
