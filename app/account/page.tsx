import DashboardLayout from '@/components/account/DashboardLayout';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function AccountPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    redirect('/login');
  }
  return <DashboardLayout userEmail={session.user.email} />;
} 