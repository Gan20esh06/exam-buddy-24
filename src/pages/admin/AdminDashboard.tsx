import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/DashboardLayout';
import { BookOpen, Users, FileText, CreditCard, TrendingUp } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ exams: 0, students: 0, registrations: 0, revenue: 0, pending: 0 });

  useEffect(() => {
    const fetch = async () => {
      const [examsRes, studentsRes, regsRes, paymentsRes] = await Promise.all([
        supabase.from('exams').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('registrations').select('id, status', { count: 'exact' }),
        supabase.from('payments').select('amount, status'),
      ]);

      const pending = regsRes.data?.filter(r => r.status === 'pending').length || 0;
      const revenue = (paymentsRes.data || [])
        .filter(p => p.status === 'success')
        .reduce((sum, p) => sum + Number(p.amount), 0);

      setStats({
        exams: examsRes.count || 0,
        students: studentsRes.count || 0,
        registrations: regsRes.count || 0,
        revenue,
        pending,
      });
    };
    fetch();
  }, []);

  const cards = [
    { title: 'Total Exams', value: stats.exams, icon: BookOpen, color: 'text-primary' },
    { title: 'Total Students', value: stats.students, icon: Users, color: 'text-accent' },
    { title: 'Registrations', value: stats.registrations, icon: FileText, color: 'text-warning' },
    { title: 'Pending Approvals', value: stats.pending, icon: CreditCard, color: 'text-destructive' },
    { title: 'Total Revenue', value: `₹${stats.revenue.toLocaleString()}`, icon: TrendingUp, color: 'text-success' },
  ];

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1>Admin Dashboard</h1>
        <p>System overview and analytics.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {cards.map(c => (
          <div key={c.title} className="stat-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">{c.title}</span>
              <c.icon className={`w-5 h-5 ${c.color}`} />
            </div>
            <p className="text-2xl font-bold text-foreground">{c.value}</p>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
