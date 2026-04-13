import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Check, X } from 'lucide-react';

export default function AdminRegistrations() {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const { data } = await supabase
      .from('registrations')
      .select('*, exams(*), profiles:student_id(full_name, email, course)')
      .order('created_at', { ascending: false });
    setRegistrations(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const updateStatus = async (id: string, status: 'approved' | 'rejected') => {
    const { error } = await supabase.from('registrations').update({ status }).eq('id', id);
    if (error) { toast.error(error.message); return; }
    toast.success(`Registration ${status}`);
    fetchData();
  };

  const statusBadge = (s: string) => {
    if (s === 'approved') return 'badge-success';
    if (s === 'rejected') return 'badge-destructive';
    return 'badge-warning';
  };

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1>Student Registrations</h1>
        <p>Approve or reject exam registrations.</p>
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
                <TableHead>Student</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Exam</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {registrations.map(r => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{(r.profiles as any)?.full_name || '-'}</TableCell>
                  <TableCell>{(r.profiles as any)?.email || '-'}</TableCell>
                  <TableCell>{r.exams?.subject} ({r.exams?.exam_code})</TableCell>
                  <TableCell>{format(new Date(r.created_at), 'PPP')}</TableCell>
                  <TableCell><span className={statusBadge(r.status)}>{r.status}</span></TableCell>
                  <TableCell className="text-right">
                    {r.status === 'pending' && (
                      <div className="flex gap-1 justify-end">
                        <Button size="sm" variant="outline" onClick={() => updateStatus(r.id, 'approved')}>
                          <Check className="w-4 h-4 mr-1" />Approve
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => updateStatus(r.id, 'rejected')}>
                          <X className="w-4 h-4 mr-1" />Reject
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </DashboardLayout>
  );
}
