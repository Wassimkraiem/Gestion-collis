'use client';

import { Colis } from '@/types/colissimo';
import { Pencil, Trash2, Eye, Truck, Printer, CheckCircle } from 'lucide-react';

interface ColisTableProps {
  colisList: Colis[];
  onEdit: (colis: Colis) => void;
  onDelete: (colis: Colis) => void;
  onView: (colis: Colis) => void;
  onViewDeliveryDetails?: (colis: Colis) => void;
  onPrint: (colis: Colis) => void;
  onValidate?: (colis: Colis) => void;
}

export default function ColisTable({ colisList, onEdit, onDelete, onView, onViewDeliveryDetails, onPrint, onValidate }: ColisTableProps) {
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
    <div className="animate-fadeIn space-y-4">
      {/* Mobile card layout */}
      <div className="space-y-3 md:hidden">
        {safeColisList.map((colis, index) => (
          <div
            key={colis.code || colis.id || index}
            className="card p-3 flex flex-col gap-2"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-gray-500 uppercase">
                  Référence
                </p>
                <p className="text-sm font-bold text-gray-900 break-all">
                  {colis.reference || '-'}
                </p>
                <p className="mt-1 text-[11px] font-semibold text-gray-500 uppercase">
                  Client
                </p>
                <p className="text-sm text-gray-800 truncate">
                  {colis.client || '-'}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-xs font-semibold text-gray-500">
                  {colis.prix} TND
                </span>
                <span
                  className={`badge shadow-sm text-[11px] ${(colis.etat === 'Livré' || colis.etat === 'livré' || colis.etat === 'Delivered')
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                      : (colis.etat === 'En Cours de Livraison' || colis.etat === 'En cours' || colis.etat === 'en_cours')
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                        : (colis.etat === 'En Attente' || colis.etat === 'en attente' || colis.etat === 'Pending')
                          ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white'
                          : (colis.etat === 'Annulé' || colis.etat === 'annulé' || colis.etat === 'Cancelled')
                            ? 'bg-gradient-to-r from-red-500 to-red-600 text-white'
                            : (colis.etat === 'A Enlever' || colis.etat === 'A enlever' || colis.etat === 'Ready for Pickup')
                              ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white'
                              : (colis.etat === 'En transit' || colis.etat === 'en_transit' || colis.etat === 'In Transit')
                                ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white'
                                : (colis.etat === 'Retour Dépôt' || colis.etat === 'Retour Depot')
                                  ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white'
                                  : (colis.etat === 'Retour Expéditeur' || colis.etat === 'Retour Expediteur')
                                    ? 'bg-gradient-to-r from-pink-500 to-pink-600 text-white'
                                    : (colis.etat === 'Echange Reçu' || colis.etat === 'Echange Recu')
                                      ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white'
                                      : (colis.etat === 'Anomalie de Livraison')
                                        ? 'bg-gradient-to-r from-rose-500 to-rose-600 text-white'
                                        : (colis.etat === 'Livré Payé' || colis.etat === 'Livre Paye')
                                          ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white'
                                          : 'bg-gradient-to-r from-gray-500 to-gray-600 text-white'
                    }`}
                >
                  {colis.etat || colis.statut || 'En Attente'}
                </span>
                {colis.type && (
                  <span
                    className={`badge shadow-sm text-[11px] ${colis.type === 'VO'
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                        : colis.type === 'EC'
                          ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                          : 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white'
                      }`}
                  >
                    {colis.type}
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-1 text-[11px] text-gray-600">
              <div>
                <p className="font-semibold uppercase">Ville</p>
                <p className="text-xs text-gray-800">{colis.ville || '-'}</p>
              </div>
              <div>
                <p className="font-semibold uppercase">Gouvernorat</p>
                <p className="text-xs text-gray-800">
                  {colis.gouvernorat || '-'}
                </p>
              </div>
              <div>
                <p className="font-semibold uppercase">Téléphone</p>
                <p className="text-xs text-gray-800">
                  {colis.tel1 || colis.tel2 || '-'}
                </p>
              </div>
              {colis.numero_colis && (
                <div>
                  <p className="font-semibold uppercase">N° Colis</p>
                  <p className="text-xs text-gray-800 break-all">
                    {colis.numero_colis}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-2 pt-2 border-t border-gray-100 flex flex-wrap justify-end gap-1.5">
              <button
                onClick={() => onView(colis)}
                className="px-2.5 py-1.5 text-[11px] flex items-center gap-1 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 transition-all duration-200"
              >
                <Eye size={14} />
                <span>Détails</span>
              </button>

              {(colis.etat === 'En Cours de Livraison' || colis.etat === 'En cours') &&
                onViewDeliveryDetails && (
                  <button
                    onClick={() => onViewDeliveryDetails(colis)}
                    className="px-2.5 py-1.5 text-[11px] flex items-center gap-1 rounded-md bg-purple-50 text-purple-700 hover:bg-purple-100 transition-all duration-200"
                  >
                    <Truck size={14} />
                    <span>Suivi</span>
                  </button>
                )}

              <button
                onClick={() => onPrint(colis)}
                className="px-2.5 py-1.5 text-[11px] flex items-center gap-1 rounded-md bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-all duration-200"
              >
                <Printer size={14} />
                <span>Imprimer</span>
              </button>

              {colis.etat === 'En Attente' && (
                <>
                  {onValidate && (
                    <button
                      onClick={() => onValidate(colis)}
                      className="px-2.5 py-1.5 text-[11px] flex items-center gap-1 rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-all duration-200"
                    >
                      <CheckCircle size={14} />
                      <span>Valider</span>
                    </button>
                  )}
                  <button
                    onClick={() => onEdit(colis)}
                    className="px-2.5 py-1.5 text-[11px] flex items-center gap-1 rounded-md bg-green-50 text-green-700 hover:bg-green-100 transition-all duration-200"
                  >
                    <Pencil size={14} />
                    <span>Modifier</span>
                  </button>
                  <button
                    onClick={() => onDelete(colis)}
                    className="px-2.5 py-1.5 text-[11px] flex items-center gap-1 rounded-md bg-red-50 text-red-700 hover:bg-red-100 transition-all duration-200"
                  >
                    <Trash2 size={14} />
                    <span>Supprimer</span>
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop / tablet table layout */}
      <div className="hidden md:block card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-blue-50">
              <tr>
                <th className="px-3 lg:px-4 xl:px-6 py-2.5 lg:py-3 xl:py-4 text-left text-[10px] lg:text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Référence
                </th>
                <th className="px-3 lg:px-4 xl:px-6 py-2.5 lg:py-3 xl:py-4 text-left text-[10px] lg:text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-3 lg:px-4 xl:px-6 py-2.5 lg:py-3 xl:py-4 text-left text-[10px] lg:text-xs font-bold text-gray-700 uppercase tracking-wider hidden xl:table-cell">
                  Téléphone
                </th>
                <th className="px-3 lg:px-4 xl:px-6 py-2.5 lg:py-3 xl:py-4 text-left text-[10px] lg:text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Ville
                </th>
                <th className="px-3 lg:px-4 xl:px-6 py-2.5 lg:py-3 xl:py-4 text-left text-[10px] lg:text-xs font-bold text-gray-700 uppercase tracking-wider hidden lg:table-cell">
                  Gouvernorat
                </th>
                <th className="px-3 lg:px-4 xl:px-6 py-2.5 lg:py-3 xl:py-4 text-left text-[10px] lg:text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Prix
                </th>
                <th className="px-3 lg:px-4 xl:px-6 py-2.5 lg:py-3 xl:py-4 text-left text-[10px] lg:text-xs font-bold text-gray-700 uppercase tracking-wider hidden xl:table-cell">
                  Type
                </th>
                <th className="px-3 lg:px-4 xl:px-6 py-2.5 lg:py-3 xl:py-4 text-left text-[10px] lg:text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-3 lg:px-4 xl:px-6 py-2.5 lg:py-3 xl:py-4 text-right text-[10px] lg:text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {safeColisList.map((colis, index) => (
                <tr
                  key={colis.code || colis.id || index}
                  className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200"
                >
                  <td className="px-3 lg:px-4 xl:px-6 py-2.5 lg:py-3 xl:py-4 whitespace-nowrap text-xs lg:text-sm font-medium text-gray-900">
                    {colis.reference}
                  </td>
                  <td className="px-3 lg:px-4 xl:px-6 py-2.5 lg:py-3 xl:py-4 whitespace-nowrap text-xs lg:text-sm text-gray-700">
                    {colis.client}
                  </td>
                  <td className="px-3 lg:px-4 xl:px-6 py-2.5 lg:py-3 xl:py-4 whitespace-nowrap text-xs lg:text-sm text-gray-700 hidden xl:table-cell">
                    {colis.tel1}
                  </td>
                  <td className="px-3 lg:px-4 xl:px-6 py-2.5 lg:py-3 xl:py-4 whitespace-nowrap text-xs lg:text-sm text-gray-700">
                    {colis.ville}
                  </td>
                  <td className="px-3 lg:px-4 xl:px-6 py-2.5 lg:py-3 xl:py-4 whitespace-nowrap text-xs lg:text-sm text-gray-700 hidden lg:table-cell">
                    {colis.gouvernorat}
                  </td>
                  <td className="px-3 lg:px-4 xl:px-6 py-2.5 lg:py-3 xl:py-4 whitespace-nowrap text-xs lg:text-sm text-gray-700">
                    {colis.prix} TND
                  </td>
                  <td className="px-3 lg:px-4 xl:px-6 py-2.5 lg:py-3 xl:py-4 whitespace-nowrap text-xs lg:text-sm hidden xl:table-cell">
                    <span
                      className={`badge shadow-sm ${colis.type === 'VO'
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                          : colis.type === 'EC'
                            ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                            : 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white'
                        }`}
                    >
                      {colis.type}
                    </span>
                  </td>
                  <td className="px-3 lg:px-4 xl:px-6 py-2.5 lg:py-3 xl:py-4 whitespace-nowrap text-xs lg:text-sm">
                    <span
                      className={`badge shadow-sm ${(colis.etat === 'Livré' || colis.etat === 'livré' || colis.etat === 'Delivered')
                          ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                          : (colis.etat === 'En Cours de Livraison' || colis.etat === 'En cours' || colis.etat === 'en_cours')
                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                            : (colis.etat === 'En Attente' || colis.etat === 'en attente' || colis.etat === 'Pending')
                              ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white'
                              : (colis.etat === 'Annulé' || colis.etat === 'annulé' || colis.etat === 'Cancelled')
                                ? 'bg-gradient-to-r from-red-500 to-red-600 text-white'
                                : (colis.etat === 'A Enlever' || colis.etat === 'A enlever' || colis.etat === 'Ready for Pickup')
                                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white'
                                  : (colis.etat === 'En transit' || colis.etat === 'en_transit' || colis.etat === 'In Transit')
                                    ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white'
                                    : (colis.etat === 'Retour Dépôt' || colis.etat === 'Retour Depot')
                                      ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white'
                                      : (colis.etat === 'Retour Expéditeur' || colis.etat === 'Retour Expediteur')
                                        ? 'bg-gradient-to-r from-pink-500 to-pink-600 text-white'
                                        : (colis.etat === 'Echange Reçu' || colis.etat === 'Echange Recu')
                                          ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white'
                                          : (colis.etat === 'Anomalie de Livraison')
                                            ? 'bg-gradient-to-r from-rose-500 to-rose-600 text-white'
                                            : (colis.etat === 'Livré Payé' || colis.etat === 'Livre Paye')
                                              ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white'
                                              : 'bg-gradient-to-r from-gray-500 to-gray-600 text-white'
                        }`}
                    >
                      {colis.etat || colis.statut || 'En Attente'}
                    </span>
                  </td>
                  <td className="px-3 lg:px-4 xl:px-6 py-2.5 lg:py-3 xl:py-4 whitespace-nowrap text-right text-xs lg:text-sm font-medium">
                    <div className="flex justify-end gap-1 lg:gap-1.5 xl:gap-2">
                      <button
                        onClick={() => onView(colis)}
                        className="p-1.5 lg:p-2 text-blue-600 hover:bg-blue-50 rounded-md lg:rounded-lg transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
                        title="Voir détails"
                      >
                        <Eye size={16} className="lg:w-[18px] lg:h-[18px]" />
                      </button>
                      {(colis.etat === 'En Cours de Livraison' || colis.etat === 'En cours') &&
                        onViewDeliveryDetails && (
                          <button
                            onClick={() => onViewDeliveryDetails(colis)}
                            className="p-1.5 lg:p-2 text-purple-600 hover:bg-purple-50 rounded-md lg:rounded-lg transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
                            title="Détails de livraison"
                          >
                            <Truck size={16} className="lg:w-[18px] lg:h-[18px]" />
                          </button>
                        )}
                      <button
                        onClick={() => onPrint(colis)}
                        className="p-1.5 lg:p-2 text-indigo-600 hover:bg-indigo-50 rounded-md lg:rounded-lg transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
                        title="Imprimer"
                      >
                        <Printer size={16} className="lg:w-[18px] lg:h-[18px]" />
                      </button>
                      {colis.etat === 'En Attente' && (
                        <>
                          {onValidate && (
                            <button
                              onClick={() => onValidate(colis)}
                              className="p-1.5 lg:p-2 text-emerald-600 hover:bg-emerald-50 rounded-md lg:rounded-lg transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
                              title="Valider pour enlèvement"
                            >
                              <CheckCircle size={16} className="lg:w-[18px] lg:h-[18px]" />
                            </button>
                          )}
                          <button
                            onClick={() => onEdit(colis)}
                            className="p-1.5 lg:p-2 text-green-600 hover:bg-green-50 rounded-md lg:rounded-lg transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
                            title="Modifier"
                          >
                            <Pencil size={16} className="lg:w-[18px] lg:h-[18px]" />
                          </button>
                          <button
                            onClick={() => onDelete(colis)}
                            className="p-1.5 lg:p-2 text-red-600 hover:bg-red-50 rounded-md lg:rounded-lg transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
                            title="Supprimer"
                          >
                            <Trash2 size={16} className="lg:w-[18px] lg:h-[18px]" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

