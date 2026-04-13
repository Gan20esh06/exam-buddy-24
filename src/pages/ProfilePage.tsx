import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Save } from 'lucide-react';

export default function ProfilePage() {
  const { profile, refreshProfile } = useAuth();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    course: profile?.course || '',
    semester: profile?.semester || '',
    enrollment_number: profile?.enrollment_number || '',
  });

  const handleSave = async () => {
    if (!profile) return;
    if (!form.full_name.trim()) {
      toast.error('Name is required');
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update(form)
      .eq('id', profile.id);
    setSaving(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Profile updated!');
      await refreshProfile();
    }
  };

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1>My Profile</h1>
        <p>Manage your personal information.</p>
      </div>

      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={profile?.email || ''} disabled />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+91 9876543210" />
              </div>
              <div className="space-y-2">
                <Label>Course</Label>
                <Input value={form.course} onChange={e => setForm(f => ({ ...f, course: e.target.value }))} placeholder="BCA, MCA, B.Tech..." />
              </div>
              <div className="space-y-2">
                <Label>Semester</Label>
                <Input value={form.semester} onChange={e => setForm(f => ({ ...f, semester: e.target.value }))} placeholder="6th Semester" />
              </div>
              <div className="space-y-2">
                <Label>Enrollment Number</Label>
                <Input value={form.enrollment_number} onChange={e => setForm(f => ({ ...f, enrollment_number: e.target.value }))} placeholder="EN2024001" />
              </div>
            </div>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
