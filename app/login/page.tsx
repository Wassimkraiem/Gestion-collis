'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { validateCredentials, setAuthSession, isAuthenticated, clearAuthSession } from '@/lib/auth';
import { Package, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Clear any stale session on mount
    clearAuthSession();
    
    // Redirect if already authenticated (shouldn't happen after clear)
    if (isAuthenticated()) {
      router.push('/');
    }
  }, [router]);

  // Clear error when user starts typing
  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
    if (error) setError('');
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Small delay to show loading state
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      // Clear any existing session first
      clearAuthSession();
      
      if (validateCredentials(username, password)) {
        setAuthSession();
        // Force a hard refresh to ensure clean state
        window.location.href = '/';
      } else {
        setError('Nom d\'utilisateur ou mot de passe incorrect');
        setPassword(''); // Clear password field on error
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Une erreur est survenue. Veuillez réessayer.');
      setPassword('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="card max-w-md w-full p-8 animate-scaleIn">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-4 rounded-2xl shadow-lg">
            <Package className="text-white" size={48} />
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-2">
            Colissimo Management
          </h1>
          <p className="text-gray-600">Connectez-vous pour continuer</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500 rounded-lg text-red-800 animate-slideIn">
            <div className="flex items-start gap-2">
              <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nom d'utilisateur
            </label>
            <input
              type="text"
              value={username}
              onChange={handleUsernameChange}
              required
              disabled={loading}
              className="input disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="Entrez votre nom d'utilisateur"
              autoComplete="username"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={handlePasswordChange}
              required
              disabled={loading}
              className="input disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="Entrez votre mot de passe"
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                <span>Connexion...</span>
              </div>
            ) : (
              'Se connecter'
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Système de gestion des colis Colissimo</p>
        </div>
      </div>
    </div>
  );
}

