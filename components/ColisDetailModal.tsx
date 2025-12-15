'use client';

import { Colis } from '@/types/colissimo';
import { X, Package, User, MapPin, Phone, DollarSign, Calendar } from 'lucide-react';

interface ColisDetailModalProps {
  colis: Colis | null;
  onClose: () => void;
}

export default function ColisDetailModal({ colis, onClose }: ColisDetailModalProps) {
  if (!colis) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scaleIn">
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
                <p className="text-2xl font-bold gradient-text">{colis.reference}</p>
              </div>
              {colis.numero_colis && (
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-600 mb-1">Numéro Colis</p>
                  <p className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{colis.numero_colis}</p>
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
                <p className="font-medium text-gray-900">{colis.client}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Téléphone 1</p>
                <p className="font-medium text-gray-900">{colis.tel1}</p>
              </div>
              {colis.tel2 && (
                <div>
                  <p className="text-sm text-gray-600">Téléphone 2</p>
                  <p className="font-medium text-gray-900">{colis.tel2}</p>
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
              <p className="font-medium text-gray-900">{colis.adresse}</p>
              <p className="text-gray-700">{colis.ville}, {colis.gouvernorat}</p>
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
                <p className="font-medium text-gray-900">{colis.designation}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Type</p>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                  colis.type === 'VO' ? 'bg-blue-100 text-blue-800' :
                  colis.type === 'EC' ? 'bg-green-100 text-green-800' :
                  'bg-purple-100 text-purple-800'
                }`}>
                  {colis.type}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Nombre de pièces</p>
                <p className="font-medium text-gray-900">{colis.nb_pieces}</p>
              </div>
              {colis.poids && colis.poids > 0 && (
                <div>
                  <p className="text-sm text-gray-600">Poids</p>
                  <p className="font-medium text-gray-900">{colis.poids} kg</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-600">Échange</p>
                <p className="font-medium text-gray-900">{colis.echange ? 'Oui' : 'Non'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Statut</p>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                  (colis.etat === 'Livré' || colis.etat === 'livré') ? 
                    'bg-green-100 text-green-800' :
                  (colis.etat === 'En Cours de Livraison' || colis.etat === 'En cours') ? 
                    'bg-blue-100 text-blue-800' :
                  (colis.etat === 'En Attente') ?
                    'bg-yellow-100 text-yellow-800' :
                  (colis.etat === 'Annulé') ?
                    'bg-red-100 text-red-800' :
                  (colis.etat === 'A Enlever') ?
                    'bg-orange-100 text-orange-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {colis.etat || colis.statut || 'En Attente'}
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
                <p className="text-xl font-bold text-green-600">{colis.prix} TND</p>
              </div>
              {colis.cod && colis.cod > 0 && (
                <div>
                  <p className="text-sm text-gray-600">COD</p>
                  <p className="text-xl font-bold text-blue-600">{colis.cod} TND</p>
                </div>
              )}
            </div>
          </div>

          {/* Comments */}
          {colis.commentaire && (
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-3">Commentaire</h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">{colis.commentaire}</p>
              </div>
            </div>
          )}

          {/* Date */}
          {colis.date_creation && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar size={16} />
              <span>Créé le: {new Date(colis.date_creation).toLocaleDateString('fr-FR')}</span>
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

