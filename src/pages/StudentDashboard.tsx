import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, CheckCircle, Clock, CreditCard } from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ exams: 0, registered: 0, approved: 0, payments: 0 });

  useEffect(() => {
    if (!user) return;
    const fetchStats = async () => {
      const [examsRes, regsRes, paymentsRes] = await Promise.all([
        supabase.from('exams').select('id', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('registrations').select('id, status', { count: 'exact' }).eq('student_id', user.id),
        supabase.from('payments').select('id', { count: 'exact', head: true }).eq('student_id', user.id).eq('status', 'success'),
      ]);

      const approvedCount = regsRes.data?.filter(r => r.status === 'approved').length || 0;

      setStats({
        exams: examsRes.count || 0,
        registered: regsRes.count || 0,
        approved: approvedCount,
        payments: paymentsRes.count || 0,
      });
    };
    fetchStats();
  }, [user]);

  const cards = [
    { title: 'Available Exams', value: stats.exams, icon: BookOpen, color: 'text-primary' },
    { title: 'My Registrations', value: stats.registered, icon: Clock, color: 'text-warning' },
    { title: 'Approved', value: stats.approved, icon: CheckCircle, color: 'text-success' },
    { title: 'Payments Made', value: stats.payments, icon: CreditCard, color: 'text-accent' },
  ];

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1>Student Dashboard</h1>
        <p>Welcome back! Here's an overview of your exam registrations.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map(c => (
          <div key={c.title} className="stat-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">{c.title}</span>
              <c.icon className={`w-5 h-5 ${c.color}`} />
            </div>
            <p className="text-3xl font-bold text-foreground">{c.value}</p>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
