import { Navigate } from 'react-router-dom';
import { useApp } from '@/lib/AppStateContext';
import Welcome from '@/pages/Welcome';

export default function Entry() {
  const { state } = useApp();
  if (state.onboarded) return <Navigate to="/home" replace />;
  return <Welcome />;
}