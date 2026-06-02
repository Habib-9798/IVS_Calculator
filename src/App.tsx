import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import FeeCalculator from "./components/FeeCalculator";
import SettingsPanel from "./components/SettingsPanel";
import { AppSettings, DEFAULT_SETTINGS } from "./types";
import { useAuth } from "./AuthContext";
import {
  Calculator, Coins, GraduationCap, Settings,
  LogOut, History,
} from "lucide-react";

export default function App() {
  const navigate = useNavigate();
  const { profile, logout } = useAuth();

  // csrName comes from the logged-in profile, not the URL
  const csrName = profile?.csr_name || 'Direct';

  const [activeTab, setActiveTab] = useState<"calculator" | "settings">("calculator");

  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = sessionStorage.getItem("iqra_current_settings");
    if (saved) { try { return JSON.parse(saved); } catch { return DEFAULT_SETTINGS; } }
    return DEFAULT_SETTINGS;
  });

  useEffect(() => {
    sessionStorage.setItem("iqra_current_settings", JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const response = await fetch("https://open.er-api.com/v6/latest/SAR");
        const data = await response.json();
        if (data?.rates) {
          setSettings(prev => ({ ...prev, exchangeRates: { ...data.rates, ...prev.exchangeRates } }));
        }
      } catch (error) {
        console.error("Failed to fetch exchange rates:", error);
      }
    };
    fetchRates();
  }, []);

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === "ADD_NEW") {
      const code = prompt("Enter 3-letter Currency Code (e.g., AUD):")?.toUpperCase();
      const label = prompt("Enter Currency Label (e.g., Australian Dollar):");
      if (code && label) {
        setSettings(prev => ({
          ...prev,
          availableCurrencies: [...(prev.availableCurrencies || []), { code, label }],
          exchangeRates: { ...prev.exchangeRates, [code]: prev.exchangeRates[code] || 1 },
          selectedCurrency: code,
        }));
      }
    } else {
      setSettings({ ...settings, selectedCurrency: val });
    }
  };

  const handleRateChange = (val: string) => {
    const num = parseFloat(val);
    if (!isNaN(num)) {
      setSettings(prev => ({ ...prev, exchangeRates: { ...prev.exchangeRates, [prev.selectedCurrency]: num } }));
    }
  };

  const handleLogout = async () => {
    await logout();
    // AuthContext will clear session → main.tsx redirects to login automatically
  };

  const handleHistoryClick = () => {
    // Admin goes to /dashboard, CSR goes to /my-history
    if (profile?.role === 'admin') {
      navigate('/dashboard');
    } else {
      navigate('/my-history');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="w-full px-6">
          <div className="h-16 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-[320px]">
              {settings.logoBase64 ? (
                <img src={settings.logoBase64} alt="Logo" className="w-10 h-10 rounded-xl object-contain bg-white border border-slate-200 shadow-sm" />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-[#7a1f2b] flex items-center justify-center shadow-sm">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
              )}
              <div className="leading-tight">
                <div className="font-extrabold text-slate-900 text-sm">{settings.schoolName || "IQRA VIRTUAL SCHOOL"}</div>
                <div className="text-xs text-slate-500">
                  {profile?.role === 'admin' ? 'Admin' : csrName} — Fee Dashboard
                </div>
              </div>
            </div>

            <div className="flex-1"></div>

            <div className="flex items-center gap-3 justify-end">
              {/* Logged-in user badge */}
              <div className="hidden md:flex items-center gap-1.5 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-full">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-xs font-semibold text-slate-600">
                  {profile?.role === 'admin' ? 'Admin' : csrName}
                </span>
              </div>

              <button onClick={handleLogout} className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold px-4 py-2 rounded-lg shadow-sm transition">
                <LogOut className="w-4 h-4" />
                Logout
              </button>

              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl p-1 shadow-sm">
                <button
                  onClick={() => setActiveTab("calculator")}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-semibold transition ${activeTab === "calculator" ? "bg-[#7a1f2b] text-white shadow-sm" : "text-slate-700 hover:bg-white"}`}
                >
                  <Calculator className="w-4 h-4" />
                  Calculator
                </button>

                <button
                  onClick={handleHistoryClick}
                  className="px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-semibold transition text-slate-700 hover:bg-white"
                >
                  <History className="w-4 h-4" />
                  History
                </button>

                {/* Settings only for admin */}
                {profile?.role === 'admin' && (
                  <button
                    onClick={() => setActiveTab("settings")}
                    className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-semibold transition ${activeTab === "settings" ? "bg-[#7a1f2b] text-white shadow-sm" : "text-slate-700 hover:bg-white"}`}
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </button>
                )}
              </div>

              {settings.selectedCurrency !== "SAR" && (
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 shadow-sm">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">1 SAR =</span>
                  <input
                    type="number"
                    value={settings.exchangeRates[settings.selectedCurrency] || ""}
                    onChange={(e) => handleRateChange(e.target.value)}
                    className="w-20 bg-transparent text-sm font-bold text-blue-600 outline-none"
                    step="0.0001"
                  />
                  <span className="text-xs font-bold text-slate-500">{settings.selectedCurrency}</span>
                </div>
              )}

              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 shadow-sm">
                <Coins className="w-4 h-4 text-amber-500" />
                <select
                  value={settings.selectedCurrency}
                  onChange={handleCurrencyChange}
                  className="bg-transparent text-sm font-semibold text-slate-700 outline-none cursor-pointer"
                >
                  {(settings.availableCurrencies || []).map((curr) => (
                    <option key={curr.code} value={curr.code}>{curr.code} - {curr.label}</option>
                  ))}
                  <option value="ADD_NEW" className="text-blue-600 font-bold">+ Add another currency...</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-6 px-6 w-full">
        {activeTab === "calculator" ? (
          <FeeCalculator settings={settings} csrName={csrName} />
        ) : (
          <SettingsPanel settings={settings} setSettings={setSettings} />
        )}
      </div>
    </div>
  );
}
