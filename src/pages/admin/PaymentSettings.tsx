import React, { useEffect, useState } from 'react';
import { auth } from '../../lib/firebase';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
  CreditCard,
  Key,
  Lock,
  Database,
  Calendar,
  Save,
  ShieldCheck,
  Info,
  HelpCircle,
  KeyRound,
  ExternalLink
} from 'lucide-react';

interface PaymentSettingsState {
  hasDatabaseConfig: boolean;
  hasWebhookSecret: boolean;
  keyId: string;
  keyIdMasked: string;
  webhookSecretMasked: string;
  source: 'database' | 'environment' | 'missing';
  updatedAt: string | null;
  updatedBy: string | null;
}

export default function PaymentSettings() {
  const [settings, setSettings] = useState<PaymentSettingsState | null>(null);
  const [keyId, setKeyId] = useState('');
  const [keySecret, setKeySecret] = useState('');
  const [webhookSecret, setWebhookSecret] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const getAuthHeader = async () => {
    const token = await auth.currentUser?.getIdToken();
    if (!token) throw new Error('Admin session expired. Please login again.');
    return { Authorization: `Bearer ${token}` };
  };

  const readJsonResponse = async (response: Response) => {
    const text = await response.text();
    try {
      return text ? JSON.parse(text) : {};
    } catch {
      throw new Error('INVALID_JSON_RESPONSE');
    }
  };

  const requestPaymentSettings = async (init: RequestInit) => {
    const endpoints = [
      '/api/admin/payment-settings',
      '/.netlify/functions/admin-payment-settings',
    ];
    let lastError: unknown = null;

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint, init);
        const data = await readJsonResponse(response);
        return { response, data };
      } catch (error) {
        lastError = error;
      }
    }

    if (lastError instanceof Error && lastError.message === 'INVALID_JSON_RESPONSE') {
      throw new Error('Payment settings API returned an invalid response. Redeploy the latest Netlify functions.');
    }

    throw lastError instanceof Error ? lastError : new Error('Unable to reach payment settings API');
  };

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const headers = await getAuthHeader();
      const { response, data } = await requestPaymentSettings({ headers });

      if (!response.ok) {
        throw new Error(data?.details || data?.error || 'Unable to load payment settings');
      }

      setSettings(data);
      setKeyId(data.keyId || '');
    } catch (error) {
      console.error('Payment settings load error:', error);
      setMessage(error instanceof Error ? error.message : 'Unable to load payment settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const authHeader = await getAuthHeader();
      const { response, data } = await requestPaymentSettings({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader,
        },
        body: JSON.stringify({ keyId, keySecret, webhookSecret }),
      });

      if (!response.ok) {
        throw new Error(data?.details || data?.error || 'Unable to save payment settings');
      }

      setKeySecret('');
      setWebhookSecret('');
      setMessage('Razorpay keys updated successfully.');
      await fetchSettings();
    } catch (error) {
      console.error('Payment settings save error:', error);
      setMessage(error instanceof Error ? error.message : 'Unable to save payment settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-slate-500 font-bold text-xs uppercase tracking-widest">Loading payment settings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 select-none animate-fade-in">
      
      {/* 1. TOP HERO BANNER CARD */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-blue-600">
            <CreditCard size={15} />
            <span>PAYMENT GATEWAY</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Razorpay Settings
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-slate-500 max-w-2xl leading-relaxed">
            Add or update the active Razorpay key pair used by checkout, server verification, and webhook reconciliation.
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 px-4 py-2.5 text-emerald-700 flex items-center gap-2 shrink-0 self-start sm:self-center shadow-2xs">
          <ShieldCheck size={18} className="text-emerald-600" />
          <span className="text-[10px] font-black uppercase tracking-widest">SERVER VERIFIED</span>
        </div>
      </div>

      {/* 2. FORM INPUTS & SETTINGS CONTAINER */}
      <form onSubmit={handleSave} className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        
        {/* Form Inputs Grid */}
        <div className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Razorpay Key ID */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <Label className="text-xs font-black uppercase tracking-wider text-slate-700">RAZORPAY KEY ID</Label>
                <HelpCircle size={14} className="text-slate-400" />
              </div>
              <Input
                value={keyId}
                onChange={(event) => setKeyId(event.target.value)}
                placeholder="rzp_live_xxxxx"
                className="h-12 px-4 rounded-2xl bg-white border border-slate-200 text-xs font-semibold text-slate-800 placeholder:text-slate-400 outline-none focus:border-blue-500 shadow-2xs transition"
              />
            </div>

            {/* Razorpay Key Secret */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <Label className="text-xs font-black uppercase tracking-wider text-slate-700">RAZORPAY KEY SECRET</Label>
                <HelpCircle size={14} className="text-slate-400" />
              </div>
              <Input
                type="password"
                value={keySecret}
                onChange={(event) => setKeySecret(event.target.value)}
                placeholder="Enter new secret to update"
                className="h-12 px-4 rounded-2xl bg-white border border-slate-200 text-xs font-semibold text-slate-800 placeholder:text-slate-400 outline-none focus:border-blue-500 shadow-2xs transition"
              />
            </div>
          </div>

          {/* Razorpay Webhook Secret */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <Label className="text-xs font-black uppercase tracking-wider text-slate-700">RAZORPAY WEBHOOK SECRET</Label>
              <HelpCircle size={14} className="text-slate-400" />
            </div>
            <Input
              type="password"
              value={webhookSecret}
              onChange={(event) => setWebhookSecret(event.target.value)}
              placeholder="Enter webhook secret from Razorpay"
              className="h-12 px-4 rounded-2xl bg-white border border-slate-200 text-xs font-semibold text-slate-800 placeholder:text-slate-400 outline-none focus:border-blue-500 shadow-2xs transition"
            />
            <p className="text-xs font-semibold text-slate-500 pt-1">
              Use this endpoint in Razorpay webhooks: {' '}
              <a
                href="https://internmitra.org/api/payment/webhook"
                target="_blank"
                rel="noreferrer"
                className="font-bold text-blue-600 hover:underline inline-flex items-center gap-1"
              >
                https://internmitra.org/api/payment/webhook
              </a>
            </p>
          </div>
        </div>

        {/* 3. STATUS KPI CARDS (4 Column Grid) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          
          {/* Card 1: Current Key */}
          <div className="bg-slate-50/80 border border-slate-200/70 rounded-2xl p-4 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
              <Key size={18} />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">CURRENT KEY</span>
              <h4 className="text-xs font-black text-slate-900 truncate mt-0.5">
                {settings?.keyIdMasked || 'Not configured'}
              </h4>
            </div>
          </div>

          {/* Card 2: Webhook Secret */}
          <div className="bg-slate-50/80 border border-slate-200/70 rounded-2xl p-4 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
              <Lock size={18} />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">WEBHOOK SECRET</span>
              <h4 className="text-xs font-black text-slate-900 truncate mt-0.5">
                {settings?.webhookSecretMasked || 'Not configured'}
              </h4>
            </div>
          </div>

          {/* Card 3: Source */}
          <div className="bg-slate-50/80 border border-slate-200/70 rounded-2xl p-4 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center shrink-0">
              <Database size={18} />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">SOURCE</span>
              <h4 className="text-xs font-black text-slate-900 truncate capitalize mt-0.5">
                {settings?.source || 'Missing'}
              </h4>
            </div>
          </div>

          {/* Card 4: Updated */}
          <div className="bg-slate-50/80 border border-slate-200/70 rounded-2xl p-4 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0">
              <Calendar size={18} />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">UPDATED</span>
              <h4 className="text-xs font-black text-slate-900 truncate mt-0.5">
                {settings?.updatedAt ? new Date(settings.updatedAt).toLocaleDateString('en-IN') : 'Not saved in DB'}
              </h4>
            </div>
          </div>

        </div>

        {/* 4. SERVER WARNING / ALERT CALLOUT */}
        <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-4 text-xs font-semibold text-blue-900 flex items-start gap-3.5">
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 font-bold">
            <Info size={16} />
          </div>
          <div className="space-y-1 py-1">
            <p className="leading-relaxed">
              Could not load the default credentials. Browse to {' '}
              <a
                href="https://cloud.google.com/docs/authentication/getting-started"
                target="_blank"
                rel="noreferrer"
                className="font-bold text-blue-600 hover:underline inline-flex items-center gap-1"
              >
                https://cloud.google.com/docs/authentication/getting-started
                <ExternalLink size={12} />
              </a>
              {' '} for more information.
            </p>
          </div>
        </div>

        {/* Feedback Message */}
        {message && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
            <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {/* 5. SAVE BUTTON */}
        <div className="pt-2">
          <Button
            type="submit"
            disabled={saving || !keyId.trim()}
            className="h-12 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-md shadow-blue-600/20 cursor-pointer transition active:scale-95"
          >
            {saving ? (
              <KeyRound size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            <span>{saving ? 'SAVING KEYS...' : 'SAVE RAZORPAY KEYS'}</span>
          </Button>
        </div>

      </form>

    </div>
  );
}
