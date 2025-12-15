'use client';

import { X, User, Phone, MapPin, Package, Calendar, Truck } from 'lucide-react';
import { Colis } from '@/types/colissimo';

interface DeliveryDetailsModalProps {
  colis: Colis;
  onClose: () => void;
}

export default function DeliveryDetailsModal({ colis, onClose }: DeliveryDetailsModalProps) {
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

        {/* Content */}
        <div className="space-y-6">
          {/* Status Badge */}
          <div className="flex items-center justify-center">
            <span className="px-4 py-2 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 rounded-full text-sm font-semibold flex items-center gap-2">
              <Truck size={16} />
              {colis.etat || 'En Cours de Livraison'}
            </span>
          </div>

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

          {/* Payment Info */}
          {colis.num_paiement && (
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-4 border border-indigo-200">
              <h3 className="font-semibold text-gray-900 mb-2">Numéro de Paiement</h3>
              <p className="font-mono text-gray-900">{colis.num_paiement}</p>
            </div>
          )}
        </div>

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
    </div>
  );
}

