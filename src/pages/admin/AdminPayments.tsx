import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/DashboardLayout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';

export default function AdminPayments() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('payments')
      .select('*, registrations(*, exams(subject)), profiles:student_id(full_name, email)')
      .order('created_at', { ascending: false })
      .then(({ data }) => { setPayments(data || []); setLoading(false); });
  }, []);

  const statusBadge = (s: string) => {
    if (s === 'success') return 'badge-success';
    if (s === 'failed') return 'badge-destructive';
    return 'badge-warning';
  };

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1>All Payments</h1>
        <p>View payment transactions across all students.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : (
        <div className="form-section overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Student</TableHead>
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
                  <TableCell>{(p.profiles as any)?.full_name || '-'}</TableCell>
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
