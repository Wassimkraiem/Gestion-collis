'use client';

import { X, User, Phone, MapPin, Package, Calendar, Truck, AlertTriangle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Colis } from '@/types/colissimo';

interface DeliveryDetailsModalProps {
  colis: Colis;
  onClose: () => void;
}

export default function DeliveryDetailsModal({ colis, onClose }: DeliveryDetailsModalProps) {
  const [enrichedColis, setEnrichedColis] = useState<any>(colis);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEnrichedDetails = async () => {
      if (!colis.code) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Call enrich-details API to get livreur, tel_livreur, dern_anomalie
        const response = await fetch('/api/colissimo/enrich-details', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ codeBars: [colis.code] }),
        });
        
        const result = await response.json();
        
        if (result.success && result.data[colis.code]) {
          // Merge enriched data with existing colis data
          setEnrichedColis({
            ...colis,
            livreur: result.data[colis.code].livreur || '',
            tel_livreur: result.data[colis.code].tel_livreur || '',
            dern_anomalie: result.data[colis.code].dern_anomalie || null,
            date_enlevement: result.data[colis.code].date_enlevement || null,
            date_livraison: result.data[colis.code].date_livraison || null,
            frais_livraison: result.data[colis.code].frais_livraison ?? 0,
            frais_retour: result.data[colis.code].frais_retour ?? 0,
          });
        } else {
          // Use original colis data if enrichment fails
          setEnrichedColis(colis);
        }
      } catch (error) {
        console.error('Error fetching enriched details:', error);
        // Use original colis data if enrichment fails
        setEnrichedColis(colis);
      } finally {
        setLoading(false);
      }
    };

    fetchEnrichedDetails();
  }, [colis]);

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-lg">
              <Truck className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold gradient-text">Détails de Livraison</h2>
              <p className="text-sm text-gray-500">Colis en cours de livraison</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement des détails...</p>
          </div>
        )}

        {/* Content */}
        {!loading && (
        <div className="space-y-6">
          {/* HERO SECTION: Anomaly - Most Important for Anomaly Colis! */}
          {(enrichedColis.etat === 'Anomalie de Livraison' && enrichedColis.dern_anomalie) ? (
            <div className="bg-gradient-to-br from-rose-400 via-red-500 to-rose-600 rounded-2xl p-8 shadow-2xl border-4 border-red-300 animate-pulse-slow">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full shadow-lg mb-4">
                  <AlertTriangle size={40} className="text-red-600" />
                </div>
                <h2 className="text-3xl font-extrabold text-white mb-2">⚠️ Anomalie de Livraison</h2>
                <p className="text-red-100 text-lg">Raison du problème de livraison</p>
              </div>
              
              <div className="bg-white rounded-xl p-8 shadow-xl">
                <p className="text-sm text-gray-500 mb-3 uppercase tracking-wide">⚠️ Cause de l'Anomalie</p>
                <p className="font-black text-red-700 text-4xl">{enrichedColis.dern_anomalie}</p>
              </div>
            </div>
          ) : (enrichedColis.livreur || enrichedColis.tel_livreur) ? (
            /* HERO SECTION: Delivery Person Details */
            <div className="bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600 rounded-2xl p-8 shadow-2xl border-4 border-green-300 animate-pulse-slow">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full shadow-lg mb-4">
                  <Truck size={40} className="text-green-600" />
                </div>
                <h2 className="text-3xl font-extrabold text-white mb-2">🚚 Livreur Assigné</h2>
                <p className="text-green-100 text-lg">Contactez votre livreur directement</p>
              </div>
              
              <div className="space-y-4">
                {enrichedColis.livreur && (
                  <div className="bg-white rounded-xl p-6 shadow-xl">
                    <p className="text-sm text-gray-500 mb-2 uppercase tracking-wide">👤 Nom du Livreur</p>
                    <p className="font-black text-gray-900 text-3xl">{enrichedColis.livreur}</p>
                  </div>
                )}
                {enrichedColis.tel_livreur && (
                  <div className="bg-white rounded-xl p-6 shadow-xl">
                    <p className="text-sm text-gray-500 mb-2 uppercase tracking-wide">📞 Téléphone</p>
                    <p className="font-black text-green-700 text-4xl">{enrichedColis.tel_livreur}</p>
                  </div>
                )}
                {enrichedColis.agence_actuelle && (
                  <div className="bg-white/90 rounded-lg p-4">
                    <p className="text-sm text-gray-600">📍 Agence</p>
                    <p className="font-bold text-gray-900 text-xl">{enrichedColis.agence_actuelle}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Status Badge (only shown if no livreur info and no anomaly) */
            <div className="flex items-center justify-center">
              <span className="px-4 py-2 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 rounded-full text-sm font-semibold flex items-center gap-2">
                <Truck size={16} />
                {enrichedColis.etat || 'En Cours de Livraison'}
              </span>
            </div>
          )}

          {/* Destination - Client Information */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2 text-lg">
              <MapPin size={20} className="text-blue-600" />
              📍 Destination de Livraison
            </h3>
            <div className="space-y-3 bg-white rounded-lg p-4">
              <div>
                <p className="text-sm text-gray-600">Client</p>
                <p className="font-bold text-gray-900 text-lg">{enrichedColis.client}</p>
              </div>
              <div className="flex items-start gap-2">
                <Phone size={16} className="text-gray-400 mt-1" />
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Téléphone Client</p>
                  <p className="font-semibold text-gray-900">{enrichedColis.tel1}</p>
                  {enrichedColis.tel2 && (
                    <p className="font-semibold text-gray-900">{enrichedColis.tel2}</p>
                  )}
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600">Adresse Complète</p>
                <p className="font-semibold text-gray-900">{enrichedColis.adresse}</p>
                <p className="text-sm text-gray-600 mt-1">{enrichedColis.ville}, {enrichedColis.gouvernorat}</p>
              </div>
            </div>
          </div>

          {/* Tracking Information */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Package size={18} className="text-gray-600" />
              Informations de Suivi
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Code Barre</p>
                <p className="font-semibold text-gray-900">{enrichedColis.code || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Référence</p>
                <p className="font-semibold text-gray-900">{enrichedColis.reference || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">N° Manifeste</p>
                <p className="font-semibold text-gray-900">{enrichedColis.num_manifeste || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">État</p>
                <p className="font-semibold text-blue-700">{enrichedColis.etat || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Package Details */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Package size={18} className="text-purple-600" />
              Détails du Colis
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Désignation</p>
                <p className="font-semibold text-gray-900">{enrichedColis.designation}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Prix</p>
                <p className="font-semibold text-gray-900">{enrichedColis.prix} TND</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Nombre de Pièces</p>
                <p className="font-semibold text-gray-900">{enrichedColis.nb_pieces}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Type</p>
                <p className="font-semibold text-gray-900">
                  {enrichedColis.type === 'VO' ? 'Vente en Ligne' : enrichedColis.type === 'EC' ? 'Échange' : 'Document'}
                </p>
              </div>
            </div>
          </div>

          {/* Timeline */}
          {(enrichedColis.date_creation || enrichedColis.date_enlevement || enrichedColis.date_livraison) && (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Calendar size={18} className="text-green-600" />
                Chronologie
              </h3>
              <div className="space-y-2">
                {enrichedColis.date_creation && (
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div>
                      <p className="text-sm text-gray-600">Date de Création</p>
                      <p className="font-semibold text-gray-900">
                        {new Date(enrichedColis.date_creation).toLocaleString('fr-FR')}
                      </p>
                    </div>
                  </div>
                )}
                {enrichedColis.date_enlevement && (
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <div>
                      <p className="text-sm text-gray-600">Date d'Enlèvement</p>
                      <p className="font-semibold text-gray-900">
                        {new Date(enrichedColis.date_enlevement).toLocaleString('fr-FR')}
                      </p>
                    </div>
                  </div>
                )}
                {enrichedColis.date_livraison && (
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="text-sm text-gray-600">Date de Livraison</p>
                      <p className="font-semibold text-gray-900">
                        {new Date(enrichedColis.date_livraison).toLocaleString('fr-FR')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Comments */}
          {enrichedColis.commentaire && (
            <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl p-4 border border-yellow-200">
              <h3 className="font-semibold text-gray-900 mb-2">Commentaires</h3>
              <p className="text-gray-700">{enrichedColis.commentaire}</p>
            </div>
          )}

          {/* Fees Information */}
          {(enrichedColis.frais_livraison !== undefined || enrichedColis.frais_retour !== undefined) && (
            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-4 border border-cyan-200">
              <h3 className="font-semibold text-gray-900 mb-3">Frais</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {enrichedColis.frais_livraison !== undefined && (
                  <div>
                    <p className="text-gray-600">Frais de Livraison</p>
                    <p className="font-semibold text-gray-900">{enrichedColis.frais_livraison} TND</p>
                  </div>
                )}
                {enrichedColis.frais_retour !== undefined && (
                  <div>
                    <p className="text-gray-600">Frais de Retour</p>
                    <p className="font-semibold text-gray-900">{enrichedColis.frais_retour} TND</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Payment Info */}
          {enrichedColis.num_paiement && (
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-4 border border-indigo-200">
              <h3 className="font-semibold text-gray-900 mb-2">Numéro de Paiement</h3>
              <p className="font-mono text-gray-900">{enrichedColis.num_paiement}</p>
            </div>
          )}

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors font-medium"
            >
              Fermer
            </button>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}
