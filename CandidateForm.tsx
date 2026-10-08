import { useState, useRef, useEffect } from 'react';
import {
  User,
  Phone,
  Mail,
  Hash,
  UserRound,
  Users,
  Tag,
  ClipboardList,
  FileText,
  Upload,
  CheckCircle,
  Eye,
  EyeOff,
  X,
  CheckSquare,
  Square,
} from 'lucide-react';
import type { Candidate, Gender, Category, DVStatus } from '@/types';
import { CATEGORIES, addCandidate } from '@/lib/storage';

interface FormProps {
  onSubmitted: () => void;
}

interface Field {
  fullName: string;
  registrationNumber: string;
  phoneNumber: string;
  email: string;
  gender: Gender | '';
  categoryApplied: Category | '';
  category: Category | '';
  shortlistedDV: DVStatus | '';
  appliedOtherPost: DVStatus | '';
  shortlistedOtherPost: DVStatus | '';
  tier1Marks: string;
  tier2Marks: string;
}

const empty: Field = {
  fullName: '',
  registrationNumber: '',
  phoneNumber: '',
  email: '',
  gender: '',
  categoryApplied: '',
  category: '',
  shortlistedDV: '',
  appliedOtherPost: '',
  shortlistedOtherPost: '',
  tier1Marks: '',
  tier2Marks: '',
};

