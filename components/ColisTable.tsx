'use client';

import { Colis } from '@/types/colissimo';
import { Pencil, Trash2, Eye, Truck } from 'lucide-react';

interface ColisTableProps {
  colisList: Colis[];
  onEdit: (colis: Colis) => void;
  onDelete: (colis: Colis) => void;
  onView: (colis: Colis) => void;
  onViewDeliveryDetails?: (colis: Colis) => void;
}

export default function ColisTable({ colisList, onEdit, onDelete, onView, onViewDeliveryDetails }: ColisTableProps) {
  // Safety check: ensure colisList is an array
  const safeColisList = Array.isArray(colisList) ? colisList : [];
  
  if (safeColisList.length === 0) {
    return (
      <div className="card text-center py-16 animate-scaleIn">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mb-4">
          <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <p className="text-gray-500 text-xl font-medium">Aucun colis trouvé</p>
        <p className="text-gray-400 mt-2">Ajoutez votre premier colis pour commencer</p>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden animate-fadeIn">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-gray-50 to-blue-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Référence
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Client
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Téléphone
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Ville
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Gouvernorat
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Prix
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {safeColisList.map((colis, index) => (
              <tr key={colis.code || colis.id || index} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {colis.reference}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {colis.client}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {colis.tel1}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {colis.ville}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {colis.gouvernorat}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {colis.prix} TND
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`badge shadow-sm ${
                    colis.type === 'VO' ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' :
                    colis.type === 'EC' ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white' :
                    'bg-gradient-to-r from-purple-500 to-indigo-600 text-white'
                  }`}>
                    {colis.type}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`badge shadow-sm ${
                    (colis.etat === 'Livré' || colis.etat === 'livré' || colis.etat === 'Delivered') ? 
                      'bg-gradient-to-r from-green-500 to-emerald-600 text-white' :
                    (colis.etat === 'En Cours de Livraison' || colis.etat === 'En cours' || colis.etat === 'en_cours') ? 
                      'bg-gradient-to-r from-blue-500 to-blue-600 text-white' :
                    (colis.etat === 'En Attente' || colis.etat === 'en attente' || colis.etat === 'Pending') ?
                      'bg-gradient-to-r from-yellow-400 to-amber-500 text-white' :
                    (colis.etat === 'Annulé' || colis.etat === 'annulé' || colis.etat === 'Cancelled') ?
                      'bg-gradient-to-r from-red-500 to-red-600 text-white' :
                    (colis.etat === 'A Enlever' || colis.etat === 'A enlever' || colis.etat === 'Ready for Pickup') ?
                      'bg-gradient-to-r from-orange-500 to-orange-600 text-white' :
                    (colis.etat === 'En transit' || colis.etat === 'en_transit' || colis.etat === 'In Transit') ?
                      'bg-gradient-to-r from-purple-500 to-indigo-600 text-white' :
                    'bg-gradient-to-r from-gray-500 to-gray-600 text-white'
                  }`}>
                    {colis.etat || colis.statut || 'En Attente'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => onView(colis)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
                      title="Voir détails"
                    >
                      <Eye size={18} />
                    </button>
                    {(colis.etat === 'En Cours de Livraison' || colis.etat === 'En cours') && onViewDeliveryDetails && (
                      <button
                        onClick={() => onViewDeliveryDetails(colis)}
                        className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
                        title="Détails de livraison"
                      >
                        <Truck size={18} />
                      </button>
                    )}
                    <button
                      onClick={() => onEdit(colis)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
                      title="Modifier"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => onDelete(colis)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
                      title="Supprimer"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

