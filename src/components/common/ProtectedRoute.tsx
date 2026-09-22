import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Card } from './Card';
import { Button } from './Button';
import { Badge } from './Badge';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAdmin = false,
}) => {
  const { user, isAuthenticated, isAdmin, loginAsDemoAdmin } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <Card className="p-8 space-y-5 border-amber-500/30 bg-slate-900/90 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-400 mx-auto flex items-center justify-center border border-amber-500/20">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <Badge variant="warning" size="md">
              Restricted Area
            </Badge>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Administrator Privileges Required
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
              You are currently logged in as a <strong>Student ({user?.name})</strong>. The Admin Control Panel is reserved for university faculty and authorized department staff.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-left text-xs space-y-2">
            <p className="font-semibold text-slate-300">Presentation Quick-Access:</p>
            <p className="text-slate-400">
              Evaluating role-based access control? Click the button below to instantly switch into the <strong>Campus Admin</strong> persona.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button
              onClick={loginAsDemoAdmin}
              variant="primary"
              size="md"
              leftIcon={<UserCheck className="w-4 h-4" />}
            >
              Switch to Demo Admin Persona
            </Button>
            <Link to="/dashboard">
              <Button variant="secondary" size="md" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                Return to Student Dashboard
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};
