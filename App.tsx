import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CandidateForm from '@/components/CandidateForm';
import Leaderboard from '@/components/Leaderboard';
import Analytics from '@/components/Analytics';
import AdminLoginModal from '@/components/AdminLoginModal';
import AdminPanel from '@/components/AdminPanel';
import type { Candidate, ViewKey } from '@/types';
import {
  loadCandidates,
  addCandidate,
  deleteCandidate,
  isAuthed,
  setAuthed,
} from '@/lib/storage';

export default function App() {
  const [view, setView] = useState<ViewKey>('leaderboard');
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [authed, setAuthedState] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setCandidates(await loadCandidates());
  }, []);

  useEffect(() => {
    (async () => {
      setCandidates(await loadCandidates());
      setAuthedState(isAuthed());
      setLoading(false);
    })();
  }, []);

  const handleSubmitted = useCallback(() => {
    refresh();
  }, [refresh]);

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        const updated = await deleteCandidate(id);
        setCandidates(updated);
      } catch {
        // error already logged in storage layer
      }
    },
    []
  );

  const handleLogin = () => {
    setAuthed(true);
    setAuthedState(true);
    setShowLogin(false);
    setView('admin');
  };

  const handleLogout = () => {
    setAuthed(false);
    setAuthedState(false);
    if (view === 'admin') setView('leaderboard');
  };

  const handleAdminClick = () => {
    if (authed) {
      setView('admin');
    } else {
      setShowLogin(true);
    }
  };

  // Guard: if not authed and somehow on admin view, redirect
  useEffect(() => {
    if (view === 'admin' && !authed) {
      setView('leaderboard');
    }
  }, [view, authed]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 text-sm font-medium">Loading…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header
        view={view}
        setView={setView}
        authed={authed}
        onAdminClick={handleAdminClick}
        onLogout={handleLogout}
      />

      <main className="flex-1">
        {view === 'leaderboard' && (
          <Leaderboard candidates={candidates} authed={authed} />
        )}
        {view === 'analytics' && <Analytics candidates={candidates} />}
        {view === 'submit' && (
          <CandidateForm onSubmitted={handleSubmitted} />
        )}
        {view === 'admin' && authed && (
          <AdminPanel
            candidates={candidates}
            onDelete={handleDelete}
          />
        )}
      </main>

      <Footer />

      {showLogin && (
        <AdminLoginModal
          onClose={() => setShowLogin(false)}
          onLogin={handleLogin}
        />
      )}
    </div>
  );
}
