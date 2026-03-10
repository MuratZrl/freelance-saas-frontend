// src/app/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import api from '@/lib/api';

interface Stats {
  total: number;
  paid: number;
  pending: number;
  overdue: number;
  invoiceCount: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    api.get('/invoices/stats').then((res) => setStats(res.data));
  }, []);

  const cards = [
    { label: 'Total Revenue', value: `€${stats?.total?.toFixed(2) ?? '0.00'}` },
    { label: 'Paid', value: `€${stats?.paid?.toFixed(2) ?? '0.00'}` },
    { label: 'Pending', value: `€${stats?.pending?.toFixed(2) ?? '0.00'}` },
    { label: 'Overdue Invoices', value: stats?.overdue ?? 0 },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => (
          <Card key={card.label}>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-500">{card.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{card.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}