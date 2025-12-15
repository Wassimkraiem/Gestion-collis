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
    key: 'A Enlever', 
    path: '/a-enlever',
    label: 'À Enlever', 
    icon: AlertCircle, 
    color: 'text-orange-600',
    bgColor: 'hover:bg-orange-50',
    activeBg: 'bg-orange-100'
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
    <aside className="w-64 glass border-r border-gray-200 p-4 space-y-2 overflow-y-auto">
      <div className="mb-6">
        <h2 className="text-lg font-bold gradient-text mb-1">Filtres</h2>
        <p className="text-sm text-gray-500">Par statut</p>
      </div>

      <nav className="space-y-1">
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
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive 
                  ? `${status.activeBg} shadow-md` 
                  : `${status.bgColor} hover:shadow-sm`
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon 
                  size={20} 
                  className={`${isActive ? status.color : 'text-gray-400'}`}
                />
                <span className={`font-medium ${isActive ? 'text-gray-900' : 'text-gray-600'}`}>
                  {status.label}
                </span>
              </div>
              
              {count > 0 && (
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  isActive 
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

