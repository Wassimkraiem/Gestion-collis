'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Package, LogOut } from 'lucide-react';
import { clearAuthSession } from '@/lib/auth';
import Sidebar from '@/components/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    clearAuthSession();
    router.push('/login');
  };

  // Map pathnames to status
  const getStatusFromPath = () => {
    if (pathname === '/' || pathname === '/all') return 'all';
    if (pathname === '/en-attente') return 'En Attente';
    if (pathname === '/en-livraison') return 'En Cours de Livraison';
    if (pathname === '/livre') return 'Livré';
    if (pathname === '/en-transit') return 'En transit';
    if (pathname === '/a-enlever') return 'A Enlever';
    if (pathname === '/annule') return 'Annulé';
    if (pathname === '/retour-depot') return 'Retour Dépôt';
    if (pathname === '/retour-expediteur') return 'Retour Expéditeur';
    if (pathname === '/echange-recu') return 'Echange Reçu';
    if (pathname === '/anomalie') return 'Anomalie de Livraison';
    if (pathname === '/livre-paye') return 'Livré Payé';
    if (pathname === '/au-depot') return 'Au Dépôt';
    return 'all';
  };

  const selectedStatus = getStatusFromPath();

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-blue-50 to-indigo-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <Sidebar selectedStatus={selectedStatus} />

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="glass sticky top-0 z-40 animate-fadeIn">
          <div className="max-w-full mx-auto px-3 lg:px-4 xl:px-6 py-3 lg:py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 lg:gap-3">
                <div className="bg-linear-to-br from-blue-600 to-indigo-600 p-1.5 lg:p-2 rounded-lg lg:rounded-xl shadow-lg">
                  <Package className="text-white" size={22} />
                </div>
                <div>
                  <h1 className="text-lg lg:text-xl xl:text-2xl font-bold gradient-text">Colissimo Management</h1>
                  <p className="text-xs lg:text-sm text-gray-600 hidden lg:block">
                    {selectedStatus === 'all'
                      ? 'Tous les colis'
                      : `Filtré par: ${selectedStatus}`}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 lg:gap-3">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 lg:gap-2 px-3 lg:px-4 xl:px-5 py-2 lg:py-2.5 border-2 border-red-300 rounded-lg lg:rounded-xl text-red-700 hover:bg-red-50 hover:border-red-400 hover:shadow-md transition-all duration-200 text-sm lg:text-base font-medium"
                  title="Déconnexion"
                >
                  <LogOut size={16} className="lg:w-[18px] lg:h-[18px]" />
                  <span className="hidden lg:inline">Déconnexion</span>
                  <span className="lg:hidden">Exit</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 px-3 lg:px-4 xl:px-6 py-4 lg:py-6 xl:py-8 overflow-auto ">
          {children}
        </main>
      </div>
    </div>
  );
}

