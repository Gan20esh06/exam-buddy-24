import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard, BookOpen, CreditCard, UserCircle, LogOut, Menu, X,
  GraduationCap, Users, FileText, Settings, ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const studentNav = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Exams', icon: BookOpen, path: '/exams' },
  { label: 'My Registrations', icon: FileText, path: '/registrations' },
  { label: 'Payments', icon: CreditCard, path: '/payments' },
  { label: 'Profile', icon: UserCircle, path: '/profile' },
];

const adminNav = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
  { label: 'Manage Exams', icon: BookOpen, path: '/admin/exams' },
  { label: 'Registrations', icon: FileText, path: '/admin/registrations' },
  { label: 'Students', icon: Users, path: '/admin/students' },
  { label: 'Payments', icon: CreditCard, path: '/admin/payments' },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { role, profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const nav = role === 'admin' ? adminNav : studentNav;

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-foreground/20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 flex flex-col transition-transform duration-200 lg:translate-x-0 lg:static lg:z-auto",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )} style={{ background: 'var(--gradient-sidebar)' }}>
        <div className="flex items-center gap-3 px-6 py-5 border-b border-sidebar-border">
          <div className="w-9 h-9 rounded-lg bg-sidebar-primary flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-sidebar-primary-foreground" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-sidebar-primary-foreground tracking-wide">OERS</h2>
            <p className="text-xs text-sidebar-foreground/60">{role === 'admin' ? 'Admin Panel' : 'Student Portal'}</p>
          </div>
          <button className="ml-auto lg:hidden text-sidebar-foreground" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {nav.map(item => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={cn('sidebar-nav-item', location.pathname === item.path && 'active')}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 px-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center text-xs font-semibold text-sidebar-accent-foreground">
              {profile?.full_name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">{profile?.full_name || 'User'}</p>
              <p className="text-xs text-sidebar-foreground/50 truncate">{profile?.email}</p>
            </div>
          </div>
          <button onClick={handleSignOut} className="sidebar-nav-item w-full text-sidebar-foreground/70 hover:text-sidebar-foreground">
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 flex items-center gap-4 px-4 lg:px-6 border-b bg-card">
          <button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex-1" />
          <span className="badge-info capitalize">{role}</span>
        </header>
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
