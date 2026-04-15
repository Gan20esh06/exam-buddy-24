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
    setLoading(true);
    const { data: regs, error } = await supabase
      .from('registrations')
      .select('*, exams(*)')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    if (!regs || regs.length === 0) {
      setRegistrations([]);
      setLoading(false);
      return;
    }

    // Fetch profiles separately using student_ids
    const studentIds = [...new Set(regs.map(r => r.student_id))];
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, full_name, email, course')
      .in('user_id', studentIds);

    const profileMap = new Map((profiles || []).map(p => [p.user_id, p]));

    const enriched = regs.map(r => ({
      ...r,
      profile: profileMap.get(r.student_id) || null,
    }));

    setRegistrations(enriched);
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
    if (s === 'approved') return 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-800';
    if (s === 'rejected') return 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-red-100 text-red-800';
    return 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800';
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
      ) : registrations.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">No registrations found.</div>
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
                  <TableCell className="font-medium">{r.profile?.full_name || '-'}</TableCell>
                  <TableCell>{r.profile?.email || '-'}</TableCell>
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
