'use client';

import { Colis } from '@/types/colissimo';
import { X, AlertTriangle } from 'lucide-react';

interface DeleteConfirmModalProps {
  colis: Colis | null;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}

export default function DeleteConfirmModal({ colis, onConfirm, onCancel, loading }: DeleteConfirmModalProps) {
  if (!colis) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
      onClick={onCancel}
    >
      <div 
        className="card max-w-md w-full p-6 animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-red-500 to-red-600 p-3 rounded-xl shadow-lg animate-pulse">
              <AlertTriangle className="text-white" size={24} />
            </div>
            <h3 className="text-2xl font-bold gradient-text">Confirmer la suppression</h3>
          </div>
          <button
            onClick={onCancel}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-all"
          >
            <X size={24} />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-gray-700 text-lg mb-4">
            Êtes-vous sûr de vouloir supprimer ce colis ?
          </p>
          <div className="bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-500 p-5 rounded-lg space-y-3 shadow-inner">
            {colis.code && (
              <p className="text-sm flex items-center gap-2">
                <span className="font-semibold text-gray-700">Code:</span> 
                <span className="text-gray-900 font-medium">{colis.code}</span>
              </p>
            )}
            {colis.reference && (
              <p className="text-sm flex items-center gap-2">
                <span className="font-semibold text-gray-700">Référence:</span> 
                <span className="text-gray-900 font-medium">{colis.reference}</span>
              </p>
            )}
            <p className="text-sm flex items-center gap-2">
              <span className="font-semibold text-gray-700">Client:</span> 
              <span className="text-gray-900 font-medium">{colis.client}</span>
            </p>
            <p className="text-sm flex items-center gap-2">
              <span className="font-semibold text-gray-700">Téléphone:</span> 
              <span className="text-gray-900 font-medium">{colis.tel1}</span>
            </p>
          </div>
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className="text-red-700 text-sm font-medium">
              Cette action est irréversible et supprimera définitivement ce colis.
            </p>
          </div>
        </div>

        <div className="flex gap-3 justify-end pt-4 border-t-2 border-gray-100">
          <button
            onClick={onCancel}
            disabled={loading}
            className="btn-secondary"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="btn-danger flex items-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                <span>Suppression...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>Supprimer</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

