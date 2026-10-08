import { useMemo } from 'react';
import {
  BarChart3,
  Users,
  UserRound,
  Users2,
  TrendingUp,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import type { Candidate, Category, Gender, DVStatus } from '@/types';
import { CATEGORIES } from '@/lib/storage';

interface AnalyticsProps {
  candidates: Candidate[];
}

const categoryColors: Record<Category, string> = {
  General: 'bg-blue-500',
  EWS: 'bg-emerald-500',
  OBC: 'bg-amber-500',
  SC: 'bg-purple-500',
  ST: 'bg-pink-500',
  PWD: 'bg-rose-500',
};

export default function Analytics({ candidates }: AnalyticsProps) {
  const stats = useMemo(() => {
    const male = candidates.filter((c) => c.gender === 'Male');
    const female = candidates.filter((c) => c.gender === 'Female');

    const catBreakdown = (list: Candidate[], field: 'categoryApplied' | 'category') => {
      const map: Record<Category, number> = {
        General: 0,
        EWS: 0,
        OBC: 0,
        SC: 0,
        ST: 0,
        PWD: 0,
      };
      list.forEach((c) => {
        map[c[field]] += 1;
      });
      return map;
    };

    const dvCount = (list: Candidate[], status: DVStatus) =>
      list.filter((c) => c.shortlistedDV === status).length;

    return {
      total: candidates.length,
      male: {
        count: male.length,
        applied: catBreakdown(male, 'categoryApplied'),
        qualified: catBreakdown(male, 'category'),
        dvYes: dvCount(male, 'Yes'),
        dvNo: dvCount(male, 'No'),
      },
      female: {
        count: female.length,
        applied: catBreakdown(female, 'categoryApplied'),
        qualified: catBreakdown(female, 'category'),
        dvYes: dvCount(female, 'Yes'),
        dvNo: dvCount(female, 'No'),
      },
    };
  }, [candidates]);

  const avgTier = (gender: Gender, tier: 1 | 2) => {
    const list = candidates.filter((c) => c.gender === gender);
    if (list.length === 0) return '0.00';
    const key = tier === 1 ? 'tier1Marks' : 'tier2Marks';
    const avg = list.reduce((s, c) => s + c[key], 0) / list.length;
    return avg.toFixed(2);
  };

  const GenderCard = ({
    gender,
    data,
    icon,
    accent,
  }: {
    gender: Gender;
    data: {
      count: number;
      applied: Record<Category, number>;
      dvYes: number;
      dvNo: number;
    };
    icon: typeof UserRound;
    accent: string;
  }) => {
    const Icon = icon;
    const maxCat = Math.max(...CATEGORIES.map((c) => data.applied[c]), 1);
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        <div
          className={`px-5 py-4 flex items-center justify-between ${accent}`}
        >
          <div className="flex items-center gap-2">
            <Icon className="w-5 h-5 text-white" />
            <h3 className="text-white font-bold text-base">
              {gender} Warden Candidates
            </h3>
          </div>
          <span className="text-white text-3xl font-bold tabular-nums">
            {data.count}
          </span>
        </div>

        {/* DV status badges */}
        <div className="flex gap-3 px-5 py-3 bg-slate-50 border-b border-slate-100">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-medium text-slate-600">
              DV Shortlisted: <strong>{data.dvYes}</strong>
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <XCircle className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-medium text-slate-600">
              Not Shortlisted: <strong>{data.dvNo}</strong>
            </span>
          </div>
        </div>

        <div className="p-5 space-y-3">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
            Category Applied For
          </p>
          {CATEGORIES.map((cat) => {
            const count = data.applied[cat];
            const pct = (count / maxCat) * 100;
            return (
              <div key={cat} className="flex items-center gap-3">
                <span className="text-xs font-medium text-slate-600 w-14 flex-shrink-0">
                  {cat}
                </span>
                <div className="flex-1 h-6 bg-slate-100 rounded-md overflow-hidden">
                  <div
                    className={`h-full ${categoryColors[cat]} rounded-md transition-all duration-500 flex items-center justify-end pr-2`}
                    style={{ width: `${Math.max(pct, count > 0 ? 8 : 0)}%` }}
                  >
                    {count > 0 && (
                      <span className="text-white text-[10px] font-bold">
                        {count}
                      </span>
                    )}
                  </div>
                </div>
                {count === 0 && (
                  <span className="text-slate-300 text-xs w-6">0</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 mb-2">
          <BarChart3 className="w-7 h-7 text-emerald-600" />
          <h2 className="text-2xl font-bold text-slate-800">
            Recruitment Statistics
          </h2>
        </div>
        <p className="text-slate-500 text-sm">
          Gender-wise and category-wise breakdown of all candidates
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-md border border-slate-200 p-5 text-center">
          <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 flex items-center justify-center mb-3">
            <Users className="w-6 h-6 text-slate-600" />
          </div>
          <p className="text-3xl font-bold text-slate-800 tabular-nums">
            {stats.total}
          </p>
          <p className="text-slate-500 text-xs mt-1">Total Candidates</p>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-slate-200 p-5 text-center">
          <div className="w-12 h-12 mx-auto rounded-full bg-sky-100 flex items-center justify-center mb-3">
            <TrendingUp className="w-6 h-6 text-sky-600" />
          </div>
          <p className="text-3xl font-bold text-sky-700 tabular-nums">
            {avgTier('Male', 2)}
          </p>
          <p className="text-slate-500 text-xs mt-1">Male Avg Tier-2 Marks</p>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-slate-200 p-5 text-center">
          <div className="w-12 h-12 mx-auto rounded-full bg-pink-100 flex items-center justify-center mb-3">
            <TrendingUp className="w-6 h-6 text-pink-600" />
          </div>
          <p className="text-3xl font-bold text-pink-700 tabular-nums">
            {avgTier('Female', 2)}
          </p>
          <p className="text-slate-500 text-xs mt-1">
            Female Avg Tier-2 Marks
          </p>
        </div>
      </div>

      {/* Gender breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GenderCard
          gender="Male"
          data={stats.male}
          icon={UserRound}
          accent="bg-gradient-to-r from-sky-500 to-blue-600"
        />
        <GenderCard
          gender="Female"
          data={stats.female}
          icon={Users2}
          accent="bg-gradient-to-r from-pink-500 to-rose-600"
        />
      </div>
    </div>
  );
}
