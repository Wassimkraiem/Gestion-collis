'use client';

import { useState, useEffect } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { Colis, ColisFormData } from '@/types/colissimo';
import ColisTable from '@/components/ColisTable';
import ColisForm from '@/components/ColisForm';
import SearchBar from '@/components/SearchBar';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';
import ColisDetailModal from '@/components/ColisDetailModal';
import DeliveryDetailsModal from '@/components/DeliveryDetailsModal';
import { parseColisResponse } from '@/lib/parse-soap-response';

interface ColisListViewProps {
  statusFilter?: string;
}

export default function ColisListView({ statusFilter = 'all' }: ColisListViewProps) {
  const [allColisList, setAllColisList] = useState<Colis[]>([]);
  const [colisList, setColisList] = useState<Colis[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
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
  }, [statusFilter, allColisList]);

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

  const handleSearch = async (query: string, type: string) => {
    if (!query.trim()) {
      filterByStatus(allColisList, statusFilter);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      let baseList = statusFilter === 'all' 
        ? allColisList 
        : allColisList.filter(colis => colis.etat === statusFilter);
      
      const searchQuery = query.toLowerCase();
      const filtered = baseList.filter(colis => {
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
      
      setColisList(filtered);
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
    try {
      const response = await fetch('/api/colissimo/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, id: selectedColis.code }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setSuccess('Colis modifié avec succès');
        setShowForm(false);
        setSelectedColis(null);
        await fetchColisList();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(result.error || 'Échec de la modification');
      }
    } catch (err: any) {
      setError(err.message || 'Échec de la modification');
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {statusFilter === 'all' ? 'Tous les colis' : `Colis: ${statusFilter}`}
          </h2>
          <p className="text-gray-600 mt-1">
            {colisList.length} colis {statusFilter !== 'all' && `(${statusFilter})`}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchColisList}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-white hover:border-blue-400 hover:shadow-md disabled:opacity-50 transition-all duration-200 font-medium"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin text-blue-600' : ''} />
            Actualiser
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 btn-primary"
          >
            <Plus size={18} />
            Nouveau Colis
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
        <div className="mb-6">
          <ColisForm
            colis={selectedColis}
            onSubmit={selectedColis ? handleUpdateColis : handleAddColis}
            onCancel={handleCancelForm}
          />
        </div>
      )}

      {/* Search */}
      {!showForm && <SearchBar onSearch={handleSearch} />}

      {/* Table */}
      {!showForm && (
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
                colisList={colisList}
                onEdit={handleEdit}
                onDelete={setColisToDelete}
                onView={setColisToView}
                onViewDeliveryDetails={handleViewDeliveryDetails}
                onPrint={handlePrint}
              />
            </div>
          )}
        </>
      )}

      {/* Stats */}
      {!showForm && !loading && (
        <div className="mt-6 card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                Affichage: {colisList.length} colis {statusFilter !== 'all' && `(${statusFilter})`} • Total dans le système: {totalColis} colis
              </p>
            </div>
          </div>
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
    </>
  );
}

