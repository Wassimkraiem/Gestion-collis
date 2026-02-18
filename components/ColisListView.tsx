'use client';

import { useState, useEffect } from 'react';
import { Plus, RefreshCw, CheckCircle, FileUp } from 'lucide-react';
import { Colis, ColisFormData } from '@/types/colissimo';
import ColisTable from '@/components/ColisTable';
import ColisForm from '@/components/ColisForm';
import SearchBar from '@/components/SearchBar';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';
import ColisDetailModal from '@/components/ColisDetailModal';
import DeliveryDetailsModal from '@/components/DeliveryDetailsModal';
import ExcelImportModal from '@/components/ExcelImportModal';
import { parseColisResponse } from '@/lib/parse-soap-response';

interface ColisListViewProps {
  statusFilter?: string;
}

const ITEMS_PER_PAGE = 30;

export default function ColisListView({ statusFilter = 'all' }: ColisListViewProps) {
  const [allColisList, setAllColisList] = useState<Colis[]>([]);
  const [colisList, setColisList] = useState<Colis[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedColis, setSelectedColis] = useState<Colis | null>(null);
  const [colisToDelete, setColisToDelete] = useState<Colis | null>(null);
  const [colisToView, setColisToView] = useState<Colis | null>(null);
  const [colisForDeliveryDetails, setColisForDeliveryDetails] = useState<Colis | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalColis, setTotalColis] = useState(0);

  useEffect(() => {
    fetchColisList();
  }, []); // Remove currentPage dependency - we fetch all pages at once now

  useEffect(() => {
    // Filter by status when allColisList or statusFilter changes
    filterByStatus(allColisList, statusFilter);
    // Reset to page 1 when filter changes
    setCurrentPage(1);
  }, [statusFilter, allColisList]);

  // Calculate paginated colis list
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedColisList = colisList.slice(startIndex, endIndex);
  const totalPaginationPages = Math.ceil(colisList.length / ITEMS_PER_PAGE);

  const fetchColisList = async () => {
    setLoading(true);
    setError(null);
    try {
      // First, get the first page to know total pages
      const firstResponse = await fetch(`/api/colissimo/list?page=1`);
      const firstResult = await firstResponse.json();

      if (!firstResult.success) {
        setError(firstResult.error || 'Failed to fetch colis list');
        setColisList([]);
        setLoading(false);
        return;
      }

      const firstData = firstResult.data;
      let allColis = parseColisResponse(firstData);

      // Get total pages
      let totalPagesCount = 1;
      if (firstData.ListeColisResult && firstData.ListeColisResult.result_content) {
        const content = firstData.ListeColisResult.result_content;
        totalPagesCount = parseInt(content.nbPages) || 1;
        setTotalPages(totalPagesCount);
        setTotalColis(parseInt(content.nbColis) || 0);
      }

      // Fetch all remaining pages to get ALL colis
      console.log(`Fetching all ${totalPagesCount} pages to get complete data...`);
      const fetchPromises = [];
      for (let page = 2; page <= totalPagesCount; page++) {
        fetchPromises.push(
          fetch(`/api/colissimo/list?page=${page}`)
            .then(res => res.json())
            .then(result => {
              if (result.success) {
                return parseColisResponse(result.data);
              }
              return [];
            })
        );
      }

      // Wait for all pages to load
      const allPages = await Promise.all(fetchPromises);
      allPages.forEach(pageColis => {
        allColis = [...allColis, ...pageColis];
      });

      console.log(`Loaded ${allColis.length} total colis from ${totalPagesCount} pages`);

      // Set the colis list directly
      // Enrichment will happen on-demand when opening DeliveryDetailsModal or ColisDetailModal
      setAllColisList(allColis);

    } catch (err: any) {
      setError(err.message || 'Failed to fetch colis list');
      console.error('Error fetching colis:', err);
      setColisList([]);
    } finally {
      setLoading(false);
    }
  };

  const filterByStatus = (list: Colis[], status: string) => {
    if (status === 'all') {
      setColisList(list);
    } else {
      const filtered = list.filter((colis) => colis.etat === status);
      setColisList(filtered);
    }
  };

  const handleSearch = async (query: string, type: string, startDate?: string, endDate?: string) => {
    // If no query and no date filters, reset to status filter
    if (!query.trim() && !startDate && !endDate) {
      filterByStatus(allColisList, statusFilter);
      setCurrentPage(1);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // If a query is provided, use server-side search to avoid loading all colis client-side
      if (query.trim()) {
        const response = await fetch(`/api/colissimo/search?q=${encodeURIComponent(query.trim())}`);
        const result = await response.json();

        if (!result.success) {
          setError(result.error || 'Search failed');
          setColisList([]);
          return;
        }

        let serverResults: Colis[] = Array.isArray(result.data?.colis) ? result.data.colis : [];

        // Apply search type filter on server results
        const searchQuery = query.toLowerCase();
        if (type !== 'all') {
          serverResults = serverResults.filter(colis => {
            switch (type) {
              case 'reference':
                return colis.reference?.toLowerCase().includes(searchQuery);
              case 'client':
                return colis.client?.toLowerCase().includes(searchQuery);
              case 'tel':
                return colis.tel1?.includes(query) || colis.tel2?.includes(query);
              case 'numero':
                return colis.numero_colis?.toLowerCase().includes(searchQuery) || colis.code?.toLowerCase().includes(searchQuery);
              default:
                return true;
            }
          });
        }

        // Apply status filter after search
        if (statusFilter !== 'all') {
          serverResults = serverResults.filter(colis => colis.etat === statusFilter);
        }

        // Apply date filter on server results
        if (startDate || endDate) {
          serverResults = serverResults.filter(colis => {
            if (!colis.date_creation) return false;
            try {
              const colisDate = new Date(colis.date_creation);
              if (isNaN(colisDate.getTime())) return false;
              const colisDateStr = colisDate.toISOString().split('T')[0];
              if (startDate && endDate) {
                return colisDateStr >= startDate && colisDateStr <= endDate;
              } else if (startDate) {
                return colisDateStr >= startDate;
              } else if (endDate) {
                return colisDateStr <= endDate;
              }
            } catch (e) {
              console.error('Error parsing date:', colis.date_creation, e);
              return false;
            }
            return true;
          });
        }

        setColisList(serverResults);
        setCurrentPage(1);
        return;
      }

      let baseList = statusFilter === 'all'
        ? allColisList
        : allColisList.filter(colis => colis.etat === statusFilter);

      // Apply text search filter
      let filtered = baseList;
      if (query.trim()) {
        const searchQuery = query.toLowerCase();
        filtered = baseList.filter(colis => {
          switch (type) {
            case 'reference':
              return colis.reference?.toLowerCase().includes(searchQuery);
            case 'client':
              return colis.client?.toLowerCase().includes(searchQuery);
            case 'tel':
              return colis.tel1?.includes(query) || colis.tel2?.includes(query);
            case 'numero':
              return colis.numero_colis?.toLowerCase().includes(searchQuery) || colis.code?.toLowerCase().includes(searchQuery);
            case 'all':
            default:
              return (
                colis.reference?.toLowerCase().includes(searchQuery) ||
                colis.client?.toLowerCase().includes(searchQuery) ||
                colis.tel1?.includes(query) ||
                colis.tel2?.includes(query) ||
                colis.ville?.toLowerCase().includes(searchQuery) ||
                colis.gouvernorat?.toLowerCase().includes(searchQuery) ||
                colis.numero_colis?.toLowerCase().includes(searchQuery) ||
                colis.code?.toLowerCase().includes(searchQuery) ||
                colis.designation?.toLowerCase().includes(searchQuery)
              );
          }
        });
      }

      // Apply date filter
      if (startDate || endDate) {
        filtered = filtered.filter(colis => {
          if (!colis.date_creation) return false;
          
          try {
            const colisDate = new Date(colis.date_creation);
            if (isNaN(colisDate.getTime())) return false; // Invalid date
            
            // Extract date part only (YYYY-MM-DD) for comparison
            const colisDateStr = colisDate.toISOString().split('T')[0];
            
            if (startDate && endDate) {
              // Both dates provided - check if colis date is in range
              return colisDateStr >= startDate && colisDateStr <= endDate;
            } else if (startDate) {
              // Only start date - check if colis date is >= start date
              return colisDateStr >= startDate;
            } else if (endDate) {
              // Only end date - check if colis date is <= end date
              return colisDateStr <= endDate;
            }
          } catch (e) {
            console.error('Error parsing date:', colis.date_creation, e);
            return false;
          }
          return true;
        });
      }

      setColisList(filtered);
      setCurrentPage(1);
    } catch (err: any) {
      setError(err.message || 'Search failed');
      console.error('Error searching colis:', err);
      setColisList([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddColis = async (data: ColisFormData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/colissimo/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess('Colis ajouté avec succès');
        setShowForm(false);
        await fetchColisList();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(result.error || 'Échec de l\'ajout');
      }
    } catch (err: any) {
      setError(err.message || 'Échec de l\'ajout');
      console.error('Error adding colis:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateColis = async (data: ColisFormData) => {
    if (!selectedColis) return;

    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      // Try multiple fields to find the identifier
      // Priority: code > id > numero_colis > reference
      const colisId = selectedColis.code || selectedColis.id || selectedColis.numero_colis || selectedColis.reference;
      
      if (!colisId || colisId.trim() === '') {
        console.error('No identifier found for colis:', selectedColis);
        setError('Impossible de trouver l\'identifiant du colis (code barre). Le colis doit avoir un code barre pour être modifié.');
        setLoading(false);
        return;
      }

      console.log('Updating colis with identifier:', colisId, 'from colis:', selectedColis);

      const response = await fetch('/api/colissimo/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, id: colisId }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess('Colis modifié avec succès');
        setShowForm(false);
        setSelectedColis(null);
        await fetchColisList();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        const errorMessage = result.error || 'Échec de la modification';
        setError(errorMessage);
        console.error('Update failed:', result);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Échec de la modification';
      setError(errorMessage);
      console.error('Error updating colis:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteColis = async () => {
    if (!colisToDelete) return;

    setDeleteLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/colissimo/delete?id=${colisToDelete.code}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        setSuccess('Colis supprimé avec succès');
        setColisToDelete(null);
        await fetchColisList();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(result.error || 'Échec de la suppression');
      }
    } catch (err: any) {
      setError(err.message || 'Échec de la suppression');
      console.error('Error deleting colis:', err);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleValidate = async (colis: Colis) => {
    if (!colis || colis.etat !== 'En Attente') return;

    const confirmed = window.confirm(
      `Voulez-vous valider ce colis pour l'enlèvement ?\n\nRéférence: ${colis.reference}\nClient: ${colis.client}`
    );

    if (!confirmed) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/colissimo/valider', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codeBar: colis.code }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess('Colis validé avec succès !');

        // If there's a PDF link, open it
        if (result.pdfUrl) {
          setTimeout(() => {
            window.open(result.pdfUrl, '_blank');
          }, 3000); // Wait 5 seconds
        }

        await fetchColisList();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(result.error || 'Échec de la validation');
      }
    } catch (err: any) {
      setError(err.message || 'Échec de la validation');
      console.error('Error validating colis:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkValidate = async () => {
    const enAttenteCount = colisList.filter(c => c.etat === 'En Attente').length;

    if (enAttenteCount === 0) {
      setError('Aucun colis en attente à valider');
      return;
    }

    const confirmed = window.confirm(
      `Voulez-vous valider tous les ${enAttenteCount} colis en attente pour l'enlèvement ?\n\nCette action validera le manifeste complet.`
    );

    if (!confirmed) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/colissimo/valider', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bulk: true }),
      });

      const result = await response.json();

      // Log the complete API response
      console.log('=== Validation API Response ===');
      console.log('Full Response:', JSON.stringify(result, null, 2));
      console.log('Success:', result.success);
      console.log('PDF URL:', result.pdfUrl);
      console.log('API Response:', result.apiResponse);
      console.log('================================');

      if (result.success) {
        setSuccess(`${enAttenteCount} colis validés avec succès !`);

        // If there's a PDF link, open it
        if (result.pdfUrl) {
          console.log('Opening PDF:', result.pdfUrl);
          setTimeout(() => {
            window.open(result.pdfUrl, '_blank');
          }, 3000); // Wait 3 seconds
        } else {
          console.warn('No PDF URL in response');
        }

        await fetchColisList();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        console.error('Validation failed:', result);
        setError(result.error || 'Échec de la validation en masse');
      }
    } catch (err: any) {
      setError(err.message || 'Échec de la validation en masse');
      console.error('Error bulk validating colis:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (colis: Colis) => {
    setSelectedColis(colis);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setSelectedColis(null);
  };

  const handleViewDeliveryDetails = (colis: Colis) => {
    setColisForDeliveryDetails(colis);
  };

  const handlePrint = async (colis: Colis) => {
    try {
      setLoading(true);
      // Fetch PDF from API
      const response = await fetch(`/api/colissimo/pdf?id=${colis.code}`);
      const result = await response.json();

      if (result.success && result.pdf) {
        // Convert base64 to blob and open in new window
        const base64Data = result.pdf;
        const binaryString = window.atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);

        // Open PDF in new window
        const printWindow = window.open(url, '_blank');
        if (printWindow) {
          printWindow.onload = () => {
            printWindow.print();
          };
        }

        // Clean up the URL after a delay
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      } else {
        setError(result.error || 'Échec de la génération du PDF');
      }
    } catch (err: any) {
      setError(err.message || 'Échec de la génération du PDF');
      console.error('Error fetching PDF:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Header Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4 lg:mb-6">
        <div className="min-w-0">
          <h2 className="text-lg lg:text-xl xl:text-2xl font-bold text-gray-900">
            {statusFilter === 'all' ? 'Tous les colis' : `Colis: ${statusFilter}`}
          </h2>
        </div>
        <div className="flex flex-wrap justify-end gap-1.5 lg:gap-2 xl:gap-3">
          <button
            onClick={fetchColisList}
            disabled={loading}
            className="flex items-center gap-1.5 lg:gap-2 px-3 lg:px-4 xl:px-5 py-2 lg:py-2.5 border-2 border-gray-300 rounded-lg lg:rounded-xl text-xs lg:text-sm text-gray-700 hover:bg-white hover:border-blue-400 hover:shadow-md disabled:opacity-50 transition-all duration-200 font-medium"
          >
            <RefreshCw size={16} className={`lg:w-[18px] lg:h-[18px] ${loading ? 'animate-spin text-blue-600' : ''}`} />
            <span className="hidden lg:inline">Actualiser</span>
          </button>
          {statusFilter === 'En Attente' && colisList.length > 0 && (
            <button
              onClick={handleBulkValidate}
              disabled={loading}
              className="flex items-center gap-1.5 lg:gap-2 px-3 lg:px-4 xl:px-5 py-2 lg:py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-lg lg:rounded-xl hover:shadow-lg disabled:opacity-50 transition-all duration-200 text-xs lg:text-sm font-medium hover:scale-105"
            >
              <CheckCircle size={16} className="lg:w-[18px] lg:h-[18px]" />
              <span className="hidden lg:inline">Tout Valider ({colisList.length})</span>
              <span className="lg:hidden">Valider</span>
            </button>
          )}
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-1.5 lg:gap-2 px-3 lg:px-4 xl:px-5 py-2 lg:py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg lg:rounded-xl hover:shadow-lg transition-all duration-200 text-xs lg:text-sm font-medium hover:scale-105"
          >
            <FileUp size={16} className="lg:w-[18px] lg:h-[18px]" />
            <span className="hidden lg:inline">Importer</span>
            <span className="lg:hidden">Import</span>
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 lg:gap-2 btn-primary text-xs lg:text-sm px-3 lg:px-4"
          >
            <Plus size={16} className="lg:w-[18px] lg:h-[18px]" />
            <span className="hidden lg:inline">Nouveau Colis</span>
            <span className="lg:hidden">Nouveau</span>
          </button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500 rounded-xl text-red-800 shadow-lg animate-slideIn flex items-start gap-3">
          <div className="flex-1">{error}</div>
          <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800 font-bold text-xl">×</button>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-100 border-l-4 border-green-500 rounded-xl text-green-800 shadow-lg animate-slideIn flex items-start gap-3">
          <div className="flex-1 font-medium">{success}</div>
          <button onClick={() => setSuccess(null)} className="text-green-600 hover:text-green-800 font-bold text-xl">×</button>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <ColisForm
          colis={selectedColis}
          onSubmit={selectedColis ? handleUpdateColis : handleAddColis}
          onCancel={handleCancelForm}
        />
      )}

      {/* Search */}
      <SearchBar onSearch={handleSearch} />

      {/* Table */}
      <>
        {loading ? (
          <div className="card text-center py-20 animate-scaleIn">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-20"></div>
              <RefreshCw className="animate-spin mx-auto text-blue-600 relative" size={56} />
            </div>
            <p className="mt-6 text-gray-600 text-lg font-medium">Chargement des données...</p>
          </div>
        ) : (
          <div className="animate-fadeIn">
            <ColisTable
              colisList={paginatedColisList}
              onEdit={handleEdit}
              onDelete={setColisToDelete}
              onView={setColisToView}
              onViewDeliveryDetails={handleViewDeliveryDetails}
              onPrint={handlePrint}
              onValidate={handleValidate}
            />
          </div>
        )}
      </>

      {/* Pagination */}
      {!loading && totalPaginationPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-blue-50 hover:border-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
          >
            ← Précédent
          </button>

          <div className="flex items-center gap-2">
            {Array.from({ length: Math.min(7, totalPaginationPages) }, (_, i) => {
              // Show first page, last page, current page, and pages around current
              let pageNum;
              if (totalPaginationPages <= 7) {
                pageNum = i + 1;
              } else if (currentPage <= 4) {
                pageNum = i < 5 ? i + 1 : (i === 5 ? -1 : totalPaginationPages);
              } else if (currentPage >= totalPaginationPages - 3) {
                pageNum = i === 0 ? 1 : (i === 1 ? -1 : totalPaginationPages - (6 - i));
              } else {
                if (i === 0) pageNum = 1;
                else if (i === 1) pageNum = -1;
                else if (i === 5) pageNum = -1;
                else if (i === 6) pageNum = totalPaginationPages;
                else pageNum = currentPage + i - 3;
              }

              if (pageNum === -1) {
                return <span key={i} className="px-2 text-gray-500">...</span>;
              }

              return (
                <button
                  key={i}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${currentPage === pageNum
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg scale-110'
                      : 'border-2 border-gray-300 text-gray-700 hover:bg-blue-50 hover:border-blue-400'
                    }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setCurrentPage(Math.min(totalPaginationPages, currentPage + 1))}
            disabled={currentPage === totalPaginationPages}
            className="px-4 py-2 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-blue-50 hover:border-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
          >
            Suivant →
          </button>
        </div>
      )}

      {/* Modals */}
      {colisToDelete && (
        <DeleteConfirmModal
          colis={colisToDelete}
          onConfirm={handleDeleteColis}
          onCancel={() => setColisToDelete(null)}
          loading={deleteLoading}
        />
      )}

      {colisToView && (
        <ColisDetailModal
          colis={colisToView}
          onClose={() => setColisToView(null)}
        />
      )}

      {colisForDeliveryDetails && (
        <DeliveryDetailsModal
          colis={colisForDeliveryDetails}
          onClose={() => setColisForDeliveryDetails(null)}
        />
      )}

      {showImportModal && (
        <ExcelImportModal
          onClose={() => setShowImportModal(false)}
          onImportSuccess={() => {
            setShowImportModal(false);
            setSuccess('Import réussi! Rafraîchissement des données...');
            fetchColisList();
          }}
        />
      )}
    </>
  );
}

function sleep(arg0: number) {
  throw new Error('Function not implemented.');
}
