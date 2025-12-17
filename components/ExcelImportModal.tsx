'use client';

import { useState, useRef } from 'react';
import { Upload, X, Download, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import { ColisFormData } from '@/types/colissimo';

interface ExcelImportModalProps {
  onClose: () => void;
  onImportSuccess: () => void;
}

interface ImportResult {
  nbCrees: number;
  nbTotal: number;
  lsCrees: Array<{
    codeBar: string;
    codeBar2: string;
    reference: string;
    tel: string;
  }>;
  lsErreurs: Array<{
    erreur_code: string;
    erreur_msg: string;
    reference: string;
    tel: string;
  }>;
  type: string;
}

export default function ExcelImportModal({ onClose, onImportSuccess }: ExcelImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.match(/\.(xlsx|xls)$/)) {
        setError('Veuillez sélectionner un fichier Excel (.xlsx ou .xls)');
        return;
      }
      setFile(selectedFile);
      setError(null);
      setResult(null);
    }
  };

  const parseExcelFile = (file: File): Promise<ColisFormData[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          const colisList: ColisFormData[] = jsonData.map((row: any) => {
            const echangeValue = parseInt(row['Échange'] || row['Echange'] || 0);
            const typeValue = (row['Type'] || 'VO').toUpperCase();
            
            return {
              reference: row['Référence'] || row['Reference'] || '',
              client: row['Client'] || '',
              adresse: row['Adresse'] || '',
              gouvernorat: row['Gouvernorat'] || '',
              ville: row['Ville'] || '',
              tel1: String(row['Téléphone 1'] || row['Tel1'] || ''),
              tel2: String(row['Téléphone 2'] || row['Tel2'] || ''),
              designation: row['Désignation'] || row['Designation'] || '',
              prix: parseFloat(row['Prix'] || 0),
              nb_pieces: parseInt(row['Nombre de pièces'] || row['Nb_pieces'] || 1),
              type: (typeValue === 'VO' || typeValue === 'EC' || typeValue === 'DO' ? typeValue : 'VO') as 'VO' | 'EC' | 'DO',
              commentaire: row['Commentaire'] || '',
              echange: (echangeValue === 1 ? 1 : 0) as 0 | 1,
              cod: parseFloat(row['COD'] || 0),
              poids: parseFloat(row['Poids'] || 0)
            };
          });

          // Validate required fields
          const invalidRows = colisList.filter((colis, index) => 
            !colis.client || !colis.adresse || !colis.gouvernorat || !colis.ville || !colis.tel1
          );

          if (invalidRows.length > 0) {
            reject(new Error(`${invalidRows.length} ligne(s) avec des champs obligatoires manquants (Client, Adresse, Gouvernorat, Ville, Téléphone 1)`));
            return;
          }

          if (colisList.length > 50) {
            reject(new Error('Le fichier contient plus de 50 colis. Maximum autorisé: 50 colis par import.'));
            return;
          }

          resolve(colisList);
        } catch (error) {
          reject(new Error('Erreur lors de la lecture du fichier Excel'));
        }
      };

      reader.onerror = () => reject(new Error('Erreur lors de la lecture du fichier'));
      reader.readAsBinaryString(file);
    });
  };

  const handleImport = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const colisList = await parseExcelFile(file);

      const response = await fetch('/api/colissimo/bulk-import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ listColis: colisList }),
      });

      const data = await response.json();

      if (data.success) {
        setResult(data.data);
        if (data.data.type === 'success' || data.data.lsCrees.length > 0) {
          setTimeout(() => {
            onImportSuccess();
          }, 2000);
        }
      } else {
        setError(data.error || 'Erreur lors de l\'importation');
      }
    } catch (error: any) {
      setError(error.message || 'Erreur lors de l\'importation');
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const template = [
      {
        'Référence': 'REF-001',
        'Client': 'Mohamed Salah',
        'Adresse': '12 Rue de la République',
        'Gouvernorat': 'Tunis',
        'Ville': 'Tunis',
        'Téléphone 1': '22582700',
        'Téléphone 2': '22555556',
        'Désignation': 'Article test',
        'Prix': 50.5,
        'Nombre de pièces': 1,
        'Type': 'VO',
        'Commentaire': 'À livrer le matin',
        'Échange': 0,
        'COD': 0,
        'Poids': 0.5
      },
      {
        'Référence': 'REF-002',
        'Client': 'Ahmed Ben Ali',
        'Adresse': '25 Avenue Habib Bourguiba',
        'Gouvernorat': 'Sfax',
        'Ville': 'Sfax Ville',
        'Téléphone 1': '74222333',
        'Téléphone 2': '',
        'Désignation': 'Livres',
        'Prix': 35,
        'Nombre de pièces': 2,
        'Type': 'EC',
        'Commentaire': '',
        'Échange': 1,
        'COD': 10,
        'Poids': 1.2
      }
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Colis');
    XLSX.writeFile(wb, 'modele_import_colis.xlsx');
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 lg:p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-4 lg:p-6 animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4 lg:mb-6 pb-3 lg:pb-4 border-b-2 border-gray-100">
          <div className="flex items-center gap-2 lg:gap-3">
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-2 lg:p-3 rounded-lg lg:rounded-xl shadow-lg">
              <Upload className="text-white" size={20} />
            </div>
            <div>
              <h2 className="text-lg lg:text-xl font-bold gradient-text">Importer des Colis</h2>
              <p className="text-xs lg:text-sm text-gray-600">Fichier Excel (.xlsx ou .xls)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Download Template Button */}
        <div className="mb-4 lg:mb-6">
          <button
            onClick={downloadTemplate}
            className="flex items-center gap-2 px-3 lg:px-4 py-2 border-2 border-blue-300 rounded-lg text-blue-700 hover:bg-blue-50 transition-all text-sm lg:text-base"
          >
            <Download size={16} className="lg:w-[18px] lg:h-[18px]" />
            Télécharger le modèle Excel
          </button>
          <p className="text-xs text-gray-600 mt-2">
            Type: VO (Vente Ordinaire), EC (Échange), DO (Dossier) • Échange: 0 (Non) ou 1 (Oui)
          </p>
        </div>

        {/* File Upload */}
        <div className="mb-4 lg:mb-6">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            className="hidden"
          />
          
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded-xl p-6 lg:p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all"
          >
            <Upload className="mx-auto text-gray-400 mb-3" size={40} />
            <p className="text-sm lg:text-base text-gray-700 font-medium mb-1">
              {file ? file.name : 'Cliquez pour sélectionner un fichier'}
            </p>
            <p className="text-xs lg:text-sm text-gray-500">
              Maximum 50 colis par import
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 lg:p-4 bg-red-50 border-l-4 border-red-500 rounded-lg text-red-800 text-sm lg:text-base">
            <div className="flex items-start gap-2">
              <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="mb-4 space-y-3">
            {/* Summary */}
            <div className={`p-3 lg:p-4 rounded-lg ${
              result.type === 'success' ? 'bg-green-50 border-l-4 border-green-500' : 'bg-yellow-50 border-l-4 border-yellow-500'
            }`}>
              <div className="flex items-start gap-2 mb-2">
                {result.type === 'success' ? (
                  <CheckCircle size={20} className="text-green-600 flex-shrink-0" />
                ) : (
                  <AlertCircle size={20} className="text-yellow-600 flex-shrink-0" />
                )}
                <div className="text-sm lg:text-base">
                  <p className="font-semibold">
                    {result.nbCrees} colis créés sur {result.nbTotal}
                  </p>
                </div>
              </div>
            </div>

            {/* Errors */}
            {result.lsErreurs && result.lsErreurs.length > 0 && (
              <div className="bg-red-50 p-3 lg:p-4 rounded-lg border-l-4 border-red-500">
                <div className="flex items-center gap-2 mb-2">
                  <XCircle size={18} className="text-red-600" />
                  <p className="font-semibold text-red-800 text-sm lg:text-base">
                    Erreurs ({result.lsErreurs.length})
                  </p>
                </div>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {result.lsErreurs.map((err, index) => (
                    <div key={index} className="text-xs lg:text-sm text-red-700 pl-4">
                      • Réf: {err.reference} - Tel: {err.tel} - {err.erreur_msg}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Success List */}
            {result.lsCrees && result.lsCrees.length > 0 && (
              <div className="bg-green-50 p-3 lg:p-4 rounded-lg border-l-4 border-green-500">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle size={18} className="text-green-600" />
                  <p className="font-semibold text-green-800 text-sm lg:text-base">
                    Colis créés ({result.lsCrees.length})
                  </p>
                </div>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {result.lsCrees.slice(0, 10).map((colis, index) => (
                    <div key={index} className="text-xs lg:text-sm text-green-700 pl-4">
                      • Code: {colis.codeBar} - Réf: {colis.reference}
                    </div>
                  ))}
                  {result.lsCrees.length > 10 && (
                    <div className="text-xs text-green-600 pl-4">
                      ... et {result.lsCrees.length - 10} autres
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 lg:gap-3 justify-end pt-3 lg:pt-4 border-t-2 border-gray-100">
          <button
            onClick={onClose}
            className="btn-secondary text-sm lg:text-base px-4 lg:px-6"
            disabled={loading}
          >
            {result ? 'Fermer' : 'Annuler'}
          </button>
          {!result && (
            <button
              onClick={handleImport}
              disabled={!file || loading}
              className="btn-primary flex items-center gap-2 text-sm lg:text-base px-4 lg:px-6"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 lg:h-5 lg:w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  <span>Importation...</span>
                </>
              ) : (
                <>
                  <Upload size={18} />
                  <span>Importer</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

