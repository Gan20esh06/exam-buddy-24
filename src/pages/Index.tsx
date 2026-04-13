import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { GraduationCap, BookOpen, Shield, CreditCard, ArrowRight } from 'lucide-react';

export default function Index() {
  const features = [
    { icon: BookOpen, title: 'Browse Exams', desc: 'View available exams with details on dates, fees, and eligibility.' },
    { icon: Shield, title: 'Secure Registration', desc: 'Register for exams with approval workflow and status tracking.' },
    { icon: CreditCard, title: 'Easy Payments', desc: 'Simulated payment gateway with multiple payment methods.' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <header className="border-b bg-card">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground">OERS</span>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" asChild><Link to="/auth">Sign In</Link></Button>
            <Button asChild><Link to="/auth">Get Started</Link></Button>
          </div>
        </div>
      </header>

      <section className="py-24 px-4">
        <div className="container mx-auto text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <GraduationCap className="w-4 h-4" />
            Online Exam Registration System
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-display text-foreground mb-6 leading-tight">
            Register for Exams with Ease
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            A complete exam registration portal for students and administrators. Browse exams, register, make payments, and track your registrations — all in one place.
          </p>
          <div className="flex gap-3 justify-center">
            <Button size="lg" asChild>
              <Link to="/auth">
                Start Registration <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-card border-t">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold font-display text-center text-foreground mb-10">Key Features</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map(f => (
              <div key={f.title} className="stat-card text-center">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <f.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="py-8 px-4 border-t text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} OERS — Online Exam Registration System. BCA Final Year Project.</p>
      </footer>
    </div>
  );
}
