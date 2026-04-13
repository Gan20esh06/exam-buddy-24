import { useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { CheckCircle, XCircle, CreditCard } from 'lucide-react';

export default function PaymentPage() {
  const { registrationId } = useParams();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const amount = searchParams.get('amount') || '0';
  const subject = searchParams.get('subject') || 'Exam';

  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [method, setMethod] = useState('card');
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<'success' | 'failed' | null>(null);

  const simulatePayment = async () => {
    if (!user || !registrationId) return;

    if (method === 'card' && (!cardNumber.trim() || !expiry.trim() || !cvv.trim())) {
      toast.error('Please fill in all payment details');
      return;
    }

    setProcessing(true);

    // Simulate processing delay
    await new Promise(r => setTimeout(r, 2000));

    // 85% success rate simulation
    const success = Math.random() < 0.85;
    const txnId = `TXN${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    const { error } = await supabase.from('payments').insert({
      student_id: user.id,
      registration_id: registrationId,
      amount: parseFloat(amount),
      payment_method: method,
      transaction_id: txnId,
      status: success ? 'success' : 'failed',
    });

    setProcessing(false);

    if (error) {
      toast.error('Payment recording failed');
      return;
    }

    setResult(success ? 'success' : 'failed');
  };

  if (result) {
    return (
      <DashboardLayout>
        <div className="max-w-md mx-auto mt-12 text-center">
          {result === 'success' ? (
            <>
              <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-success" />
              </div>
              <h2 className="text-2xl font-bold font-display text-foreground mb-2">Payment Successful!</h2>
              <p className="text-muted-foreground mb-6">
                Your payment of ₹{amount} for {subject} has been processed successfully.
              </p>
            </>
          ) : (
            <>
              <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-10 h-10 text-destructive" />
              </div>
              <h2 className="text-2xl font-bold font-display text-foreground mb-2">Payment Failed</h2>
              <p className="text-muted-foreground mb-6">
                Your payment could not be processed. Please try again.
              </p>
            </>
          )}
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => navigate('/registrations')}>My Registrations</Button>
            {result === 'failed' && <Button onClick={() => setResult(null)}>Retry Payment</Button>}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-lg mx-auto">
        <div className="page-header">
          <h1>Payment</h1>
          <p>Complete your exam registration payment (simulated).</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Payment Details
            </CardTitle>
            <CardDescription>Exam: {subject} — Amount: ₹{amount}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <Select value={method} onValueChange={setMethod}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="card">Credit/Debit Card</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                  <SelectItem value="netbanking">Net Banking</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {method === 'card' && (
              <>
                <div className="space-y-2">
                  <Label>Card Number</Label>
                  <Input placeholder="1234 5678 9012 3456" value={cardNumber}
                    onChange={e => setCardNumber(e.target.value)} maxLength={19} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Expiry</Label>
                    <Input placeholder="MM/YY" value={expiry} onChange={e => setExpiry(e.target.value)} maxLength={5} />
                  </div>
                  <div className="space-y-2">
                    <Label>CVV</Label>
                    <Input type="password" placeholder="•••" value={cvv} onChange={e => setCvv(e.target.value)} maxLength={4} />
                  </div>
                </div>
              </>
            )}

            {method === 'upi' && (
              <div className="space-y-2">
                <Label>UPI ID</Label>
                <Input placeholder="yourname@upi" />
              </div>
            )}

            {method === 'netbanking' && (
              <div className="space-y-2">
                <Label>Select Bank</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Choose your bank" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sbi">State Bank of India</SelectItem>
                    <SelectItem value="hdfc">HDFC Bank</SelectItem>
                    <SelectItem value="icici">ICICI Bank</SelectItem>
                    <SelectItem value="axis">Axis Bank</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="pt-2">
              <Button className="w-full" onClick={simulatePayment} disabled={processing}>
                {processing ? 'Processing...' : `Pay ₹${amount}`}
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-2">
                This is a simulated payment. No real money will be charged.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
