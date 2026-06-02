import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import { useAuth } from '../AuthContext';
import {
  ArrowLeft, History, Search, Filter,
  ChevronDown, ChevronUp, GraduationCap,
  Database, Download, LogOut
} from 'lucide-react';

interface Entry {
  id: string;
  created_at: string;
  csr_name: string;
  parent_name: string;
  f_code: string;
  issued_on: string;
  due_date: string;
  currency: string;
  exchange_rate: number;
  selected_months: string[];
  month_count: number;
  total_amount: number;
  program_discount_amount: number;
  custom_discount_amount: number;
  final_amount: number;
  student_count: number;
  students: any[];
  registration_entries: any[];
  source_url: string;
  google_sheet_sent: boolean;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  // Filters
  const [filterCsr, setFilterCsr] = useState('');
  const [filterParent, setFilterParent] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [filterMinAmount, setFilterMinAmount] = useState('');
  const [filterMaxAmount, setFilterMaxAmount] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [filterCurrency, setFilterCurrency] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('calculator_entries')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setEntries(data || []);
    } catch (err) {
      console.error('Failed to fetch entries:', err);
    } finally {
      setLoading(false);
    }
  };

  const uniqueCsrs = Array.from(new Set(entries.map(e => e.csr_name).filter(Boolean))).sort();
  const uniqueCurrencies = Array.from(new Set(entries.map(e => e.currency).filter(Boolean))).sort();

  const filtered = entries.filter(e => {
    if (filterCsr && e.csr_name?.toLowerCase() !== filterCsr.toLowerCase()) return false;
    if (filterParent && !e.parent_name?.toLowerCase().includes(filterParent.toLowerCase())) return false;
    if (filterDateFrom && new Date(e.created_at) < new Date(filterDateFrom)) return false;
    if (filterDateTo && new Date(e.created_at) > new Date(filterDateTo + 'T23:59:59')) return false;
    if (filterMinAmount && e.final_amount < parseFloat(filterMinAmount)) return false;
    if (filterMaxAmount && e.final_amount > parseFloat(filterMaxAmount)) return false;
    if (filterMonth && !e.selected_months?.some((m: string) => m.toLowerCase().includes(filterMonth.toLowerCase()))) return false;
    if (filterCurrency && e.currency !== filterCurrency) return false;
    return true;
  });

  const clearFilters = () => {
    setFilterCsr(''); setFilterParent(''); setFilterDateFrom('');
    setFilterDateTo(''); setFilterMinAmount(''); setFilterMaxAmount('');
    setFilterMonth(''); setFilterCurrency('');
  };

  const activeFilterCount = [
    filterCsr, filterParent, filterDateFrom, filterDateTo,
    filterMinAmount, filterMaxAmount, filterMonth, filterCurrency
  ].filter(Boolean).length;

  const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
  const formatAmount = (n: number, currency: string) => `${currency || 'SAR'} ${(n || 0).toFixed(2)}`;

  const handleExportCSV = () => {
    const headers = [
      'Date', 'CSR', 'Parent', 'F.Code', 'Currency', 'Exchange Rate',
      'Months', 'Month Count', 'Students', 'Total',
      'Prog. Discount', 'Custom Discount', 'Final Amount',
      'Due Date', 'Google Sheet Synced'
    ];
    const rows = filtered.map(e => [
      formatDate(e.created_at),
      e.csr_name,
      e.parent_name,
      e.f_code,
      e.currency,
      e.exchange_rate,
      Array.isArray(e.selected_months) ? e.selected_months.join('; ') : '',
      e.month_count,
      e.student_count,
      e.total_amount,
      e.program_discount_amount,
      e.custom_discount_amount,
      e.final_amount,
      formatDate(e.due_date),
      e.google_sheet_sent ? 'Yes' : 'No'
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    a.download = `IQRA_Admissions_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="w-full px-6">
          <div className="h-16 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#7a1f2b] flex items-center justify-center shadow-sm">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div className="leading-tight">
                <div className="font-extrabold text-slate-900 text-sm">IQRA VIRTUAL SCHOOL</div>
                <div className="text-xs text-slate-500">Admin — All Admissions</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 bg-[#7a1f2b]/10 border border-[#7a1f2b]/20 px-3 py-1.5 rounded-full">
                <Database className="w-3.5 h-3.5 text-[#7a1f2b]" />
                <span className="text-xs font-semibold text-[#7a1f2b]">Admin</span>
              </div>
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition shadow-sm"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
              <button
                onClick={() => navigate('/calculator')}
                className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold px-4 py-2 rounded-lg transition"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Calculator
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-5">

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <p className="text-xs text-slate-500 font-medium">Total Admissions</p>
            <p className="text-3xl font-black text-slate-800 mt-1">{filtered.length}</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <p className="text-xs text-slate-500 font-medium">Total Students</p>
            <p className="text-3xl font-black text-slate-800 mt-1">
              {filtered.reduce((s, e) => s + (e.student_count || 0), 0)}
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <p className="text-xs text-slate-500 font-medium">Active CSRs</p>
            <p className="text-3xl font-black text-blue-600 mt-1">
              {new Set(filtered.map(e => e.csr_name)).size}
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <p className="text-xs text-slate-500 font-medium">SAR Revenue</p>
            <p className="text-3xl font-black text-[#7a1f2b] mt-1">
              {filtered.filter(e => e.currency === 'SAR').reduce((s, e) => s + (e.final_amount || 0), 0).toFixed(0)}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div
            className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 transition"
            onClick={() => setShowFilters(!showFilters)}
          >
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-500" />
              <span className="text-sm font-semibold text-slate-700">Filters</span>
              {activeFilterCount > 0 && (
                <span className="bg-[#7a1f2b] text-white text-xs font-bold px-2 py-0.5 rounded-full">{activeFilterCount}</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {activeFilterCount > 0 && (
                <button
                  onClick={(ev) => { ev.stopPropagation(); clearFilters(); }}
                  className="text-xs text-red-500 hover:text-red-700 font-medium"
                >
                  Clear all
                </button>
              )}
              {showFilters ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </div>
          </div>

          {showFilters && (
            <div className="px-4 pb-4 grid grid-cols-2 md:grid-cols-4 gap-3 border-t border-slate-100 pt-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">CSR Name</label>
                <select
                  value={filterCsr}
                  onChange={e => setFilterCsr(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">All CSRs</option>
                  {uniqueCsrs.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Parent Name</label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={filterParent}
                    onChange={e => setFilterParent(e.target.value)}
                    placeholder="Search..."
                    className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Date From</label>
                <input type="date" value={filterDateFrom} onChange={e => setFilterDateFrom(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Date To</label>
                <input type="date" value={filterDateTo} onChange={e => setFilterDateTo(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Min Amount</label>
                <input type="number" value={filterMinAmount} onChange={e => setFilterMinAmount(e.target.value)} placeholder="0" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Max Amount</label>
                <input type="number" value={filterMaxAmount} onChange={e => setFilterMaxAmount(e.target.value)} placeholder="9999" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Billing Month</label>
                <input type="text" value={filterMonth} onChange={e => setFilterMonth(e.target.value)} placeholder="e.g. May 2026" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Currency</label>
                <select value={filterCurrency} onChange={e => setFilterCurrency(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                  <option value="">All</option>
                  {uniqueCurrencies.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-red-200 border-t-[#7a1f2b] rounded-full animate-spin"></div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <History className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No admissions found</p>
              <p className="text-slate-400 text-sm mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">CSR</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Parent</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">F.Code</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Currency</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Months</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Students</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Total</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Discount</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Final</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Due Date</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((entry) => (
                    <React.Fragment key={entry.id}>
                      <tr className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{formatDate(entry.created_at)}</td>
                        <td className="px-4 py-3">
                          <span className="bg-[#7a1f2b]/10 text-[#7a1f2b] px-2 py-0.5 rounded-full text-xs font-semibold">{entry.csr_name}</span>
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-800">{entry.parent_name || '—'}</td>
                        <td className="px-4 py-3 text-slate-600">{entry.f_code || '—'}</td>
                        <td className="px-4 py-3">
                          <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-xs font-semibold">{entry.currency}</span>
                        </td>
                        <td className="px-4 py-3 text-slate-600 text-xs max-w-[120px] truncate">
                          {Array.isArray(entry.selected_months) ? entry.selected_months.join(', ') : '—'}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-xs font-bold">{entry.student_count}</span>
                        </td>
                        <td className="px-4 py-3 text-slate-700">{formatAmount(entry.total_amount, entry.currency)}</td>
                        <td className="px-4 py-3 text-green-700">
                          -{formatAmount((entry.program_discount_amount || 0) + (entry.custom_discount_amount || 0), entry.currency)}
                        </td>
                        <td className="px-4 py-3 font-bold text-[#7a1f2b]">{formatAmount(entry.final_amount, entry.currency)}</td>
                        <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{formatDate(entry.due_date)}</td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => setExpandedRow(expandedRow === entry.id ? null : entry.id)}
                            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium"
                          >
                            {expandedRow === entry.id
                              ? <><ChevronUp className="w-3.5 h-3.5" /> Hide</>
                              : <><ChevronDown className="w-3.5 h-3.5" /> View</>}
                          </button>
                        </td>
                      </tr>

                      {expandedRow === entry.id && (
                        <tr>
                          <td colSpan={12} className="bg-red-50/30 px-6 py-4 border-b border-red-100">
                            <div className="space-y-3">
                              <div className="flex items-center gap-4 text-xs text-slate-500">
                                <span>Exchange Rate: <strong className="text-slate-700">{entry.exchange_rate}</strong></span>
                                <span>Month Count: <strong className="text-slate-700">{entry.month_count}</strong></span>
                              </div>
                              <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">Student Details</p>
                              {Array.isArray(entry.students) && entry.students.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                  {entry.students.map((s: any, i: number) => (
                                    <div key={i} className="bg-white rounded-xl border border-slate-200 p-3 text-xs">
                                      <p className="font-bold text-slate-800">{s.name || `Student ${i + 1}`}</p>
                                      <p className="text-slate-500 mt-0.5">{s.program} — {s.grade}</p>
                                      {s.fee && <p className="text-[#7a1f2b] font-semibold mt-1">{entry.currency} {s.fee}</p>}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-slate-400 text-xs">No student details available.</p>
                              )}
                              {Array.isArray(entry.registration_entries) && entry.registration_entries.length > 0 && (
                                <div>
                                  <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Registration Fees</p>
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                    {entry.registration_entries.map((r: any, i: number) => (
                                      <div key={i} className="bg-white rounded-xl border border-slate-200 p-3 text-xs">
                                        <p className="font-bold text-slate-800">{r.studentName || `Student ${i + 1}`}</p>
                                        <p className="text-[#7a1f2b] font-semibold">{entry.currency} {r.amount}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              <div className="flex items-center gap-3 pt-1">
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${entry.google_sheet_sent ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                  {entry.google_sheet_sent ? '✓ Synced to Sheet' : '⚠ Not synced'}
                                </span>
                                <span className="text-xs text-slate-400">Full ID: {entry.id}</span>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-slate-400 pb-4">
          Showing {filtered.length} of {entries.length} total admissions across all CSRs
        </p>
      </div>
    </div>
  );
}
