/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from "react";
import FeeCalculator from "./components/FeeCalculator";
import SettingsPanel from "./components/SettingsPanel";
import { AppSettings, DEFAULT_SETTINGS } from "./types";
import {
  Calculator,
  Coins,
  GraduationCap,
  Settings,
  ShieldAlert,
  Lock,
  LogOut,
} from "lucide-react";

export default function App() {
  const APP_PASSWORD = "IqraOffice2026!";

  const [enteredPassword, setEnteredPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem("iqra_auth") === "true";
  });
  const [loginError, setLoginError] = useState("");

  const [activeTab, setActiveTab] = useState<"calculator" | "settings">("calculator");

  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = sessionStorage.getItem("iqra_current_settings");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEFAULT_SETTINGS;
      }
    }
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
          setSettings((prev) => ({
            ...prev,
            exchangeRates: {
              ...data.rates,
              ...prev.exchangeRates,
            },
          }));
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
        setSettings((prev) => ({
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
      setSettings((prev) => ({
        ...prev,
        exchangeRates: {
          ...prev.exchangeRates,
          [prev.selectedCurrency]: num,
        },
      }));
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (enteredPassword === APP_PASSWORD) {
      sessionStorage.setItem("iqra_auth", "true");
      setIsAuthenticated(true);
      setLoginError("");
      setEnteredPassword("");
    } else {
      setLoginError("Incorrect password. Please try again.");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("iqra_auth");
    setIsAuthenticated(false);
    setEnteredPassword("");
    setLoginError("");
  };

  const [hasError, setHasError] = useState(false);
  useEffect(() => {
    const handleError = () => setHasError(true);
    window.addEventListener("error", handleError);
    return () => window.removeEventListener("error", handleError);
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
          <div className="flex justify-center mb-5">
            <div className="w-14 h-14 rounded-full bg-[#7a1f2b]/10 flex items-center justify-center">
              <Lock className="w-7 h-7 text-[#7a1f2b]" />
            </div>
          </div>

          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-slate-800">Restricted Access</h1>
            <p className="text-slate-500 mt-2">
              Enter the organization password to open the calculator.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                value={enteredPassword}
                onChange={(e) => setEnteredPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#7a1f2b]"
              />
            </div>

            {loginError && <p className="text-sm text-red-600">{loginError}</p>}

            <button
              type="submit"
              className="w-full bg-[#7a1f2b] hover:bg-[#651923] text-white font-semibold py-3 rounded-xl transition-all"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-red-100 p-8 text-center space-y-6">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8 text-red-600" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-800">Something went wrong</h2>
            <p className="text-slate-500">
              The application encountered an unexpected error. This often happens due to temporary network issues or corrupted settings.
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-blue-200"
          >
            Reload Application
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="w-full px-6">
          <div className="h-16 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-[320px]">
              {settings.logoBase64 ? (
                <img
                  src={settings.logoBase64}
                  alt="Logo"
                  className="w-10 h-10 rounded-xl object-contain bg-white border border-slate-200 shadow-sm"
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-[#7a1f2b] flex items-center justify-center shadow-sm">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
              )}

              <div className="leading-tight">
                <div className="font-extrabold text-slate-900 text-sm">
                  {settings.schoolName || "IQRA VIRTUAL SCHOOL"}
                </div>
                <div className="text-xs text-slate-500">Fee Dashboard (Desktop)</div>
              </div>
            </div>

            <div className="flex-1"></div>

            <div className="flex items-center gap-3 min-w-[520px] justify-end">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold px-4 py-2 rounded-lg shadow-sm"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>

              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl p-1 shadow-sm">
                <button
                  onClick={() => setActiveTab("calculator")}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-semibold transition ${
                    activeTab === "calculator"
                      ? "bg-[#7a1f2b] text-white shadow-sm"
                      : "text-slate-700 hover:bg-white"
                  }`}
                >
                  <Calculator className="w-4 h-4" />
                  Calculator
                </button>

                <button
                  onClick={() => setActiveTab("settings")}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-semibold transition ${
                    activeTab === "settings"
                      ? "bg-[#7a1f2b] text-white shadow-sm"
                      : "text-slate-700 hover:bg-white"
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </button>
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
                    <option key={curr.code} value={curr.code}>
                      {curr.code} - {curr.label}
                    </option>
                  ))}
                  <option value="ADD_NEW" className="text-blue-600 font-bold border-t border-slate-200">
                    + Add another currency...
                  </option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-6 px-6 w-full">
        {activeTab === "calculator" ? (
          <FeeCalculator settings={settings} />
        ) : (
          <SettingsPanel settings={settings} setSettings={setSettings} />
        )}
      </div>
    </div>
  );
}