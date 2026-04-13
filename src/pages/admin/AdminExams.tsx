import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Plus, Pencil, Trash2 } from 'lucide-react';

const emptyExam = { subject: '', exam_code: '', description: '', exam_date: '', duration_minutes: 180, fee: 0, eligibility: '', max_students: 100, status: 'active' };

export default function AdminExams() {
  const { user } = useAuth();
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ ...emptyExam });

  const fetchExams = async () => {
    const { data } = await supabase.from('exams').select('*').order('created_at', { ascending: false });
    setExams(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchExams(); }, []);

  const openCreate = () => { setEditing(null); setForm({ ...emptyExam }); setDialogOpen(true); };
  const openEdit = (exam: any) => {
    setEditing(exam);
    setForm({
      subject: exam.subject, exam_code: exam.exam_code, description: exam.description || '',
      exam_date: exam.exam_date?.slice(0, 16) || '', duration_minutes: exam.duration_minutes,
      fee: exam.fee, eligibility: exam.eligibility || '', max_students: exam.max_students || 100,
      status: exam.status,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.subject.trim() || !form.exam_code.trim() || !form.exam_date) {
      toast.error('Subject, exam code, and date are required');
      return;
    }
    if (editing) {
      const { error } = await supabase.from('exams').update({
        ...form, fee: Number(form.fee), duration_minutes: Number(form.duration_minutes), max_students: Number(form.max_students),
      }).eq('id', editing.id);
      if (error) { toast.error(error.message); return; }
      toast.success('Exam updated');
    } else {
      const { error } = await supabase.from('exams').insert({
        ...form, fee: Number(form.fee), duration_minutes: Number(form.duration_minutes),
        max_students: Number(form.max_students), created_by: user?.id,
      });
      if (error) { toast.error(error.message); return; }
      toast.success('Exam created');
    }
    setDialogOpen(false);
    fetchExams();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this exam?')) return;
    const { error } = await supabase.from('exams').delete().eq('id', id);
    if (error) { toast.error(error.message); return; }
    toast.success('Exam deleted');
    fetchExams();
  };

  return (
    <DashboardLayout>
      <div className="page-header flex items-center justify-between">
        <div>
          <h1>Manage Exams</h1>
          <p>Create, edit, and manage exams.</p>
        </div>
        <Button onClick={openCreate}><Plus className="w-4 h-4 mr-2" />Add Exam</Button>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Exam' : 'Create New Exam'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Subject *</Label>
                <Input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Exam Code *</Label>
                <Input value={form.exam_code} onChange={e => setForm(f => ({ ...f, exam_code: e.target.value }))} placeholder="CS301" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Exam Date *</Label>
                <Input type="datetime-local" value={form.exam_date} onChange={e => setForm(f => ({ ...f, exam_date: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Duration (min)</Label>
                <Input type="number" value={form.duration_minutes} onChange={e => setForm(f => ({ ...f, duration_minutes: parseInt(e.target.value) || 0 }))} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Fee (₹)</Label>
                <Input type="number" value={form.fee} onChange={e => setForm(f => ({ ...f, fee: parseFloat(e.target.value) || 0 }))} />
              </div>
              <div className="space-y-2">
                <Label>Max Students</Label>
                <Input type="number" value={form.max_students} onChange={e => setForm(f => ({ ...f, max_students: parseInt(e.target.value) || 0 }))} />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Eligibility</Label>
              <Input value={form.eligibility} onChange={e => setForm(f => ({ ...f, eligibility: e.target.value }))} placeholder="BCA 6th Semester" />
            </div>
            <Button onClick={handleSave} className="w-full">{editing ? 'Update Exam' : 'Create Exam'}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : (
        <div className="form-section overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Fee</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {exams.map(e => (
                <TableRow key={e.id}>
                  <TableCell className="font-medium">{e.subject}</TableCell>
                  <TableCell>{e.exam_code}</TableCell>
                  <TableCell>{format(new Date(e.exam_date), 'PPP')}</TableCell>
                  <TableCell>₹{e.fee}</TableCell>
                  <TableCell><span className={e.status === 'active' ? 'badge-success' : e.status === 'completed' ? 'badge-info' : 'badge-warning'}>{e.status}</span></TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(e)}><Pencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(e.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
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
