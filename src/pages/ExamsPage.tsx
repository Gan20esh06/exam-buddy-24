import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, IndianRupee, BookOpen } from 'lucide-react';
import { format } from 'date-fns';

export default function ExamsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [exams, setExams] = useState<any[]>([]);
  const [registeredIds, setRegisteredIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const [examsRes, regsRes] = await Promise.all([
        supabase.from('exams').select('*').eq('status', 'active').order('exam_date', { ascending: true }),
        user ? supabase.from('registrations').select('exam_id').eq('student_id', user.id) : Promise.resolve({ data: [] }),
      ]);
      setExams(examsRes.data || []);
      setRegisteredIds(new Set((regsRes.data || []).map((r: any) => r.exam_id)));
      setLoading(false);
    };
    fetch();
  }, [user]);

  const handleRegister = async (exam: any) => {
    if (!user) return;
    // Create registration
    const { data: reg, error } = await supabase.from('registrations').insert({
      student_id: user.id,
      exam_id: exam.id,
    }).select().single();

    if (error) {
      toast.error(error.message);
      return;
    }

    setRegisteredIds(prev => new Set(prev).add(exam.id));
    toast.success('Registered! Proceed to payment.');
    navigate(`/payment/${reg.id}?amount=${exam.fee}&subject=${encodeURIComponent(exam.subject)}`);
  };

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1>Available Exams</h1>
        <p>Browse and register for upcoming exams.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : exams.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p>No exams available at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {exams.map(exam => (
            <Card key={exam.id} className="flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{exam.subject}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">Code: {exam.exam_code}</p>
                  </div>
                  <span className="badge-info">{exam.status}</span>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                {exam.description && <p className="text-sm text-muted-foreground mb-4">{exam.description}</p>}
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>{format(new Date(exam.exam_date), 'PPP')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>{exam.duration_minutes} minutes</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <IndianRupee className="w-4 h-4" />
                    <span>₹{exam.fee}</span>
                  </div>
                  {exam.eligibility && (
                    <p className="text-xs text-muted-foreground">Eligibility: {exam.eligibility}</p>
                  )}
                </div>
                <div className="mt-auto">
                  {registeredIds.has(exam.id) ? (
                    <Button variant="outline" className="w-full" disabled>Already Registered</Button>
                  ) : (
                    <Button className="w-full" onClick={() => handleRegister(exam)}>Register Now</Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
