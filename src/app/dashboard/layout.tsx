'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, logout } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Users, FileText, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
    }
  }, [router]);

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/clients', label: 'Clients', icon: Users },
    { href: '/dashboard/invoices', label: 'Invoices', icon: FileText },
  ];

  return (
    <div className="min-h-screen flex">
      <aside className={`${collapsed ? 'w-16' : 'w-64'} bg-gray-900 text-white flex flex-col transition-all duration-300`}>
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          {!collapsed && <h1 className="text-xl font-bold">FreelanceSaaS</h1>}
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-300 hover:text-white hover:bg-gray-800 ml-auto"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </Button>
        </div>
        <nav className="flex-1 p-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                  collapsed ? 'justify-center' : ''
                } ${active ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'}`}
                title={collapsed ? item.label : undefined}
              >
                <Icon size={18} />
                {!collapsed && item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-2 border-t border-gray-700">
          <Button
            variant="ghost"
            className={`w-full text-gray-300 hover:text-white hover:bg-gray-800 ${collapsed ? 'justify-center px-0' : 'justify-start'}`}
            onClick={logout}
            title={collapsed ? 'Sign out' : undefined}
          >
            <LogOut size={18} className={collapsed ? '' : 'mr-3'} />
            {!collapsed && 'Sign out'}
          </Button>
        </div>
      </aside>
      <main className="flex-1 bg-gray-50 p-8 overflow-auto">
        {children}
      </main>
    </div>
  );
}