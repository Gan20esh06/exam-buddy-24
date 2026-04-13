import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/DashboardLayout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { CreditCard } from 'lucide-react';

export default function PaymentsListPage() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('payments')
      .select('*, registrations(*, exams(*))')
      .eq('student_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setPayments(data || []);
        setLoading(false);
      });
  }, [user]);

  const statusBadge = (s: string) => {
    if (s === 'success') return 'badge-success';
    if (s === 'failed') return 'badge-destructive';
    return 'badge-warning';
  };

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1>Payment History</h1>
        <p>View all your payment transactions.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : payments.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p>No payments yet.</p>
        </div>
      ) : (
        <div className="form-section overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Exam</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map(p => (
                <TableRow key={p.id}>
                  <TableCell className="font-mono text-xs">{p.transaction_id}</TableCell>
                  <TableCell>{p.registrations?.exams?.subject || '-'}</TableCell>
                  <TableCell>₹{p.amount}</TableCell>
                  <TableCell className="capitalize">{p.payment_method}</TableCell>
                  <TableCell><span className={statusBadge(p.status)}>{p.status}</span></TableCell>
                  <TableCell>{format(new Date(p.created_at), 'PPP')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </DashboardLayout>
  );
}