export default function CandidateForm({ onSubmitted }: FormProps) {
  const [form, setForm] = useState<Field>(empty);
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');
  const [errors, setErrors] = useState<Partial<Record<keyof Field, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [showReg, setShowReg] = useState(false);
  const [showPhone, setShowPhone] = useState(false);
  const [showEmail, setShowEmail] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (submitted) {
      const t = setTimeout(() => setSubmitted(false), 5000);
      return () => clearTimeout(t);
    }
  }, [submitted]);

  const update = (key: keyof Field, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setErrors((e) => ({ ...e, fullName: 'Photo must be under 2 MB' }));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setPhotoDataUrl(reader.result as string);
      setFileName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const validate = (): boolean => {
    const e: Partial<Record<keyof Field, string>> = {};
    if (!form.fullName.trim()) e.fullName = 'Full name is required';
    if (!form.registrationNumber.trim())
      e.registrationNumber = 'Registration number is required';
    if (!form.phoneNumber.trim()) e.phoneNumber = 'Phone number is required';
    else if (!/^\d{10}$/.test(form.phoneNumber.trim()))
      e.phoneNumber = 'Enter a valid 10-digit phone number';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      e.email = 'Enter a valid email address';
    if (!form.gender) e.gender = 'Select gender';
    if (!form.categoryApplied) e.categoryApplied = 'Select applied category';
    if (!form.category) e.category = 'Select qualified category';
    if (!form.shortlistedDV) e.shortlistedDV = 'Select DV status';
    if (!form.appliedOtherPost) e.appliedOtherPost = 'Select option';
    if (!form.shortlistedOtherPost) e.shortlistedOtherPost = 'Select option';
    const t1 = parseFloat(form.tier1Marks);
    const t2 = parseFloat(form.tier2Marks);
    if (isNaN(t1) || t1 < 0) e.tier1Marks = 'Enter valid Tier-1 marks';
    if (isNaN(t2) || t2 < 0) e.tier2Marks = 'Enter valid Tier-2 marks';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setSubmitError('');
    const candidate: Candidate = {
      id: crypto.randomUUID(),
      fullName: form.fullName.trim(),
      registrationNumber: form.registrationNumber.trim(),
      phoneNumber: form.phoneNumber.trim(),
      email: form.email.trim(),
      gender: form.gender as Gender,
      categoryApplied: form.categoryApplied as Category,
      category: form.category as Category,
      shortlistedDV: form.shortlistedDV as DVStatus,
      appliedOtherPost: form.appliedOtherPost as DVStatus,
      shortlistedOtherPost: form.shortlistedOtherPost as DVStatus,
      tier1Marks: parseFloat(form.tier1Marks),
      tier2Marks: parseFloat(form.tier2Marks),
      photoDataUrl,
      createdAt: new Date().toISOString(),
    };
    try {
      await addCandidate(candidate);
      setForm(empty);
      setPhotoDataUrl(null);
      setFileName('');
      if (fileRef.current) fileRef.current.value = '';
      setSubmitted(true);
      onSubmitted();
    } catch {
      setSubmitError('Failed to submit. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = (err?: string) =>
    `w-full pl-10 pr-4 py-2.5 rounded-lg border bg-slate-50 text-slate-900 text-sm placeholder:text-slate-400 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/40 ${
      err
        ? 'border-red-400 focus:border-red-500'
        : 'border-slate-300 focus:border-emerald-500'
    }`;

  const labelClass = 'block text-sm font-semibold text-slate-700 mb-1.5';

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      {submitted && (
        <div className="mb-6 p-4 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center gap-3 animate-pulse">
          <CheckCircle className="w-6 h-6 text-emerald-600 flex-shrink-0" />
          <p className="text-emerald-800 text-sm font-medium">
            Your marks have been submitted successfully! Your rank will appear
            on the public leaderboard.
          </p>
        </div>
      )}

      {submitError && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 flex items-center gap-3">
          <X className="w-6 h-6 text-red-500 flex-shrink-0" />
          <p className="text-red-700 text-sm font-medium">{submitError}</p>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 px-6 py-5">
          <h2 className="text-white text-xl font-bold">Submit Your Marks</h2>
          <p className="text-emerald-100 text-sm mt-1">
            Enter your recruitment exam details to be included in the ranking.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Full Name */}
          <div>
            <label className={labelClass}>Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={form.fullName}
                onChange={(e) => update('fullName', e.target.value)}
                className={inputClass(errors.fullName)}
                placeholder="e.g. Ramesh Kumar"
              />
            </div>
            {errors.fullName && (
              <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>
            )}
          </div>

          {/* Registration Number */}
          <div>
            <label className={labelClass}>Registration Number</label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type={showReg ? 'text' : 'password'}
                value={form.registrationNumber}
                onChange={(e) => update('registrationNumber', e.target.value)}
                className={inputClass(errors.registrationNumber)}
                placeholder="e.g. EMRS2024xxxxxx"
              />
              <button
                type="button"
                onClick={() => setShowReg(!showReg)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showReg ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {errors.registrationNumber && (
              <p className="text-red-500 text-xs mt-1">
                {errors.registrationNumber}
              </p>
            )}
            <p className="text-slate-400 text-xs mt-1">
              Kept private — only visible to the admin.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Phone */}
            <div>
              <label className={labelClass}>Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPhone ? 'text' : 'password'}
                  value={form.phoneNumber}
                  onChange={(e) => update('phoneNumber', e.target.value)}
                  className={inputClass(errors.phoneNumber)}
                  placeholder="10-digit number"
                />
                <button
                  type="button"
                  onClick={() => setShowPhone(!showPhone)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPhone ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.phoneNumber && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.phoneNumber}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className={labelClass}>Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showEmail ? 'text' : 'password'}
                  value={form.email}
                  onChange={(e) => update('email', e.target.value)}
                  className={inputClass(errors.email)}
                  placeholder="you@example.com"
                />
                <button
                  type="button"
                  onClick={() => setShowEmail(!showEmail)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showEmail ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Gender */}
            <div>
              <label className={labelClass}>Gender</label>
              <div className="grid grid-cols-2 gap-2">
                {(['Male', 'Female'] as Gender[]).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => update('gender', g)}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                      form.gender === g
                        ? g === 'Male'
                          ? 'bg-sky-500 text-white border-sky-500 shadow-md'
                          : 'bg-pink-500 text-white border-pink-500 shadow-md'
                        : 'bg-slate-50 text-slate-600 border-slate-300 hover:border-slate-400'
                    }`}
                  >
                    {g === 'Male' ? (
                      <UserRound className="w-4 h-4" />
                    ) : (
                      <Users className="w-4 h-4" />
                    )}
                    {g}
                  </button>
                ))}
              </div>
              {errors.gender && (
                <p className="text-red-500 text-xs mt-1">{errors.gender}</p>
              )}
            </div>

            {/* Shortlisted for DV */}
            <div>
              <label className={labelClass}>Shortlisted for DV</label>
              <div className="grid grid-cols-2 gap-2">
                {(['Yes', 'No'] as DVStatus[]).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => update('shortlistedDV', d)}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                      form.shortlistedDV === d
                        ? d === 'Yes'
                          ? 'bg-emerald-500 text-white border-emerald-500 shadow-md'
                          : 'bg-slate-500 text-white border-slate-500 shadow-md'
                        : 'bg-slate-50 text-slate-600 border-slate-300 hover:border-slate-400'
                    }`}
                  >
                    {d === 'Yes' ? (
                      <CheckSquare className="w-4 h-4" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                    {d}
                  </button>
                ))}
              </div>
              {errors.shortlistedDV && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.shortlistedDV}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Applied for Other Post */}
            <div>
              <label className={labelClass}>Applied for Other Post</label>
              <div className="grid grid-cols-2 gap-2">
                {(['Yes', 'No'] as DVStatus[]).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => update('appliedOtherPost', d)}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                      form.appliedOtherPost === d
                        ? d === 'Yes'
                          ? 'bg-emerald-500 text-white border-emerald-500 shadow-md'
                          : 'bg-slate-500 text-white border-slate-500 shadow-md'
                        : 'bg-slate-50 text-slate-600 border-slate-300 hover:border-slate-400'
                    }`}
                  >
                    {d === 'Yes' ? (
                      <CheckSquare className="w-4 h-4" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                    {d}
                  </button>
                ))}
              </div>
              {errors.appliedOtherPost && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.appliedOtherPost}
                </p>
              )}
            </div>

            {/* Shortlisted for Other Post */}
            <div>
              <label className={labelClass}>Shortlisted for Other Post</label>
              <div className="grid grid-cols-2 gap-2">
                {(['Yes', 'No'] as DVStatus[]).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => update('shortlistedOtherPost', d)}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                      form.shortlistedOtherPost === d
                        ? d === 'Yes'
                          ? 'bg-emerald-500 text-white border-emerald-500 shadow-md'
                          : 'bg-slate-500 text-white border-slate-500 shadow-md'
                        : 'bg-slate-50 text-slate-600 border-slate-300 hover:border-slate-400'
                    }`}
                  >
                    {d === 'Yes' ? (
                      <CheckSquare className="w-4 h-4" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                    {d}
                  </button>
                ))}
              </div>
              {errors.shortlistedOtherPost && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.shortlistedOtherPost}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Category Applied For */}
            <div>
              <label className={labelClass}>Category Applied For</label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <select
                  value={form.categoryApplied}
                  onChange={(e) => update('categoryApplied', e.target.value)}
                  className={inputClass(errors.categoryApplied)}
                >
                  <option value="">Select category</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              {errors.categoryApplied && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.categoryApplied}
                </p>
              )}
            </div>

            {/* Category Qualified in Tier-1 */}
            <div>
              <label className={labelClass}>
                Category Qualified in Tier-1
              </label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <select
                  value={form.category}
                  onChange={(e) => update('category', e.target.value)}
                  className={inputClass(errors.category)}
                >
                  <option value="">Select category</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              {errors.category && (
                <p className="text-red-500 text-xs mt-1">{errors.category}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Tier-1 Marks */}
            <div>
              <label className={labelClass}>Tier-1 Marks</label>
              <div className="relative">
                <ClipboardList className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.tier1Marks}
                  onChange={(e) => update('tier1Marks', e.target.value)}
                  className={inputClass(errors.tier1Marks)}
                  placeholder="e.g. 85.50"
                />
              </div>
              {errors.tier1Marks && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.tier1Marks}
                </p>
              )}
            </div>

            {/* Tier-2 Marks */}
            <div>
              <label className={labelClass}>Tier-2 Marks</label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.tier2Marks}
                  onChange={(e) => update('tier2Marks', e.target.value)}
                  className={inputClass(errors.tier2Marks)}
                  placeholder="e.g. 72.00"
                />
              </div>
              {errors.tier2Marks && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.tier2Marks}
                </p>
              )}
            </div>
          </div>

          {/* Photo Upload */}
          <div>
            <label className={labelClass}>Upload Marks Proof (Screenshot)</label>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                handleFile(e.dataTransfer.files?.[0]);
              }}
              className="relative border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-emerald-500 transition-colors cursor-pointer bg-slate-50"
              onClick={() => fileRef.current?.click()}
            >
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
              {photoDataUrl ? (
                <div className="relative inline-block">
                  <img
                    src={photoDataUrl}
                    alt="Marks proof preview"
                    className="max-h-40 mx-auto rounded-lg shadow-md"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPhotoDataUrl(null);
                      setFileName('');
                      if (fileRef.current) fileRef.current.value = '';
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-md"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                  <p className="text-emerald-600 text-xs mt-2 font-medium truncate max-w-xs mx-auto">
                    {fileName}
                  </p>
                </div>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-slate-600 text-sm">
                    Click or drag a screenshot here
                  </p>
                  <p className="text-slate-400 text-xs mt-1">
                    Max 2 MB · visible only to admin
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-semibold text-sm shadow-lg hover:from-emerald-500 hover:to-teal-600 transition-all hover:scale-[1.01] active:scale-100 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? 'Submitting…' : 'Submit Marks'}
          </button>
        </form>
      </div>
    </div>
  );
}
