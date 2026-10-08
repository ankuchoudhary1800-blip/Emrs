import { useMemo, useState } from 'react';
import {
  ShieldCheck,
  Trash2,
  Eye,
  X,
  Hash,
  Phone,
  Mail,
  UserRound,
  Users2,
  Tag,
  ClipboardList,
  FileText,
  Calendar,
  Download,
  CheckSquare,
  Settings,
  KeyRound,
  Lock,
  CheckCircle,
} from 'lucide-react';
import type { Candidate, Gender, Category, DVStatus } from '@/types';
import { rankByGroup, CATEGORIES, DV_STATUSES, getAdminPassword, setAdminPassword } from '@/lib/storage';

interface AdminPanelProps {
  candidates: Candidate[];
  onDelete: (id: string) => void;
}

export default function AdminPanel({ candidates, onDelete }: AdminPanelProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [photoView, setPhotoView] = useState<string | null>(null);
  const [filterGender, setFilterGender] = useState<Gender | 'all'>('all');
  const [filterCategory, setFilterCategory] = useState<Category | 'all'>(
    'all'
  );
  const [filterDV, setFilterDV] = useState<DVStatus | 'all'>('all');
  const [showSettings, setShowSettings] = useState(false);
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState(false);

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPwError('');
    setPwSuccess(false);

    if (currentPw !== getAdminPassword()) {
      setPwError('Current password is incorrect.');
      return;
    }
    if (newPw.length < 6) {
      setPwError('New password must be at least 6 characters.');
      return;
    }
    if (newPw !== confirmPw) {
      setPwError('New password and confirmation do not match.');
      return;
    }
    setAdminPassword(newPw);
    setCurrentPw('');
    setNewPw('');
    setConfirmPw('');
    setPwSuccess(true);
    setTimeout(() => setPwSuccess(false), 4000);
  };

  const groupRankMap = useMemo(() => rankByGroup(candidates), [candidates]);

  const filtered = useMemo(() => {
    let list = candidates;
    if (filterGender !== 'all')
      list = list.filter((c) => c.gender === filterGender);
    if (filterCategory !== 'all')
      list = list.filter((c) => c.category === filterCategory);
    if (filterDV !== 'all')
      list = list.filter((c) => c.shortlistedDV === filterDV);
    return [...list].sort((a, b) => {
      const ra = groupRankMap.get(a.id) ?? 999;
      const rb = groupRankMap.get(b.id) ?? 999;
      return ra - rb;
    });
  }, [candidates, filterGender, filterCategory, filterDV, groupRankMap]);

  const handleDelete = (id: string, name: string) => {
    if (
      window.confirm(
        `Delete candidate "${name}"? This action cannot be undone.`
      )
    ) {
      onDelete(id);
      if (expandedId === id) setExpandedId(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-6">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-7 h-7 text-emerald-600" />
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Admin Panel</h2>
            <p className="text-slate-500 text-sm">
              Full candidate records including sensitive details
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            showSettings
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span className="hidden sm:inline">Settings</span>
        </button>
      </div>

      {/* Settings / Password change */}
      {showSettings && (
        <div className="mb-6 bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-700 to-slate-800 px-6 py-4 flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-emerald-400" />
            <h3 className="text-white font-bold text-base">Change Password</h3>
          </div>
          <form onSubmit={handlePasswordChange} className="p-6 space-y-4">
            {pwSuccess && (
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <p className="text-emerald-800 text-sm font-medium">
                  Password changed successfully.
                </p>
              </div>
            )}
            {pwError && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 flex items-center gap-2">
                <X className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-red-700 text-sm font-medium">{pwError}</p>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Current Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    value={currentPw}
                    onChange={(e) => {
                      setCurrentPw(e.target.value);
                      setPwError('');
                      setPwSuccess(false);
                    }}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 bg-slate-50 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
                    placeholder="Enter current password"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    value={newPw}
                    onChange={(e) => {
                      setNewPw(e.target.value);
                      setPwError('');
                      setPwSuccess(false);
                    }}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 bg-slate-50 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
                    placeholder="At least 6 characters"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    value={confirmPw}
                    onChange={(e) => {
                      setConfirmPw(e.target.value);
                      setPwError('');
                      setPwSuccess(false);
                    }}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 bg-slate-50 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
                    placeholder="Re-enter new password"
                  />
                </div>
              </div>
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-semibold text-sm shadow-lg hover:from-emerald-500 hover:to-teal-600 transition-all"
            >
              Update Password
            </button>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="flex gap-1 p-1 bg-slate-100 rounded-xl">
          {(['all', 'Male', 'Female'] as const).map((g) => (
            <button
              key={g}
              onClick={() => setFilterGender(g)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filterGender === g
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {g === 'all' ? 'All Genders' : g}
            </button>
          ))}
        </div>

        <select
          value={filterDV}
          onChange={(e) =>
            setFilterDV(e.target.value as DVStatus | 'all')
          }
          className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-xs font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
        >
          <option value="all">All DV Status</option>
          {DV_STATUSES.map((d) => (
            <option key={d} value={d}>
              DV: {d}
            </option>
          ))}
        </select>

        <span className="ml-auto text-sm text-slate-500 self-center">
          {filtered.length} record{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Records */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
          <p className="text-slate-500 text-sm">No records found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((c) => {
            const rank = groupRankMap.get(c.id) ?? '-';
            const isExpanded = expandedId === c.id;
            return (
              <div
                key={c.id}
                className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden"
              >
                {/* Summary row */}
                <div
                  className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-slate-50 transition-colors"
                  onClick={() =>
                    setExpandedId(isExpanded ? null : c.id)
                  }
                >
                  <span
                    className={`inline-flex items-center justify-center w-9 h-9 rounded-lg border font-bold text-xs flex-shrink-0 ${
                      typeof rank === 'number' && rank <= 3
                        ? rank === 1
                          ? 'bg-amber-100 text-amber-700 border-amber-300'
                          : rank === 2
                            ? 'bg-slate-200 text-slate-700 border-slate-400'
                            : 'bg-orange-100 text-orange-700 border-orange-300'
                        : 'bg-slate-100 text-slate-600 border-slate-300'
                    }`}
                  >
                    {rank}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 text-sm truncate">
                      {c.fullName}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span
                        className={`inline-flex items-center gap-1 text-xs ${
                          c.gender === 'Male'
                            ? 'text-sky-600'
                            : 'text-pink-600'
                        }`}
                      >
                        {c.gender === 'Male' ? (
                          <UserRound className="w-3 h-3" />
                        ) : (
                          <Users2 className="w-3 h-3" />
                        )}
                        {c.gender}
                      </span>
                      <span className="text-slate-300">·</span>
                      <span className="text-xs text-slate-500">
                        Applied: {c.categoryApplied}
                      </span>
                      <span className="text-slate-300">·</span>
                      <span className="text-xs text-slate-500">
                        T1: {c.tier1Marks.toFixed(2)}
                      </span>
                      <span className="text-slate-300">·</span>
                      <span className="text-xs text-slate-500">
                        T2: {c.tier2Marks.toFixed(2)}
                      </span>
                      <span className="text-slate-300">·</span>
                      <span
                        className={`text-xs font-medium ${
                          c.shortlistedDV === 'Yes'
                            ? 'text-emerald-600'
                            : 'text-slate-400'
                        }`}
                      >
                        DV: {c.shortlistedDV}
                      </span>
                      <span className="text-slate-300">·</span>
                      <span
                        className={`text-xs font-medium ${
                          c.appliedOtherPost === 'Yes'
                            ? 'text-emerald-600'
                            : 'text-slate-400'
                        }`}
                      >
                        Other: {c.appliedOtherPost}
                      </span>
                      <span className="text-slate-300">·</span>
                      <span
                        className={`text-xs font-medium ${
                          c.shortlistedOtherPost === 'Yes'
                            ? 'text-emerald-600'
                            : 'text-slate-400'
                        }`}
                      >
                        Other SL: {c.shortlistedOtherPost}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(c.id, c.fullName);
                    }}
                    className="p-2 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors flex-shrink-0"
                    title="Delete record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="border-t border-slate-100 p-4 bg-slate-50/50">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                      <DetailItem
                        icon={Hash}
                        label="Registration No."
                        value={c.registrationNumber}
                      />
                      <DetailItem
                        icon={Phone}
                        label="Phone"
                        value={c.phoneNumber}
                      />
                      <DetailItem
                        icon={Mail}
                        label="Email"
                        value={c.email}
                      />
                      <DetailItem
                        icon={Tag}
                        label="Category Applied For"
                        value={c.categoryApplied}
                      />
                      <DetailItem
                        icon={Tag}
                        label="Tier-1 Qualified Category"
                        value={c.category}
                      />
                      <DetailItem
                        icon={CheckSquare}
                        label="Shortlisted for DV"
                        value={c.shortlistedDV}
                      />
                      <DetailItem
                        icon={CheckSquare}
                        label="Applied for Other Post"
                        value={c.appliedOtherPost}
                      />
                      <DetailItem
                        icon={CheckSquare}
                        label="Shortlisted for Other Post"
                        value={c.shortlistedOtherPost}
                      />
                      <DetailItem
                        icon={ClipboardList}
                        label="Tier-1 Marks"
                        value={c.tier1Marks.toFixed(2)}
                      />
                      <DetailItem
                        icon={FileText}
                        label="Tier-2 Marks"
                        value={c.tier2Marks.toFixed(2)}
                      />
                      <DetailItem
                        icon={Calendar}
                        label="Submitted On"
                        value={new Date(c.createdAt).toLocaleString('en-IN', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      />
                    </div>

                    {/* Photo */}
                    {c.photoDataUrl ? (
                      <div className="mt-4">
                        <p className="text-xs font-semibold text-slate-600 mb-2">
                          Uploaded Marks Proof
                        </p>
                        <div className="relative inline-block group">
                          <img
                            src={c.photoDataUrl}
                            alt="Marks proof"
                            className="max-h-48 rounded-lg border border-slate-300 shadow-md cursor-pointer"
                            onClick={() => setPhotoView(c.photoDataUrl)}
                          />
                          <button
                            onClick={() => setPhotoView(c.photoDataUrl)}
                            className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-lg flex items-center justify-center transition-all"
                          >
                            <Eye className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="mt-4 text-xs text-slate-400">
                        No photo uploaded.
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Photo viewer modal */}
      {photoView && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4"
          onClick={() => setPhotoView(null)}
        >
          <div className="relative max-w-3xl w-full">
            <button
              onClick={() => setPhotoView(null)}
              className="absolute -top-10 right-0 text-white hover:text-slate-300"
            >
              <X className="w-7 h-7" />
            </button>
            <img
              src={photoView}
              alt="Marks proof full view"
              className="w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
            />
            <a
              href={photoView}
              download="marks-proof.png"
              className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 text-white text-sm hover:bg-white/20 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailItem({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Hash;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-slate-500" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-400 font-medium">{label}</p>
        <p className="text-sm text-slate-800 font-medium break-all">
          {value}
        </p>
      </div>
    </div>
  );
}
