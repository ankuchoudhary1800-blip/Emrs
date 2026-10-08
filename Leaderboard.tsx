import { useMemo, useState } from 'react';
import {
  Trophy,
  UserRound,
  Users2,
  Users,
  Lock,
  Search,
  Award,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import type { Candidate, Gender, DVStatus } from '@/types';
import { rankByGroup } from '@/lib/storage';

interface LeaderboardProps {
  candidates: Candidate[];
  authed: boolean;
}

type DVTab = DVStatus;
type GenderTab = 'all' | Gender;

export default function Leaderboard({ candidates, authed }: LeaderboardProps) {
  const [dvTab, setDvTab] = useState<DVTab>('Yes');
  const [genderTab, setGenderTab] = useState<GenderTab>('all');
  const [search, setSearch] = useState('');

  const groupRankMap = useMemo(() => rankByGroup(candidates), [candidates]);

  const filtered = useMemo(() => {
    let list = candidates.filter((c) => c.shortlistedDV === dvTab);
    if (genderTab !== 'all') list = list.filter((c) => c.gender === genderTab);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.fullName.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q) ||
          c.categoryApplied.toLowerCase().includes(q)
      );
    }
    return [...list].sort((a, b) => {
      const ra = groupRankMap.get(a.id) ?? 999;
      const rb = groupRankMap.get(b.id) ?? 999;
      return ra - rb;
    });
  }, [candidates, dvTab, genderTab, search, groupRankMap]);

  const dvTabs: { key: DVTab; label: string; icon: typeof CheckCircle2 }[] = [
    { key: 'Yes', label: 'Shortlisted for DV', icon: CheckCircle2 },
    { key: 'No', label: 'Not Shortlisted', icon: XCircle },
  ];

  const genderTabs: { key: GenderTab; label: string; icon: typeof Users }[] = [
    { key: 'all', label: 'Both', icon: Users },
    { key: 'Male', label: 'Male Warden', icon: UserRound },
    { key: 'Female', label: 'Female Warden', icon: Users2 },
  ];

  const medalColor = (rank: number) => {
    if (rank === 1) return 'bg-amber-100 text-amber-700 border-amber-300';
    if (rank === 2) return 'bg-slate-200 text-slate-700 border-slate-400';
    if (rank === 3) return 'bg-orange-100 text-orange-700 border-orange-300';
    return 'bg-slate-100 text-slate-600 border-slate-300';
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Hero */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 mb-2">
          <Trophy className="w-7 h-7 text-amber-500" />
          <h2 className="text-2xl font-bold text-slate-800">
            Recruitment Leaderboard
          </h2>
        </div>
        <p className="text-slate-500 text-sm">
          Live ranking of Hostel Warden candidates by Tier-1 &amp; Tier-2 marks
        </p>
      </div>

      {/* Privacy notice */}
      <div className="mb-6 flex items-center gap-2 p-3 rounded-lg bg-sky-50 border border-sky-200">
        <Lock className="w-4 h-4 text-sky-600 flex-shrink-0" />
        <p className="text-sky-800 text-xs">
          Personal details (registration number, phone, email, photos) are
          hidden from the public and visible only to the admin.
        </p>
      </div>

      {/* DV Status tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 rounded-xl mb-3">
        {dvTabs.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setDvTab(t.key)}
              className={`flex-1 flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                dvTab === t.key
                  ? t.key === 'Yes'
                    ? 'bg-emerald-500 text-white shadow-md'
                    : 'bg-slate-600 text-white shadow-md'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Gender sub-tabs + search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-5">
        <div className="flex gap-1 p-1 bg-slate-100 rounded-xl">
          {genderTabs.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.key}
                onClick={() => setGenderTab(t.key)}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  genderTab === t.key
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {t.label}
              </button>
            );
          })}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name or category..."
            className="w-full sm:w-64 pl-10 pr-4 py-2 rounded-lg border border-slate-300 bg-white text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">
            No candidates found in this category.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">
                    Rank
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600 hidden sm:table-cell">
                    Gender
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">
                    Category Applied
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600 hidden md:table-cell">
                    Tier-1 Qualified
                  </th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-600">
                    Tier-1
                  </th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-600">
                    Tier-2
                  </th>
                  <th className="px-4 py-3 text-center font-semibold text-slate-600">
                    DV
                  </th>
                  <th className="px-4 py-3 text-center font-semibold text-slate-600 hidden lg:table-cell">
                    Other Post
                  </th>
                  <th className="px-4 py-3 text-center font-semibold text-slate-600 hidden lg:table-cell">
                    Other SL
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((c) => {
                  const rank = groupRankMap.get(c.id) ?? '-';
                  return (
                    <tr
                      key={c.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center justify-center w-8 h-8 rounded-lg border font-bold text-xs ${medalColor(
                            typeof rank === 'number' ? rank : 99
                          )}`}
                        >
                          {rank}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-800">
                        {c.fullName}
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                            c.gender === 'Male'
                              ? 'bg-sky-100 text-sky-700'
                              : 'bg-pink-100 text-pink-700'
                          }`}
                        >
                          {c.gender === 'Male' ? (
                            <UserRound className="w-3 h-3" />
                          ) : (
                            <Users2 className="w-3 h-3" />
                          )}
                          {c.gender}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-xs font-medium">
                          {c.categoryApplied}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-xs font-medium">
                          {c.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-slate-700">
                        {c.tier1Marks.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-slate-700">
                        {c.tier2Marks.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {c.shortlistedDV === 'Yes' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" />
                        ) : (
                          <XCircle className="w-4 h-4 text-slate-300 mx-auto" />
                        )}
                      </td>
                      <td className="px-4 py-3 text-center hidden lg:table-cell">
                        {c.appliedOtherPost === 'Yes' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" />
                        ) : (
                          <XCircle className="w-4 h-4 text-slate-300 mx-auto" />
                        )}
                      </td>
                      <td className="px-4 py-3 text-center hidden lg:table-cell">
                        {c.shortlistedOtherPost === 'Yes' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" />
                        ) : (
                          <XCircle className="w-4 h-4 text-slate-300 mx-auto" />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {authed && (
        <p className="text-center mt-4 text-xs text-slate-400 flex items-center justify-center gap-1">
          <Award className="w-3.5 h-3.5" />
          Admin mode: full details are in the Admin Panel.
        </p>
      )}
    </div>
  );
}
