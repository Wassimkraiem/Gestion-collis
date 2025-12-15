'use client';

import { Colis } from '@/types/colissimo';
import { useEffect } from 'react';

interface ColisPrintViewProps {
  colis: Colis;
}

export default function ColisPrintView({ colis }: ColisPrintViewProps) {
  useEffect(() => {
    // Trigger print dialog after component mounts
    const timer = setTimeout(() => {
      window.print();
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="print-container p-8 max-w-4xl mx-auto bg-white">
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-container, .print-container * {
            visibility: visible;
          }
          .print-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          @page {
            margin: 2cm;
            size: A4;
          }
        }
      `}</style>

      {/* Header */}
      <div className="border-b-4 border-blue-600 pb-6 mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Détails du Colis</h1>
        <p className="text-gray-500">Code: {colis.code || 'N/A'}</p>
        <p className="text-sm text-gray-400">Date d'impression: {new Date().toLocaleString('fr-TN')}</p>
      </div>

      {/* Client Information */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4 border-b-2 border-gray-200 pb-2">
          Informations Client
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500 font-semibold">Nom du Client</p>
            <p className="text-base text-gray-900">{colis.client || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 font-semibold">Téléphone</p>
            <p className="text-base text-gray-900">{colis.tel1 || 'N/A'}</p>
          </div>
          <div className="col-span-2">
            <p className="text-sm text-gray-500 font-semibold">Adresse</p>
            <p className="text-base text-gray-900">{colis.adresse || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 font-semibold">Ville</p>
            <p className="text-base text-gray-900">{colis.ville || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 font-semibold">Gouvernorat</p>
            <p className="text-base text-gray-900">{colis.gouvernorat || 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Package Information */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4 border-b-2 border-gray-200 pb-2">
          Informations Colis
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500 font-semibold">Référence</p>
            <p className="text-base text-gray-900">{colis.reference || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 font-semibold">Type</p>
            <p className="text-base text-gray-900 font-bold">
              {colis.type === 'VO' ? 'Vente' : colis.type === 'EC' ? 'Échange' : colis.type}
            </p>
          </div>
          <div className="col-span-2">
            <p className="text-sm text-gray-500 font-semibold">Désignation</p>
            <p className="text-base text-gray-900">{colis.designation || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 font-semibold">Nombre de Pièces</p>
            <p className="text-base text-gray-900">{colis.nb_pieces || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 font-semibold">Prix</p>
            <p className="text-base text-gray-900 font-bold">{colis.prix} TND</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 font-semibold">Statut</p>
            <p className="text-base text-gray-900 font-bold">
              {colis.etat || colis.statut || 'En Attente'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 font-semibold">Échange</p>
            <p className="text-base text-gray-900">{colis.echange ? 'Oui' : 'Non'}</p>
          </div>
        </div>
      </div>

      {/* Delivery Information (if available) */}
      {(colis.agence_actuelle || colis.num_manifeste) && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4 border-b-2 border-gray-200 pb-2">
            Informations de Livraison
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {colis.agence_actuelle && (
              <div>
                <p className="text-sm text-gray-500 font-semibold">Agence Actuelle</p>
                <p className="text-base text-gray-900">{colis.agence_actuelle}</p>
              </div>
            )}
            {colis.num_manifeste && (
              <div>
                <p className="text-sm text-gray-500 font-semibold">N° Manifeste</p>
                <p className="text-base text-gray-900">{colis.num_manifeste}</p>
              </div>
            )}
            {colis.date_creation && (
              <div>
                <p className="text-sm text-gray-500 font-semibold">Date de Création</p>
                <p className="text-base text-gray-900">
                  {new Date(colis.date_creation).toLocaleString('fr-TN')}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Cause Section - for Anomaly */}
      {colis.etat === 'Anomalie de Livraison' && (colis.anomalie || colis.cause_anomalie || colis.commentaire) && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-red-800 mb-4 border-b-4 border-red-500 pb-2 flex items-center gap-2">
            ⚠️ Cause
          </h2>
          <div className="bg-red-50 border-2 border-red-300 p-6 rounded-lg">
            <p className="text-lg text-red-900 font-semibold">
              {colis.anomalie || colis.cause_anomalie || colis.commentaire || 'Aucune cause spécifiée'}
            </p>
          </div>
        </div>
      )}

      {/* Comments */}
      {colis.commentaire && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4 border-b-2 border-gray-200 pb-2">
            Commentaires
          </h2>
          <p className="text-base text-gray-900">{colis.commentaire}</p>
        </div>
      )}

      {/* Footer */}
      <div className="mt-12 pt-6 border-t-2 border-gray-200">
        <p className="text-sm text-gray-500 text-center">
          Document généré automatiquement - Colissimo Management System
        </p>
      </div>
    </div>
  );
}

