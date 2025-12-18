'use client';

import { useState, useEffect } from 'react';
import { ColisFormData, Colis } from '@/types/colissimo';

interface ColisFormProps {
  colis?: Colis | null;
  onSubmit: (data: ColisFormData) => Promise<void>;
  onCancel: () => void;
}

interface GouvernoratData {
  gouvernorat: string;
  villes: string[];
}

export default function ColisForm({ colis, onSubmit, onCancel }: ColisFormProps) {
  const [formData, setFormData] = useState<ColisFormData>({
    reference: '',
    client: '',
    adresse: '',
    ville: '',
    gouvernorat: '',
    tel1: '',
    tel2: '',
    designation: '',
    prix: 0,
    nb_pieces: 1,
    type: 'VO',
    commentaire: '',
    echange: 0,
    cod: 0,
    poids: 0
  });
  
  const [loading, setLoading] = useState(false);
  const [gouvernorats, setGouvernorats] = useState<GouvernoratData[]>([]);
  const [availableVilles, setAvailableVilles] = useState<string[]>([]);

  // Check if form has been modified (is "dirty")
  const isFormDirty = () => {
    // When editing, we don't consider it dirty at initial state
    if (colis) {
      return (
        formData.reference !== (colis.reference || '') ||
        formData.client !== (colis.client || '') ||
        formData.adresse !== (colis.adresse || '') ||
        formData.ville !== (colis.ville || '') ||
        formData.gouvernorat !== (colis.gouvernorat || '') ||
        formData.tel1 !== (colis.tel1 || '') ||
        formData.tel2 !== (colis.tel2 || '') ||
        formData.designation !== (colis.designation || '') ||
        formData.prix !== (colis.prix || 0) ||
        formData.nb_pieces !== (colis.nb_pieces || 1) ||
        formData.type !== (colis.type || 'VO') ||
        formData.commentaire !== (colis.commentaire || '') ||
        formData.echange !== (colis.echange || 0) ||
        formData.cod !== (colis.cod || 0) ||
        formData.poids !== (colis.poids || 0)
      );
    }
    
    // When adding new, check if any field has been filled
    return (
      formData.reference !== '' ||
      formData.client !== '' ||
      formData.adresse !== '' ||
      formData.ville !== '' ||
      formData.tel1 !== '' ||
      formData.tel2 !== '' ||
      formData.designation !== '' ||
      formData.commentaire !== ''
    );
  };

  // Handle backdrop click with dirty check
  const handleBackdropClick = () => {
    if (isFormDirty()) {
      const confirmClose = window.confirm(
        'Vous avez des modifications non enregistrées. Voulez-vous vraiment quitter sans sauvegarder ?'
      );
      if (confirmClose) {
        onCancel();
      }
    } else {
      onCancel();
    }
  };

  // Fetch gouvernorats on mount
  useEffect(() => {
    const fetchGouvernorats = async () => {
      try {
        const response = await fetch('/api/colissimo/gouvernorats');
        const result = await response.json();
        
        if (result.success && result.data) {
          setGouvernorats(result.data);
          
          // Set first gouvernorat as default if no colis data
          if (!colis && result.data.length > 0) {
            const firstGouv = result.data[0];
            setFormData(prev => ({
              ...prev,
              gouvernorat: firstGouv.gouvernorat
            }));
            // Filter out "-" from villes
            setAvailableVilles(firstGouv.villes.filter((v: string) => v !== '-'));
          }
        }
      } catch (error) {
        console.error('Error fetching gouvernorats:', error);
      }
    };

    fetchGouvernorats();
  }, []);

  // Update form when editing existing colis
  useEffect(() => {
    if (colis && gouvernorats.length > 0) {
      setFormData({
        reference: colis.reference || '',
        client: colis.client || '',
        adresse: colis.adresse || '',
        ville: colis.ville || '',
        gouvernorat: colis.gouvernorat || '',
        tel1: colis.tel1 || '',
        tel2: colis.tel2 || '',
        designation: colis.designation || '',
        prix: colis.prix || 0,
        nb_pieces: colis.nb_pieces || 1,
        type: colis.type || 'VO',
        commentaire: colis.commentaire || '',
        echange: colis.echange || 0,
        cod: colis.cod || 0,
        poids: colis.poids || 0
      });
      
      // Set available villes for the colis' gouvernorat
      const gouvernoratData = gouvernorats.find(g => g.gouvernorat === colis.gouvernorat);
      if (gouvernoratData) {
        setAvailableVilles(gouvernoratData.villes.filter(v => v !== '-'));
      }
    }
  }, [colis, gouvernorats]);

  // Update available villes when gouvernorat changes
  useEffect(() => {
    if (formData.gouvernorat && gouvernorats.length > 0) {
      const gouvernoratData = gouvernorats.find(g => g.gouvernorat === formData.gouvernorat);
      if (gouvernoratData) {
        const villes = gouvernoratData.villes.filter(v => v !== '-');
        setAvailableVilles(villes);
        
        // Reset ville if it's not in the new list
        if (formData.ville && !villes.includes(formData.ville)) {
          setFormData(prev => ({ ...prev, ville: '' }));
        }
      }
    }
  }, [formData.gouvernorat, gouvernorats]);

  // Handle ESC key press with dirty check
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleBackdropClick();
      }
    };

    window.addEventListener('keydown', handleEscKey);
    return () => window.removeEventListener('keydown', handleEscKey);
  }, [formData, colis]); // Dependencies so ESC handler has latest form state

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-3 lg:p-4 animate-fadeIn overflow-y-auto"
      onClick={handleBackdropClick}
    >
      <form 
        onSubmit={handleSubmit} 
        className="space-y-3 sm:space-y-4 lg:space-y-5 card p-3 sm:p-4 lg:p-5 xl:p-6 animate-scaleIn my-2 sm:my-4 lg:my-6 max-w-5xl w-full"
        onClick={(e) => e.stopPropagation()}
      >
      <div className="flex items-center gap-2 lg:gap-3 pb-2 sm:pb-3 lg:pb-4 border-b-2 border-gray-100">
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-1.5 sm:p-2 lg:p-2.5 rounded-lg lg:rounded-xl shadow-lg">
          <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h2 className="text-base sm:text-lg lg:text-xl xl:text-2xl font-bold gradient-text">
          {colis ? 'Modifier Colis' : 'Ajouter Nouveau Colis'}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 lg:gap-4">
        {/* Reference */}
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-1.5">
            Référence
          </label>
          <input
            type="text"
            name="reference"
            value={formData.reference}
            onChange={handleChange}
            className="input text-xs sm:text-sm py-1.5 sm:py-2"
            placeholder="Ex: REF-2024-001"
          />
        </div>

        {/* Client */}
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-1.5">
            Client *
          </label>
          <input
            type="text"
            name="client"
            value={formData.client}
            onChange={handleChange}
            required
            className="input text-xs sm:text-sm py-1.5 sm:py-2"
            placeholder="Nom complet"
          />
        </div>

        {/* Tel1 */}
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-1.5">
            Téléphone 1 *
          </label>
          <input
            type="tel"
            name="tel1"
            value={formData.tel1}
            onChange={handleChange}
            required
            className="input text-xs sm:text-sm py-1.5 sm:py-2"
            placeholder="Ex: 22123456"
          />
        </div>

        {/* Adresse */}
        <div className="md:col-span-2 lg:col-span-3">
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-1.5">
            Adresse *
          </label>
          <input
            type="text"
            name="adresse"
            value={formData.adresse}
            onChange={handleChange}
            required
            className="input text-xs sm:text-sm py-1.5 sm:py-2"
            placeholder="Adresse complète de livraison"
          />
        </div>

        {/* Gouvernorat */}
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-1.5">
            Gouvernorat *
          </label>
          <select
            name="gouvernorat"
            value={formData.gouvernorat}
            onChange={handleChange}
            required
            className="input cursor-pointer text-xs sm:text-sm py-1.5 sm:py-2"
          >
            {gouvernorats.length === 0 ? (
              <option value="">Chargement...</option>
            ) : (
              <>
                <option value="">Sélectionner un gouvernorat</option>
                {gouvernorats.map((gov) => (
                  <option key={gov.gouvernorat} value={gov.gouvernorat}>
                    {gov.gouvernorat}
                  </option>
                ))}
              </>
            )}
          </select>
        </div>

        {/* Ville */}
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-1.5">
            Ville *
          </label>
          <select
            name="ville"
            value={formData.ville}
            onChange={handleChange}
            required
            className="input cursor-pointer text-xs sm:text-sm py-1.5 sm:py-2"
            disabled={!formData.gouvernorat || availableVilles.length === 0}
          >
            {!formData.gouvernorat ? (
              <option value="">Sélectionner d'abord un gouvernorat</option>
            ) : availableVilles.length === 0 ? (
              <option value="">Chargement...</option>
            ) : (
              <>
                <option value="">Sélectionner une ville</option>
                {availableVilles.map((ville) => (
                  <option key={ville} value={ville}>
                    {ville}
                  </option>
                ))}
              </>
            )}
          </select>
        </div>

        {/* Tel2 */}
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-1.5">
            Téléphone 2
          </label>
          <input
            type="tel"
            name="tel2"
            value={formData.tel2}
            onChange={handleChange}
            className="input text-xs sm:text-sm py-1.5 sm:py-2"
            placeholder="Optionnel"
          />
        </div>

        {/* Designation */}
        <div className="lg:col-span-2">
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-1.5">
            Désignation *
          </label>
          <input
            type="text"
            name="designation"
            value={formData.designation}
            onChange={handleChange}
            required
            className="input text-xs sm:text-sm py-1.5 sm:py-2"
            placeholder="Description des articles"
          />
        </div>

        {/* Prix */}
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-1.5">
            Prix (TND) *
          </label>
          <input
            type="number"
            name="prix"
            value={formData.prix}
            onChange={handleChange}
            step="0.01"
            required
            className="input text-xs sm:text-sm py-1.5 sm:py-2"
            placeholder="0.00"
          />
        </div>

        {/* Nombre de pieces */}
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-1.5">
            Nombre de Pièces *
          </label>
          <input
            type="number"
            name="nb_pieces"
            value={formData.nb_pieces}
            onChange={handleChange}
            min="1"
            required
            className="input text-xs sm:text-sm py-1.5 sm:py-2"
            placeholder="1"
          />
        </div>

        {/* Type */}
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-1.5">
            Type *
          </label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            required
            className="input cursor-pointer text-xs sm:text-sm py-1.5 sm:py-2"
          >
            <option value="VO">📦 VO - Vente en ligne</option>
            <option value="EC">🔄 EC - Échange</option>
            <option value="DO">📄 DO - Document</option>
          </select>
        </div>

        {/* Echange */}
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-1.5">
            Échange
          </label>
          <select
            name="echange"
            value={formData.echange}
            onChange={handleChange}
            className="input cursor-pointer text-xs sm:text-sm py-1.5 sm:py-2"
          >
            <option value={0}>❌ Non</option>
            <option value={1}>✅ Oui</option>
          </select>
        </div>

        {/* COD */}
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-1.5">
            COD (TND)
          </label>
          <input
            type="number"
            name="cod"
            value={formData.cod}
            onChange={handleChange}
            step="0.01"
            min="0"
            className="input text-xs sm:text-sm py-1.5 sm:py-2"
            placeholder="0.00"
          />
        </div>

        {/* Poids */}
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-1.5">
            Poids (kg)
          </label>
          <input
            type="number"
            name="poids"
            value={formData.poids}
            onChange={handleChange}
            step="0.01"
            min="0"
            className="input text-xs sm:text-sm py-1.5 sm:py-2"
            placeholder="0.00"
          />
        </div>

        {/* Commentaire */}
        <div className="md:col-span-2 lg:col-span-3">
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-1.5">
            Commentaire
          </label>
          <textarea
            name="commentaire"
            value={formData.commentaire}
            onChange={handleChange}
            rows={2}
            className="input resize-none text-xs sm:text-sm py-1.5 sm:py-2"
            placeholder="Notes supplémentaires..."
          />
        </div>
      </div>

      <div className="flex gap-2 sm:gap-3 justify-end pt-2 sm:pt-3 lg:pt-4 border-t-2 border-gray-100">
        <button
          type="button"
          onClick={handleBackdropClick}
          disabled={loading}
          className="btn-secondary text-xs sm:text-sm lg:text-base px-3 sm:px-4 lg:px-6 py-1.5 sm:py-2"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={loading}
          className="btn-primary flex items-center gap-1 sm:gap-1.5 lg:gap-2 text-xs sm:text-sm lg:text-base px-3 sm:px-4 lg:px-6 py-1.5 sm:py-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-3.5 w-3.5 sm:h-4 sm:w-4 lg:h-5 lg:w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              <span>Chargement...</span>
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5 sm:w-4 sm:w-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>{colis ? 'Modifier' : 'Ajouter'}</span>
            </>
          )}
        </button>
      </div>
    </form>
    </div>
  );
}