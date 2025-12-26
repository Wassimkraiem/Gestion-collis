'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Package, Clock, Truck, CheckCircle, XCircle, Home, AlertCircle } from 'lucide-react';

interface SidebarProps {
  selectedStatus: string;
}

const statusConfig = [
  {
    key: 'all',
    path: '/',
    label: 'Tous les colis',
    icon: Package,
    color: 'text-gray-600',
    bgColor: 'hover:bg-gray-50',
    activeBg: 'bg-gray-100'
  },
  {
    key: 'En Attente',
    path: '/en-attente',
    label: 'En Attente',
    icon: Clock,
    color: 'text-yellow-600',
    bgColor: 'hover:bg-yellow-50',
    activeBg: 'bg-yellow-100'
  },
  {
    key: 'A Enlever',
    path: '/a-enlever',
    label: 'À Enlever',
    icon: AlertCircle,
    color: 'text-orange-600',
    bgColor: 'hover:bg-orange-50',
    activeBg: 'bg-orange-100'
  },
  {
    key: 'En Cours de Livraison',
    path: '/en-livraison',
    label: 'En Livraison',
    icon: Truck,
    color: 'text-blue-600',
    bgColor: 'hover:bg-blue-50',
    activeBg: 'bg-blue-100'
  },
  {
    key: 'Livré',
    path: '/livre',
    label: 'Livrés',
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'hover:bg-green-50',
    activeBg: 'bg-green-100'
  },
  {
    key: 'En transit',
    path: '/en-transit',
    label: 'En Transit',
    icon: Home,
    color: 'text-purple-600',
    bgColor: 'hover:bg-purple-50',
    activeBg: 'bg-purple-100'
  },
  {
    key: 'Annulé',
    path: '/annule',
    label: 'Annulés',
    icon: XCircle,
    color: 'text-red-600',
    bgColor: 'hover:bg-red-50',
    activeBg: 'bg-red-100'
  },
  {
    key: 'Anomalie de Livraison',
    path: '/anomalie',
    label: 'Anomalie',
    icon: AlertCircle,
    color: 'text-rose-600',
    bgColor: 'hover:bg-rose-50',
    activeBg: 'bg-rose-100'
  },
  {
    key: 'Retour Dépôt',
    path: '/retour-depot',
    label: 'Retour Dépôt',
    icon: Home,
    color: 'text-indigo-600',
    bgColor: 'hover:bg-indigo-50',
    activeBg: 'bg-indigo-100'
  },
  {
    key: 'Retour Expéditeur',
    path: '/retour-expediteur',
    label: 'Retour Expéditeur',
    icon: Package,
    color: 'text-pink-600',
    bgColor: 'hover:bg-pink-50',
    activeBg: 'bg-pink-100'
  },
  {
    key: 'Echange Reçu',
    path: '/echange-recu',
    label: 'Échange Reçu',
    icon: CheckCircle,
    color: 'text-teal-600',
    bgColor: 'hover:bg-teal-50',
    activeBg: 'bg-teal-100'
  },
];

export default function Sidebar({ selectedStatus }: SidebarProps) {
  const [statusCounts, setStatusCounts] = useState<{ [key: string]: number }>({});

  // Fetch status counts
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const response = await fetch('/api/colissimo/stats');
        const result = await response.json();
        if (result.success) {
          setStatusCounts(result.data);
        }
      } catch (error) {
        console.error('Error fetching status counts:', error);
      }
    };

    fetchCounts();
    // Refresh counts every 30 seconds
    const interval = setInterval(fetchCounts, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <aside className="w-full md:w-56 xl:w-64 glass md:border-r border-gray-200 p-3 lg:p-4 space-y-2 md:space-y-3 shrink-0">
      <div className="mb-2 lg:mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm lg:text-lg font-bold gradient-text mb-0.5 lg:mb-1">Filtres</h2>
          <p className="text-[11px] lg:text-sm text-gray-500">Par statut</p>
        </div>
        <span className="inline-flex md:hidden px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700">
          {Object.values(statusCounts).reduce((a, b) => a + b, 0) || 0} colis
        </span>
      </div>

      {/* Mobile: horizontal chips — Desktop: vertical list */}
      <nav className="flex md:block gap-2 md:gap-1 overflow-x-auto md:overflow-visible pb-1 md:pb-0 -mx-1 md:mx-0 px-1 md:px-0">
        {statusConfig.map((status) => {
          const Icon = status.icon;
          const count = status.key === 'all'
            ? Object.values(statusCounts).reduce((a, b) => a + b, 0)
            : statusCounts[status.key] || 0;
          const isActive = selectedStatus === status.key;

          return (
            <Link
              key={status.key}
              href={status.path}
              className={`shrink-0 md:w-full flex items-center justify-between px-3 lg:px-3 xl:px-4 py-1.5 md:py-2 lg:py-2.5 xl:py-3 rounded-full md:rounded-lg xl:rounded-xl transition-all duration-200 ${isActive
                ? `${status.activeBg} shadow-md`
                : `${status.bgColor} hover:shadow-sm`
                }`}
            >
              <div className="flex items-center gap-1.5 lg:gap-2.5 xl:gap-3">
                <Icon
                  size={16}
                  className={`${isActive ? status.color : 'text-gray-400'} w-4 h-4 lg:w-5 lg:h-5`}
                />
                <span className={`text-[11px] md:text-xs lg:text-sm font-medium whitespace-nowrap ${isActive ? 'text-gray-900' : 'text-gray-600'}`}>
                  {status.label}
                </span>
              </div>

              {count > 0 && (
                <span className={`ml-1 px-1.5 lg:px-2 xl:px-2.5 py-0.5 rounded-full text-[10px] lg:text-xs font-semibold ${isActive
                  ? `${status.color} bg-white`
                  : 'bg-gray-100 text-gray-600'
                  }`}>
                  {count}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

