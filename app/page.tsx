'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, RefreshCw, Package, LogOut } from 'lucide-react';
import { Colis, ColisFormData } from '@/types/colissimo';
import { clearAuthSession } from '@/lib/auth';
import ColisTable from '@/components/ColisTable';
import ColisForm from '@/components/ColisForm';
import SearchBar from '@/components/SearchBar';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';
import ColisDetailModal from '@/components/ColisDetailModal';
import { parseColisResponse } from '@/lib/parse-soap-response';

export default function Dashboard() {
  const router = useRouter();
  const [colisList, setColisList] = useState<Colis[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedColis, setSelectedColis] = useState<Colis | null>(null);
  const [colisToDelete, setColisToDelete] = useState<Colis | null>(null);
  const [colisToView, setColisToView] = useState<Colis | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalColis, setTotalColis] = useState(0);

  useEffect(() => {
    fetchColisList();
  }, [currentPage]);

  const fetchColisList = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/colissimo/list?page=${currentPage}`);
      const result = await response.json();
      
      if (result.success) {
        // Parse the response data using helper function
        const data = result.data;
        console.log('=== API Response ===');
        console.log('Full data:', data);
        console.log('ListeColisResult:', data.ListeColisResult);
        console.log('Type of ListeColisResult:', typeof data.ListeColisResult);
        
        const parsedList = parseColisResponse(data);
        console.log('=== Parsed List ===');
        console.log('Parsed array:', parsedList);
        console.log('Array length:', parsedList.length);
        console.log('Is array?:', Array.isArray(parsedList));
        
        if (parsedList.length > 0) {
          console.log('First item:', parsedList[0]);
        }
        
        // Extract pagination info from response
        if (data.ListeColisResult && data.ListeColisResult.result_content) {
          const content = data.ListeColisResult.result_content;
          setTotalPages(parseInt(content.nbPages) || 1);
          setTotalColis(parseInt(content.nbColis) || 0);
        }
        
        setColisList(parsedList);
      } else {
        setError(result.error || 'Failed to fetch colis list');
        setColisList([]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch colis list');
      console.error('Error fetching colis:', err);
      setColisList([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string, type: string) => {
    if (!query.trim()) {
      fetchColisList();
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Get all pages to search across all colis
      let allColis: Colis[] = [];
      
      for (let page = 1; page <= totalPages; page++) {
        const response = await fetch(`/api/colissimo/list?page=${page}`);
        const result = await response.json();
        
        if (result.success) {
          const data = result.data;
          const pageColis = parseColisResponse(data);
          allColis = [...allColis, ...pageColis];
        }
      }
      
      // Filter client-side based on search type and query
      const searchQuery = query.toLowerCase();
      const filtered = allColis.filter(colis => {
        switch (type) {
          case 'reference':
            return colis.reference?.toLowerCase().includes(searchQuery);
          case 'client':
            return colis.client?.toLowerCase().includes(searchQuery);
          case 'tel':
            return colis.tel1?.includes(query) || colis.tel2?.includes(query);
          case 'numero':
            return colis.numero_colis?.toLowerCase().includes(searchQuery);
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
              colis.designation?.toLowerCase().includes(searchQuery)
            );
        }
      });
      
      console.log(`Search for "${query}" (${type}): Found ${filtered.length} results`);
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
    try {
      const response = await fetch('/api/colissimo/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      const result = await response.json();
      
      if (result.success) {
        setSuccess('Colis ajouté avec succès!');
        setShowForm(false);
        fetchColisList();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(result.error || 'Failed to add colis');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to add colis');
      console.error('Error adding colis:', err);
    }
  };

  const handleUpdateColis = async (data: ColisFormData) => {
    if (!selectedColis?.id) return;

    try {
      const response = await fetch('/api/colissimo/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, id: selectedColis.id })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setSuccess('Colis modifié avec succès!');
        setShowForm(false);
        setSelectedColis(null);
        fetchColisList();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(result.error || 'Failed to update colis');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update colis');
      console.error('Error updating colis:', err);
    }
  };

  const handleDeleteColis = async () => {
    if (!colisToDelete) return;
    
    // Use code field (the actual tracking code) instead of id
    const codeToDelete = colisToDelete.code || colisToDelete.id;
    
    if (!codeToDelete) {
      setError('Code colis manquant');
      return;
    }

    setDeleteLoading(true);
    try {
      const response = await fetch(`/api/colissimo/delete?code=${encodeURIComponent(codeToDelete)}`, {
        method: 'DELETE'
      });
      
      const result = await response.json();
      
      if (result.success) {
        setSuccess('Colis supprimé avec succès!');
        setColisToDelete(null);
        fetchColisList();
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

  const handleLogout = () => {
    clearAuthSession();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="glass sticky top-0 z-40 animate-fadeIn">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 animate-slideIn">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-3 rounded-xl shadow-lg hover-glow">
                <Package className="text-white" size={32} />
              </div>
              <div>
                <h1 className="text-3xl font-bold gradient-text">Colissimo Management</h1>
                <p className="text-gray-600 mt-1 flex items-center gap-2">
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  Gestion des colis de livraison
                </p>
              </div>
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
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-5 py-2.5 border-2 border-red-300 rounded-xl text-red-700 hover:bg-red-50 hover:border-red-400 hover:shadow-md transition-all duration-200 font-medium"
                title="Déconnexion"
              >
                <LogOut size={18} />
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Alerts */}
        {error && (
          <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500 rounded-xl text-red-800 shadow-lg animate-slideIn flex items-start gap-3">
            <div className="bg-red-500 rounded-full p-1 mt-0.5">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">{error}</div>
            <button
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800 font-bold text-xl transition-colors"
            >
              ×
            </button>
          </div>
        )}
        
        {success && (
          <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-100 border-l-4 border-green-500 rounded-xl text-green-800 shadow-lg animate-slideIn flex items-start gap-3">
            <div className="bg-green-500 rounded-full p-1 mt-0.5">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1 font-medium">{success}</div>
            <button
              onClick={() => setSuccess(null)}
              className="text-green-600 hover:text-green-800 font-bold text-xl transition-colors"
            >
              ×
            </button>
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
                <div className="flex justify-center gap-2 mt-4">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            ) : (
              <div className="animate-fadeIn">
                <ColisTable
                  colisList={colisList}
                  onEdit={handleEdit}
                  onDelete={setColisToDelete}
                  onView={setColisToView}
                />
              </div>
            )}
          </>
        )}

        {/* Stats and Pagination */}
        {!showForm && !loading && (
          <div className="mt-6 space-y-4">
            <div className="card p-6 animate-fadeIn">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-4 rounded-xl shadow-lg">
                    <Package className="text-white" size={24} />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm font-medium">Total des colis</p>
                    <p className="text-3xl font-bold gradient-text">{totalColis}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Affichage</p>
                  <p className="text-lg font-bold text-gray-700">
                    {colisList.length} colis sur cette page
                  </p>
                </div>
              </div>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="card p-6 animate-fadeIn">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="text-sm text-gray-600">
                    Page <span className="font-bold text-gray-900">{currentPage}</span> sur{' '}
                    <span className="font-bold text-gray-900">{totalPages}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      className="px-3 py-2 border-2 border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      ⏮️ Première
                    </button>
                    
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border-2 border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      ◀️ Précédent
                    </button>

                    <div className="flex items-center gap-2">
                      {[...Array(Math.min(5, totalPages))].map((_, idx) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = idx + 1;
                        } else if (currentPage <= 3) {
                          pageNum = idx + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + idx;
                        } else {
                          pageNum = currentPage - 2 + idx;
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                              currentPage === pageNum
                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                                : 'border-2 border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 border-2 border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      Suivant ▶️
                    </button>
                    
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 border-2 border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      Dernière ⏭️
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600">Aller à:</label>
                    <input
                      type="number"
                      min="1"
                      max={totalPages}
                      value={currentPage}
                      onChange={(e) => {
                        const page = parseInt(e.target.value);
                        if (page >= 1 && page <= totalPages) {
                          setCurrentPage(page);
                        }
                      }}
                      className="w-20 px-3 py-2 border-2 border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

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
    </div>
  );
}
