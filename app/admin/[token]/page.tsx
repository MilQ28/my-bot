import { notFound } from 'next/navigation';
import { validateAdminServerSession } from '@/lib/adminSession';
import { getPortfolioData } from '@/lib/dataStore';
import AdminDashboardClient from './AdminDashboardClient';

interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function DynamicAdminPage({ params }: PageProps) {
  const resolvedParams = await params;
  const isValid = await validateAdminServerSession(resolvedParams.token);

  if (!isValid) {
    notFound();
  }

  const initialData = await getPortfolioData();

  return <AdminDashboardClient initialData={initialData} token={resolvedParams.token} />;
}
