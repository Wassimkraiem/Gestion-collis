'use client';

import { X, User, Phone, MapPin, Package, Calendar, Truck } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Colis } from '@/types/colissimo';

interface DeliveryDetailsModalProps {
  colis: Colis;
  onClose: () => void;
}

export default function DeliveryDetailsModal({ colis, onClose }: DeliveryDetailsModalProps) {
  const [detailedData, setDetailedData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/colissimo/detail?id=${colis.code}`);
        const result = await response.json();
        
        if (result.success) {
          console.log('=== Detailed Colis Data from API ===');
          console.log('Full response:', JSON.stringify(result.data, null, 2));
          
          // Log the getColisResult specifically
          if (result.data.getColisResult) {
            console.log('getColisResult:', JSON.stringify(result.data.getColisResult, null, 2));
            
            // Try to find tracking/delivery info in different fields
            const colisResult = result.data.getColisResult;
            if (colisResult.result_content) {
              console.log('result_content:', colisResult.result_content);
            }
            if (colisResult.colis) {
              console.log('colis data:', JSON.stringify(colisResult.colis, null, 2));
            }
          }
          
          setDetailedData(result.data);
        }
      } catch (error) {
        console.error('Error fetching details:', error);
      } finally {
        setLoading(false);
      }
    };

    if (colis.code) {
      fetchDetails();
    }
  }, [colis.code]);
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scaleIn">
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
          
          {/* Raw API Response (Debug) */}
          {detailedData && (
            <details className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <summary className="font-semibold text-gray-900 cursor-pointer">
                📋 Données API Complètes (Debug)
              </summary>
              <pre className="mt-4 text-xs bg-white p-4 rounded border border-gray-300 overflow-auto max-h-96">
                {JSON.stringify(detailedData, null, 2)}
              </pre>
            </details>
          )}
          {/* Status Badge */}
          <div className="flex items-center justify-center">
            <span className="px-4 py-2 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 rounded-full text-sm font-semibold flex items-center gap-2">
              <Truck size={16} />
              {colis.etat || 'En Cours de Livraison'}
            </span>
          </div>

          {/* Delivery Person Details (Most Important) */}
          {detailedData?.getColisResult && (
            <>
              {/* Parse the tracking text for delivery person info */}
              {(() => {
                const result = detailedData.getColisResult;
                let trackingText = '';
                let colisData = null;
                
                // Try to find tracking info in different possible fields
                if (result.result_content) {
                  if (typeof result.result_content === 'string') {
                    trackingText = result.result_content;
                  } else if (result.result_content.colis) {
                    colisData = result.result_content.colis;
                    // Try to get tracking text from colis object
                    if (colisData.suivi) trackingText = colisData.suivi;
                    if (colisData.tracking) trackingText = colisData.tracking;
                    if (colisData.details_livraison) trackingText = colisData.details_livraison;
                  }
                }
                
                // Also check top-level fields
                if (!trackingText && result.suivi) trackingText = result.suivi;
                if (!trackingText && result.tracking_info) trackingText = result.tracking_info;
                if (!trackingText && result.details) trackingText = result.details;
                
                // Check if we have colis data with delivery info
                if (colisData) {
                  const livreurNom = colisData.livreur_nom || colisData.nom_livreur;
                  const livreurTel = colisData.livreur_tel || colisData.tel_livreur || colisData.livreur_telephone;
                  const runsheet = colisData.runsheet || colisData.num_runsheet || colisData.numero_runsheet;
                  const agence = colisData.agence || colisData.agence_livraison;
                  const affectePar = colisData.affecte_par || colisData.assigned_by;
                  
                  if (livreurNom || livreurTel || runsheet) {
                    return (
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-300 shadow-lg">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-lg">
                          <User size={20} className="text-green-600" />
                          👤 Informations du Livreur
                        </h3>
                        <div className="space-y-4">
                          {livreurNom && (
                            <div className="bg-white rounded-lg p-4 shadow-sm">
                              <p className="text-sm text-gray-600 mb-1">Nom du Livreur</p>
                              <p className="font-bold text-gray-900 text-lg">{livreurNom}</p>
                            </div>
                          )}
                          {livreurTel && (
                            <div className="bg-white rounded-lg p-4 shadow-sm">
                              <p className="text-sm text-gray-600 mb-1">📞 Téléphone du Livreur</p>
                              <p className="font-bold text-green-700 text-xl">{livreurTel}</p>
                              <a 
                                href={`tel:${livreurTel}`}
                                className="inline-block mt-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-semibold"
                              >
                                📞 Appeler maintenant
                              </a>
                            </div>
                          )}
                          {runsheet && (
                            <div className="bg-white rounded-lg p-3 shadow-sm">
                              <p className="text-sm text-gray-600">N° Runsheet</p>
                              <p className="font-semibold text-gray-900">{runsheet}</p>
                            </div>
                          )}
                          {agence && (
                            <div className="bg-white rounded-lg p-3 shadow-sm">
                              <p className="text-sm text-gray-600">Agence</p>
                              <p className="font-semibold text-gray-900">{agence}</p>
                            </div>
                          )}
                          {affectePar && (
                            <div className="bg-white rounded-lg p-3 shadow-sm">
                              <p className="text-sm text-gray-600">Affecté par</p>
                              <p className="font-semibold text-gray-900">{affectePar}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  }
                }
                
                // Fallback: Try to parse from tracking text
                if (trackingText) {
                  const livreurMatch = trackingText.match(/Livreur\s*:\s*([^(]+)\s*\(\s*(\d+)\s*\)/i);
                  const runsheetMatch = trackingText.match(/runsheet\s*N°\s*(\d+)/i);
                  const agenceMatch = trackingText.match(/agence\s+([A-Z]+)/i);
                  const assignedByMatch = trackingText.match(/par\s+([^L]+)(?=Livreur)/i);
                  
                  if (livreurMatch || runsheetMatch) {
                    return (
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-300 shadow-lg">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-lg">
                          <User size={20} className="text-green-600" />
                          👤 Informations du Livreur
                        </h3>
                        <div className="space-y-4">
                          {livreurMatch && (
                            <>
                              <div className="bg-white rounded-lg p-4 shadow-sm">
                                <p className="text-sm text-gray-600 mb-1">Nom du Livreur</p>
                                <p className="font-bold text-gray-900 text-lg">{livreurMatch[1].trim()}</p>
                              </div>
                              <div className="bg-white rounded-lg p-4 shadow-sm">
                                <p className="text-sm text-gray-600 mb-1">📞 Téléphone du Livreur</p>
                                <p className="font-bold text-green-700 text-xl">{livreurMatch[2]}</p>
                                <a 
                                  href={`tel:${livreurMatch[2]}`}
                                  className="inline-block mt-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-semibold"
                                >
                                  📞 Appeler maintenant
                                </a>
                              </div>
                            </>
                          )}
                          {runsheetMatch && (
                            <div className="bg-white rounded-lg p-3 shadow-sm">
                              <p className="text-sm text-gray-600">N° Runsheet</p>
                              <p className="font-semibold text-gray-900">{runsheetMatch[1]}</p>
                            </div>
                          )}
                          {agenceMatch && (
                            <div className="bg-white rounded-lg p-3 shadow-sm">
                              <p className="text-sm text-gray-600">Agence</p>
                              <p className="font-semibold text-gray-900">{agenceMatch[1]}</p>
                            </div>
                          )}
                          {assignedByMatch && (
                            <div className="bg-white rounded-lg p-3 shadow-sm">
                              <p className="text-sm text-gray-600">Affecté par</p>
                              <p className="font-semibold text-gray-900">{assignedByMatch[1].trim()}</p>
                            </div>
                          )}
                        </div>
                        <details className="mt-4">
                          <summary className="text-sm text-gray-600 cursor-pointer hover:text-gray-900">
                            Voir le texte complet
                          </summary>
                          <p className="mt-2 text-sm text-gray-700 bg-white p-3 rounded border">{trackingText}</p>
                        </details>
                      </div>
                    );
                  }
                }
                
                return null;
              })()}
            </>
          )}

          {/* Tracking Information */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Package size={18} className="text-blue-600" />
              Informations de Suivi
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Code Barre</p>
                <p className="font-semibold text-gray-900">{colis.code || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Référence</p>
                <p className="font-semibold text-gray-900">{colis.reference || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">N° Manifeste</p>
                <p className="font-semibold text-gray-900">{colis.num_manifeste || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Agence Actuelle</p>
                <p className="font-semibold text-gray-900">{colis.agence_actuelle || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Client Information */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <User size={18} className="text-gray-600" />
              Informations Client
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Nom du Client</p>
                <p className="font-semibold text-gray-900">{colis.client}</p>
              </div>
              <div className="flex items-start gap-2">
                <Phone size={16} className="text-gray-400 mt-1" />
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Téléphone</p>
                  <p className="font-semibold text-gray-900">{colis.tel1}</p>
                  {colis.tel2 && (
                    <p className="font-semibold text-gray-900">{colis.tel2}</p>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MapPin size={16} className="text-gray-400 mt-1" />
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Adresse de Livraison</p>
                  <p className="font-semibold text-gray-900">{colis.adresse}</p>
                  <p className="text-sm text-gray-600">{colis.ville}, {colis.gouvernorat}</p>
                </div>
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
                <p className="font-semibold text-gray-900">{colis.designation}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Prix</p>
                <p className="font-semibold text-gray-900">{colis.prix} TND</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Nombre de Pièces</p>
                <p className="font-semibold text-gray-900">{colis.nb_pieces}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Type</p>
                <p className="font-semibold text-gray-900">
                  {colis.type === 'VO' ? 'Vente en Ligne' : colis.type === 'EC' ? 'Échange' : 'Document'}
                </p>
              </div>
              {colis.poids && (
                <div>
                  <p className="text-sm text-gray-600">Poids</p>
                  <p className="font-semibold text-gray-900">{colis.poids} kg</p>
                </div>
              )}
              {colis.cod && (
                <div>
                  <p className="text-sm text-gray-600">COD</p>
                  <p className="font-semibold text-gray-900">{colis.cod} TND</p>
                </div>
              )}
            </div>
          </div>

          {/* Timeline */}
          {colis.date_creation && (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Calendar size={18} className="text-green-600" />
                Chronologie
              </h3>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="text-sm text-gray-600">Date de Création</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(colis.date_creation).toLocaleString('fr-FR')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Comments */}
          {colis.commentaire && (
            <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl p-4 border border-yellow-200">
              <h3 className="font-semibold text-gray-900 mb-2">Commentaires</h3>
              <p className="text-gray-700">{colis.commentaire}</p>
            </div>
          )}

          {/* Additional Fields from API */}
          {detailedData && detailedData.getColisResult && (
            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-4 border border-cyan-200">
              <h3 className="font-semibold text-gray-900 mb-3">Informations Supplémentaires de l'API</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {Object.entries(detailedData.getColisResult).map(([key, value]) => (
                  <div key={key}>
                    <p className="text-gray-600 capitalize">{key.replace(/_/g, ' ')}</p>
                    <p className="font-semibold text-gray-900">
                      {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Payment Info */}
          {colis.num_paiement && (
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-4 border border-indigo-200">
              <h3 className="font-semibold text-gray-900 mb-2">Numéro de Paiement</h3>
              <p className="font-mono text-gray-900">{colis.num_paiement}</p>
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

