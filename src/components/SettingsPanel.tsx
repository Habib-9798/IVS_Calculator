import React, { useState } from 'react';
import { AppSettings, Program, GradeFee, CSRUser } from '../types';
import {
  Building2, Phone, Mail, Globe, BookOpen, Plus, Trash2,
  Lock, Unlock, ShieldAlert, Database, CloudLightning,
  ShieldCheck, Save, Users, Eye, EyeOff, Pencil, Check, X
} from 'lucide-react';

interface Props {
  settings: AppSettings;
  setSettings: (settings: AppSettings) => void;
}

export default function SettingsPanel({ settings, setSettings }: Props) {

  const [isAuthorized, setIsAuthorized] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [error, setError] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // CSR Management state
  const [newCsrName, setNewCsrName] = useState('');
  const [newCsrPassword, setNewCsrPassword] = useState('');
  const [showNewCsrPassword, setShowNewCsrPassword] = useState(false);
  const [csrAddError, setCsrAddError] = useState('');
  const [editingCsrId, setEditingCsrId] = useState<string | null>(null);
  const [editCsrPassword, setEditCsrPassword] = useState('');
  const [showEditPassword, setShowEditPassword] = useState(false);

  const handleChange = (field: keyof AppSettings, value: any) => {
    setSettings({ ...settings, [field]: value });
  };

  const addProgram = () => {
    const newProgram: Program = {
      id: `prog-${Date.now()}`,
      name: 'New Program',
      pricingType: 'class',
      grades: []
    };
    handleChange('programs', [...(settings.programs || []), newProgram]);
  };

  const removeProgram = (programId: string) => {
    handleChange('programs', settings.programs.filter(p => p.id !== programId));
  };

  const updateProgram = (programId: string, field: keyof Program, value: any) => {
    handleChange('programs', settings.programs.map(p =>
      p.id === programId ? { ...p, [field]: value } : p
    ));
  };

  const addGrade = (programId: string) => {
    handleChange('programs', settings.programs.map(p => {
      if (p.id === programId) {
        return {
          ...p,
          grades: [...p.grades, {
            id: `grade-${Date.now()}`,
            name: 'New Entry',
            fee: 0, discountedFee: 0, registrationFee: 0, registrationDiscountedFee: 0
          }]
        };
      }
      return p;
    }));
  };

  const removeGrade = (programId: string, gradeId: string) => {
    handleChange('programs', settings.programs.map(p => {
      if (p.id === programId) return { ...p, grades: p.grades.filter(g => g.id !== gradeId) };
      return p;
    }));
  };

  const updateGrade = (programId: string, gradeId: string, field: keyof GradeFee, value: string | number) => {
    handleChange('programs', settings.programs.map(p => {
      if (p.id === programId) {
        return { ...p, grades: p.grades.map(g => g.id === gradeId ? { ...g, [field]: value } : g) };
      }
      return p;
    }));
  };

  // CSR functions
  const handleAddCsr = () => {
    setCsrAddError('');
    const name = newCsrName.trim().toLowerCase();
    const password = newCsrPassword.trim();
    if (!name) { setCsrAddError('CSR name is required.'); return; }
    if (!name.endsWith('.csr')) { setCsrAddError('Name must end with .csr (e.g. bilal.csr)'); return; }
    if (password.length < 4) { setCsrAddError('Password must be at least 4 characters.'); return; }
    const existing = (settings.csrUsers || []).some(u => u.name.toLowerCase() === name);
    if (existing) { setCsrAddError('A CSR with this name already exists.'); return; }
    const newUser: CSRUser = {
      id: `csr-${Date.now()}`,
      name,
      password,
      createdAt: new Date().toISOString(),
    };
    handleChange('csrUsers', [...(settings.csrUsers || []), newUser]);
    setNewCsrName('');
    setNewCsrPassword('');
  };

  const handleDeleteCsr = (id: string) => {
    if (!window.confirm('Remove this CSR? They will lose access to the calculator.')) return;
    handleChange('csrUsers', (settings.csrUsers || []).filter(u => u.id !== id));
  };

  const handleStartEditCsr = (csr: CSRUser) => {
    setEditingCsrId(csr.id);
    setEditCsrPassword(csr.password);
    setShowEditPassword(false);
  };

  const handleSaveEditCsr = (id: string) => {
    if (editCsrPassword.trim().length < 4) { alert('Password must be at least 4 characters.'); return; }
    handleChange('csrUsers', (settings.csrUsers || []).map(u =>
      u.id === id ? { ...u, password: editCsrPassword.trim() } : u
    ));
    setEditingCsrId(null);
    setEditCsrPassword('');
  };

  const handleAuthorize = (e: React.FormEvent) => {
    e.preventDefault();
    const correctPassword = import.meta.env.VITE_SETTINGS_PASSWORD || 'admin123';
    if (passwordInput === correctPassword) {
      setIsAuthorized(true);
      setError('');
    } else {
      setError('Incorrect password. Please try again.');
      setPasswordInput('');
    }
  };

  const handleLock = () => { setIsAuthorized(false); setPasswordInput(''); };

  const handleResetSettings = () => {
    if (window.confirm('This will discard your current unsaved browser changes and reload all values directly from the Website Source Code. Continue?')) {
      sessionStorage.removeItem('iqra_current_settings');
      window.location.reload();
    }
  };

  const handleSyncToCode = async () => {
    setIsSyncing(true);
    setSyncStatus('idle');
    try {
      const response = await fetch('/api/sync-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      if (!response.ok) throw new Error('Failed to sync');
      setSyncStatus('success');
      setTimeout(() => setSyncStatus('idle'), 3000);
    } catch (err) {
      console.error(err);
      setSyncStatus('error');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(settings, null, 2));
    const a = document.createElement('a');
    a.setAttribute("href", dataStr);
    a.setAttribute("download", `IQRA_Settings_Backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const imported = JSON.parse(event.target?.result as string);
          setSettings(imported);
          alert('Settings imported successfully!');
        } catch {
          alert('Error importing JSON. Please check file format.');
        }
      };
      reader.readAsText(file);
    }
  };

  // Settings locked screen
  if (!isAuthorized) {
    return (
      <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-2xl shadow-xl border border-slate-200">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
            <Lock className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Settings Locked</h2>
          <p className="text-slate-500 text-sm">Please enter the administrative password to modify school settings.</p>
          <form onSubmit={handleAuthorize} className="w-full space-y-4 pt-4">
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="Enter password"
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all ${error ? 'border-red-300 bg-red-50' : 'border-slate-300'}`}
              autoFocus
            />
            {error && (
              <div className="flex items-center gap-1.5 text-red-600 text-xs mt-2 px-1">
                <ShieldAlert className="w-3.5 h-3.5" />
                {error}
              </div>
            )}
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2">
              <Unlock className="w-4 h-4" />
              Access Settings
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 pb-20">

      {/* Toolbar */}
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 text-blue-600 font-semibold">
            <Unlock className="w-4 h-4" />
            Live Settings Editor
          </div>
          <p className="text-[10px] text-slate-500">Changes are saved into your current session automatically.</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-blue-600 cursor-pointer transition-colors bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
            <Globe className="w-3.5 h-3.5" />
            Import Backup
            <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
          </label>
          <button onClick={handleExportJSON} className="flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-blue-600 transition-colors bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
            <Mail className="w-3.5 h-3.5" />
            Download Backup
          </button>
          <button onClick={handleResetSettings} className="flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-orange-600 transition-colors bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-sm">
            <CloudLightning className="w-3.5 h-3.5" />
            Restore from Code
          </button>
          <button onClick={handleLock} className="flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-red-600 transition-colors bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-sm">
            <Lock className="w-3.5 h-3.5" />
            Lock
          </button>
        </div>
      </div>

      {/* School Information */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
        <h2 className="text-xl font-semibold flex items-center gap-2 text-slate-800">
          <Building2 className="w-6 h-6 text-blue-600" />
          School Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">School Name</label>
            <input type="text" value={settings.schoolName} onChange={(e) => handleChange('schoolName', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Subtitle 1</label>
            <input type="text" value={settings.subtitle1} onChange={(e) => handleChange('subtitle1', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Subtitle 2</label>
            <input type="text" value={settings.subtitle2} onChange={(e) => handleChange('subtitle2', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Subtitle 3</label>
            <input type="text" value={settings.subtitle3} onChange={(e) => handleChange('subtitle3', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
        </div>
      </div>

      {/* ── CSR MANAGEMENT ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
        <h2 className="text-xl font-semibold flex items-center gap-2 text-slate-800">
          <Users className="w-6 h-6 text-blue-600" />
          CSR Management
        </h2>
        <p className="text-sm text-slate-500 -mt-2">
          Add CSR accounts here. Each CSR uses their own URL (e.g. <code className="bg-slate-100 px-1 rounded">/bilal.csr</code>) and their own password to view their dashboard.
        </p>

        {/* Add new CSR */}
        <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-3">
          <p className="text-sm font-semibold text-slate-700">Add New CSR</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">CSR Name</label>
              <input
                type="text"
                value={newCsrName}
                onChange={(e) => setNewCsrName(e.target.value)}
                placeholder="bilal.csr"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showNewCsrPassword ? 'text' : 'password'}
                  value={newCsrPassword}
                  onChange={(e) => setNewCsrPassword(e.target.value)}
                  placeholder="Min 4 characters"
                  className="w-full px-3 py-2 pr-9 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <button type="button" onClick={() => setShowNewCsrPassword(!showNewCsrPassword)} className="absolute right-2 top-2.5 text-slate-400 hover:text-slate-600">
                  {showNewCsrPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="flex items-end">
              <button onClick={handleAddCsr} className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition">
                <Plus className="w-4 h-4" />
                Add CSR
              </button>
            </div>
          </div>
          {csrAddError && (
            <p className="text-xs text-red-600 flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" />
              {csrAddError}
            </p>
          )}
        </div>

        {/* CSR List */}
        {(settings.csrUsers || []).length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm">No CSRs added yet. Add your first CSR above.</div>
        ) : (
          <div className="space-y-2">
            <div className="grid grid-cols-12 gap-2 text-xs font-medium text-slate-500 px-2">
              <div className="col-span-4">CSR Name / URL</div>
              <div className="col-span-5">Password</div>
              <div className="col-span-2">Added</div>
              <div className="col-span-1"></div>
            </div>
            {(settings.csrUsers || []).map((csr) => (
              <div key={csr.id} className="grid grid-cols-12 gap-2 items-center bg-slate-50 rounded-xl px-3 py-2.5 border border-slate-200">
                <div className="col-span-4">
                  <span className="text-sm font-semibold text-slate-800">/{csr.name}</span>
                </div>
                <div className="col-span-5">
                  {editingCsrId === csr.id ? (
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <input
                          type={showEditPassword ? 'text' : 'password'}
                          value={editCsrPassword}
                          onChange={(e) => setEditCsrPassword(e.target.value)}
                          className="w-full px-2 py-1.5 pr-8 border border-blue-400 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        <button type="button" onClick={() => setShowEditPassword(!showEditPassword)} className="absolute right-2 top-2 text-slate-400">
                          {showEditPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      <button onClick={() => handleSaveEditCsr(csr.id)} className="p-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600">
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setEditingCsrId(null)} className="p-1.5 bg-slate-200 text-slate-600 rounded-lg hover:bg-slate-300">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <span className="text-sm text-slate-500 font-mono tracking-widest">••••••••</span>
                  )}
                </div>
                <div className="col-span-2">
                  <span className="text-xs text-slate-400">{new Date(csr.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="col-span-1 flex items-center gap-1 justify-end">
                  <button onClick={() => handleStartEditCsr(csr)} className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDeleteCsr(csr.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Programs & Fees */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold flex items-center gap-2 text-slate-800">
            <BookOpen className="w-6 h-6 text-blue-600" />
            Programs & Fees
          </h2>
          <button onClick={addProgram} className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">
            <Plus className="w-4 h-4" />
            Add Program
          </button>
        </div>
        <div className="space-y-6">
          {(settings.programs || []).map((program) => (
            <div key={program?.id} className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-slate-50 p-4 border-b border-slate-200 flex flex-wrap md:flex-nowrap justify-between items-center gap-4">
                <input
                  type="text"
                  value={program?.name || ''}
                  onChange={(e) => updateProgram(program.id, 'name', e.target.value)}
                  className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-slate-800 min-w-[200px]"
                />
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500 whitespace-nowrap">Pricing Model:</span>
                  <select value={program.pricingType || 'class'} onChange={(e) => updateProgram(program.id, 'pricingType', e.target.value)} className="px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white">
                    <option value="class">By Class / Grade</option>
                    <option value="subject">By Subject</option>
                    <option value="days">By Days</option>
                  </select>
                  <button onClick={handleSyncToCode} disabled={isSyncing} className={`flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-lg transition-all shadow-sm ${syncStatus === 'success' ? 'bg-green-500 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'} disabled:opacity-50`}>
                    <Save className="w-3.5 h-3.5" />
                    {syncStatus === 'success' ? 'Saved ✓' : 'Save Globally'}
                  </button>
                  <button onClick={() => removeProgram(program.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-1">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="p-4 space-y-3">
                {(program?.grades?.length || 0) > 0 && (
                  <div className="grid grid-cols-12 gap-2 text-xs font-medium text-slate-500 px-1">
                    <div className="col-span-4">Level / Grade List</div>
                    <div className="col-span-2">Regular Fee</div>
                    <div className="col-span-2">Discounted Fee</div>
                    <div className="col-span-2">Reg. Fee</div>
                    <div className="col-span-1">Reg. Discounted</div>
                    <div className="col-span-1"></div>
                  </div>
                )}
                {(program?.grades || []).map((grade) => (
                  <div key={grade?.id} className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-4"><input type="text" value={grade?.name || ''} onChange={(e) => updateGrade(program.id, grade.id, 'name', e.target.value)} className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none" /></div>
                    <div className="col-span-2"><input type="number" min="0" value={grade?.fee || 0} onChange={(e) => updateGrade(program.id, grade.id, 'fee', Number(e.target.value))} className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none" /></div>
                    <div className="col-span-2"><input type="number" min="0" value={grade?.discountedFee || 0} onChange={(e) => updateGrade(program.id, grade.id, 'discountedFee', Number(e.target.value))} className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none" /></div>
                    <div className="col-span-2"><input type="number" min="0" value={grade?.registrationFee || 0} onChange={(e) => updateGrade(program.id, grade.id, 'registrationFee', Number(e.target.value))} className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none" /></div>
                    <div className="col-span-1"><input type="number" min="0" value={grade?.registrationDiscountedFee || 0} onChange={(e) => updateGrade(program.id, grade.id, 'registrationDiscountedFee', Number(e.target.value))} className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none" /></div>
                    <div className="col-span-1 flex justify-center">
                      <button onClick={() => removeGrade(program.id, grade.id)} className="p-1 text-slate-400 hover:text-red-500 rounded transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}
                <button onClick={() => addGrade(program.id)} className="mt-2 flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
                  <Plus className="w-4 h-4" />
                  Add Grade
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
        <h2 className="text-xl font-semibold flex items-center gap-2 text-slate-800">
          <Phone className="w-6 h-6 text-blue-600" />
          Contact Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
            <input type="text" value={settings.phone} onChange={(e) => handleChange('phone', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input type="text" value={settings.email} onChange={(e) => handleChange('email', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Website</label>
            <input type="text" value={settings.website} onChange={(e) => handleChange('website', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
        </div>
      </div>

      {/* Global Sync */}
      <div className="bg-blue-900 rounded-3xl p-10 text-white shadow-2xl relative overflow-hidden border border-blue-400/30">
        <div className="relative z-10 space-y-8">
          <div className="flex items-start gap-6">
            <div className={`p-4 rounded-2xl ${syncStatus === 'success' ? 'bg-green-500/20 border border-green-400/30' : 'bg-white/10 border border-white/20'}`}>
              <Database className={`w-8 h-8 ${syncStatus === 'success' ? 'text-green-400' : 'text-blue-200'}`} />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-black tracking-tight">Sync to Global Website</h3>
              <p className="text-blue-100/80 mt-2 text-lg leading-relaxed max-w-2xl">
                To see these changes on every device, embed them into the global source code and publish to GitHub.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-center">
            <div className="lg:col-span-3">
              <button
                onClick={handleSyncToCode}
                disabled={isSyncing}
                className={`w-full font-black py-6 rounded-2xl transition-all shadow-xl flex items-center justify-center gap-4 text-xl ${syncStatus === 'success' ? 'bg-green-500 text-white' : syncStatus === 'error' ? 'bg-red-500 text-white' : 'bg-white text-blue-900'} disabled:opacity-50`}
              >
                {isSyncing ? <div className="w-8 h-8 border-4 border-blue-900/20 border-t-blue-900 rounded-full animate-spin"></div>
                  : syncStatus === 'success' ? <><Unlock className="w-6 h-6" /> Updated Successfully ✓</>
                  : <><CloudLightning className="w-6 h-6" /> Save & Sync Globally</>}
              </button>
            </div>
            <div className="lg:col-span-2 bg-blue-800/40 border border-blue-400/30 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-blue-200 font-bold text-sm">
                <ShieldCheck className="w-4 h-4" />
                DASHBOARD DEPLOYMENT STEPS:
              </div>
              <ol className="text-xs text-blue-100/70 space-y-2 font-mono">
                <li className="flex gap-2"><span className="text-blue-400 font-bold">1.</span> Click "Save & Sync" above</li>
                <li className="flex gap-2"><span className="text-blue-400 font-bold">2.</span> In your terminal: <code className="bg-blue-900/50 px-1 rounded text-blue-200">git push</code></li>
                <li className="flex gap-2"><span className="text-blue-400 font-bold">3.</span> Run: <code className="bg-blue-900/50 px-1 rounded text-blue-200">npm run deploy</code></li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
