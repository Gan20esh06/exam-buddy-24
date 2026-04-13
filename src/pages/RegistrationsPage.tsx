import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/DashboardLayout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { FileText } from 'lucide-react';

export default function RegistrationsPage() {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('registrations')
      .select('*, exams(*)')
      .eq('student_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setRegistrations(data || []);
        setLoading(false);
      });
  }, [user]);

  const statusBadge = (s: string) => {
    if (s === 'approved') return 'badge-success';
    if (s === 'rejected') return 'badge-destructive';
    return 'badge-warning';
  };

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1>My Registrations</h1>
        <p>Track the status of your exam registrations.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : registrations.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p>No registrations yet. Browse exams to register.</p>
        </div>
      ) : (
        <div className="form-section overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject</TableHead>
                <TableHead>Exam Code</TableHead>
                <TableHead>Exam Date</TableHead>
                <TableHead>Fee</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Registered On</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {registrations.map(r => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.exams?.subject}</TableCell>
                  <TableCell>{r.exams?.exam_code}</TableCell>
                  <TableCell>{r.exams?.exam_date ? format(new Date(r.exams.exam_date), 'PPP') : '-'}</TableCell>
                  <TableCell>₹{r.exams?.fee}</TableCell>
                  <TableCell><span className={statusBadge(r.status)}>{r.status}</span></TableCell>
                  <TableCell>{format(new Date(r.created_at), 'PPP')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </DashboardLayout>
  );
}
