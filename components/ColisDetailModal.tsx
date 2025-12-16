'use client';

import { Colis } from '@/types/colissimo';
import { X, Package, User, MapPin, Phone, DollarSign, Calendar, AlertTriangle } from 'lucide-react';
import { useState, useEffect } from 'react';

interface ColisDetailModalProps {
  colis: Colis | null;
  onClose: () => void;
}

export default function ColisDetailModal({ colis, onClose }: ColisDetailModalProps) {
  const [enrichedColis, setEnrichedColis] = useState<any>(colis);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchEnrichedDetails = async () => {
      if (!colis || !enrichedColis.code) {
        return;
      }

      // Only fetch for anomaly colis
      if (enrichedColis.etat !== 'Anomalie de Livraison') {
        setEnrichedColis(colis);
        return;
      }

      try {
        setLoading(true);
        
        // Call enrich-details API to get dern_anomalie
        const response = await fetch('/api/colissimo/enrich-details', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ codeBars: [enrichedColis.code] }),
        });
        
        const result = await response.json();
        
        if (result.success && result.data[enrichedColis.code]) {
          // Merge enriched data with existing colis data
          setEnrichedColis({
            ...colis,
            dern_anomalie: result.data[enrichedColis.code].dern_anomalie || null,
          });
        } else {
          setEnrichedColis(colis);
        }
      } catch (error) {
        console.error('Error fetching enriched details:', error);
        setEnrichedColis(colis);
      } finally {
        setLoading(false);
      }
    };

    fetchEnrichedDetails();
  }, [colis]);

  if (!colis) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 glass px-6 py-5 flex justify-between items-center border-b-2 border-gray-100">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-xl shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold gradient-text">Détails du Colis</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-all"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Reference and Status */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100 shadow-inner">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Référence</p>
                <p className="text-2xl font-bold gradient-text">{enrichedColis.reference}</p>
              </div>
              {enrichedColis.numero_colis && (
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-600 mb-1">Numéro Colis</p>
                  <p className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{enrichedColis.numero_colis}</p>
                </div>
              )}
            </div>
          </div>

          {/* Client Information */}
          <div>
            <h4 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-3">
              <User size={20} />
              Informations Client
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Nom du client</p>
                <p className="font-medium text-gray-900">{enrichedColis.client}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Téléphone 1</p>
                <p className="font-medium text-gray-900">{enrichedColis.tel1}</p>
              </div>
              {enrichedColis.tel2 && (
                <div>
                  <p className="text-sm text-gray-600">Téléphone 2</p>
                  <p className="font-medium text-gray-900">{enrichedColis.tel2}</p>
                </div>
              )}
            </div>
          </div>

          {/* Address Information */}
          <div>
            <h4 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-3">
              <MapPin size={20} />
              Adresse de Livraison
            </h4>
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <p className="font-medium text-gray-900">{enrichedColis.adresse}</p>
              <p className="text-gray-700">{enrichedColis.ville}, {enrichedColis.gouvernorat}</p>
            </div>
          </div>

          {/* Package Information */}
          <div>
            <h4 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-3">
              <Package size={20} />
              Informations Colis
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Désignation</p>
                <p className="font-medium text-gray-900">{enrichedColis.designation}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Type</p>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                  enrichedColis.type === 'VO' ? 'bg-blue-100 text-blue-800' :
                  enrichedColis.type === 'EC' ? 'bg-green-100 text-green-800' :
                  'bg-purple-100 text-purple-800'
                }`}>
                  {enrichedColis.type}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Nombre de pièces</p>
                <p className="font-medium text-gray-900">{enrichedColis.nb_pieces}</p>
              </div>
              {enrichedColis.poids && enrichedColis.poids > 0 && (
                <div>
                  <p className="text-sm text-gray-600">Poids</p>
                  <p className="font-medium text-gray-900">{enrichedColis.poids} kg</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-600">Échange</p>
                <p className="font-medium text-gray-900">{enrichedColis.echange ? 'Oui' : 'Non'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Statut</p>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                  (enrichedColis.etat === 'Livré' || enrichedColis.etat === 'livré') ? 
                    'bg-green-100 text-green-800' :
                  (enrichedColis.etat === 'En Cours de Livraison' || enrichedColis.etat === 'En cours') ? 
                    'bg-blue-100 text-blue-800' :
                  (enrichedColis.etat === 'En Attente') ?
                    'bg-yellow-100 text-yellow-800' :
                  (enrichedColis.etat === 'Annulé') ?
                    'bg-red-100 text-red-800' :
                  (enrichedColis.etat === 'A Enlever') ?
                    'bg-orange-100 text-orange-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {enrichedColis.etat || enrichedColis.statut || 'En Attente'}
                </span>
              </div>
            </div>
          </div>

          {/* Financial Information */}
          <div>
            <h4 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-3">
              <DollarSign size={20} />
              Informations Financières
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Prix</p>
                <p className="text-xl font-bold text-green-600">{enrichedColis.prix} TND</p>
              </div>
              {enrichedColis.cod && enrichedColis.cod > 0 && (
                <div>
                  <p className="text-sm text-gray-600">COD</p>
                  <p className="text-xl font-bold text-blue-600">{enrichedColis.cod} TND</p>
                </div>
              )}
            </div>
          </div>

          {/* Cause Section - for Anomaly */}
          {enrichedColis.etat === 'Anomalie de Livraison' && (
            <div className="bg-gradient-to-br from-rose-50 to-red-50 rounded-xl p-6 border-2 border-rose-400 shadow-lg">
              <h4 className="flex items-center gap-2 text-2xl font-bold text-red-800 mb-4">
                <AlertTriangle size={24} className="text-red-600" />
                ⚠️ Cause de l'Anomalie
              </h4>
              {loading ? (
                <div className="bg-white border-2 border-red-300 p-5 rounded-lg">
                  <p className="text-gray-500 animate-pulse">Chargement de la cause...</p>
                </div>
              ) : (
                <div className="bg-white border-2 border-red-300 p-5 rounded-lg">
                  <p className="text-red-900 font-bold text-lg">
                    {enrichedColis.dern_anomalie || 'Aucune cause spécifiée'}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Comments */}
          {enrichedColis.commentaire && (
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-3">Commentaire</h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">{enrichedColis.commentaire}</p>
              </div>
            </div>
          )}

          {/* Date */}
          {enrichedColis.date_creation && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar size={16} />
              <span>Créé le: {new Date(enrichedColis.date_creation).toLocaleDateString('fr-FR')}</span>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 glass border-t-2 border-gray-100 px-6 py-4">
          <button
            onClick={onClose}
            className="w-full btn-primary"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

