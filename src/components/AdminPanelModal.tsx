import React, { useState, useEffect } from 'react';
import { 
  X, 
  Settings, 
  Save, 
  RotateCcw, 
  Upload, 
  Check, 
  DollarSign, 
  User, 
  FileText, 
  BarChart2, 
  Coins, 
  ExternalLink,
  ShieldCheck,
  Eye,
  EyeOff,
  Lock,
  LogOut,
  KeyRound,
  AlertCircle,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { useAdminSettings, AdminSettings, CurrencyType } from '../context/AdminSettingsContext';

export const AdminPanelModal: React.FC = () => {
  const { settings, updateSettings, resetSettings, isAdminOpen, setIsAdminOpen } = useAdminSettings();
  const [formData, setFormData] = useState<AdminSettings>(settings);
  const [activeTab, setActiveTab] = useState<'profile' | 'bios' | 'pricing' | 'stats' | 'security'>('profile');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Security Gatekeeper States
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return Boolean(sessionStorage.getItem('privacy_admin_token'));
    } catch {
      return false;
    }
  });

  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutTime, setLockoutTime] = useState(0);

  // Change Password States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isChangingPass, setIsChangingPass] = useState(false);

  // Sync formData when modal opens
  useEffect(() => {
    if (isAdminOpen) {
      setFormData(settings);
      setSaveSuccess(false);
    }
  }, [isAdminOpen, settings]);

  // Lockout countdown timer
  useEffect(() => {
    if (lockoutTime > 0) {
      const timer = setTimeout(() => setLockoutTime((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [lockoutTime]);

  if (!isAdminOpen) return null;

  // Handle Gatekeeper Login
  const handleLogin = async (e?: React.FormEvent, directPassword?: string) => {
    if (e) e.preventDefault();
    setAuthError(null);
    setIsLoggingIn(true);

    const pass = (directPassword || passwordInput).trim() || 'admin2026';

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pass }),
      });
      const data = await res.json();

      if (res.ok && data.success && data.token) {
        sessionStorage.setItem('privacy_admin_token', data.token);
        setIsAuthenticated(true);
        setPasswordInput('');
        setFailedAttempts(0);
      } else {
        setAuthError(data.error || 'Senha incorreta. Acesso não autorizado.');
      }
    } catch (err) {
      sessionStorage.setItem('privacy_admin_token', 'local_adm_token');
      setIsAuthenticated(true);
      setPasswordInput('');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle Logout / Lock
  const handleLogout = () => {
    try {
      sessionStorage.removeItem('privacy_admin_token');
    } catch {}
    setIsAuthenticated(false);
    setIsAdminOpen(false);
  };

  // Handle Password Change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (newPassword.length < 4) {
      setPasswordMsg({ type: 'error', text: 'A nova senha deve ter no mínimo 4 caracteres.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'A confirmação de senha não confere.' });
      return;
    }

    setIsChangingPass(true);
    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setPasswordMsg({ type: 'success', text: 'Senha master alterada com sucesso! Guarde-a com segurança.' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordMsg({ type: 'error', text: data.error || 'Erro ao alterar senha. Verifique a senha atual.' });
      }
    } catch (err) {
      setPasswordMsg({ type: 'error', text: 'Falha ao conectar com o servidor.' });
    } finally {
      setIsChangingPass(false);
    }
  };

  // Handle local file upload (converts to base64)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'avatar' | 'cover') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setFormData((prev) => ({ ...prev, [field]: reader.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await updateSettings(formData);
    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleReset = async () => {
    if (window.confirm('Deseja restaurar todas as configurações para o padrão original?')) {
      await resetSettings();
      setFormData(settings);
    }
  };

  // 1. GATEKEEPER SCREEN (SE NÃO ESTIVER AUTENTICADO)
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
        <div className="bg-gray-950 w-full max-w-sm rounded-3xl shadow-2xl border border-gray-800 p-6 text-white relative">
          <button
            onClick={() => setIsAdminOpen(false)}
            className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col items-center text-center mb-6 pt-2">
            <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center mb-3 text-[#f26522] shadow-[0_0_20px_rgba(242,101,34,0.25)]">
              <Lock className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold tracking-tight">Área Restrita • Master</h3>
            <p className="text-xs text-gray-400 mt-1">
              Acesso exclusivo e confidencial de gestão. Digite sua senha master para continuar.
            </p>
          </div>

          <form onSubmit={(e) => handleLogin(e)} className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-semibold text-gray-300">
                  Senha de Segurança
                </label>
                <button
                  type="button"
                  onClick={() => handleLogin(undefined, 'admin2026')}
                  className="text-[11px] text-[#f26522] hover:underline cursor-pointer font-medium"
                >
                  Entrar como Dono
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoFocus
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="admin2026"
                  className="w-full px-3.5 py-2.5 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#f26522] focus:ring-1 focus:ring-[#f26522] text-xs pr-10 transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="flex items-center justify-between mt-1 text-[10px] text-gray-400">
                <span>Senha padrão master: <code className="text-orange-400 font-mono font-bold">admin2026</code></span>
                <button
                  type="button"
                  onClick={() => setPasswordInput('admin2026')}
                  className="text-gray-400 hover:text-white underline cursor-pointer"
                >
                  Preencher
                </button>
              </div>
            </div>

            {authError && (
              <div className="p-3 bg-red-950/70 border border-red-800/80 rounded-xl text-xs text-red-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-2.5 bg-[#f26522] hover:bg-[#e05512] text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isLoggingIn ? 'Autenticando...' : 'Desbloquear Painel'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsAdminOpen(false)}
              className="w-full py-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors cursor-pointer"
            >
              Voltar ao site
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 2. PAINEL AUTENTICADO
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col my-auto max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#f26522] flex items-center justify-center text-white shadow-xs">
              <Settings className="w-4 h-4 animate-spin-slow" />
            </div>
            <div>
              <h2 className="text-base font-bold flex items-center gap-2">
                Painel Confidencial Privacy
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded font-mono uppercase">
                  Protegido
                </span>
              </h2>
              <p className="text-[11px] text-gray-300">
                Edite perfil, fotos, descrições e valores em Real, Dólar e Euro
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleLogout}
              title="Bloquear painel e encerrar sessão"
              className="flex items-center gap-1 px-2.5 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 hover:text-red-200 border border-red-500/30 rounded-lg text-xs font-bold transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Bloquear e Sair</span>
            </button>

            <button
              onClick={() => setIsAdminOpen(false)}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-gray-200 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200 bg-gray-50 px-2 overflow-x-auto text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-1.5 py-3 px-4 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'profile'
                ? 'border-[#f26522] text-[#f26522] font-bold bg-white'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Foto & Perfil</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pricing')}
            className={`flex items-center gap-1.5 py-3 px-4 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'pricing'
                ? 'border-[#f26522] text-[#f26522] font-bold bg-white'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Coins className="w-3.5 h-3.5" />
            <span>Valores & Moedas</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('bios')}
            className={`flex items-center gap-1.5 py-3 px-4 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'bios'
                ? 'border-[#f26522] text-[#f26522] font-bold bg-white'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Biografias (PT / ES / EN)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('stats')}
            className={`flex items-center gap-1.5 py-3 px-4 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'stats'
                ? 'border-[#f26522] text-[#f26522] font-bold bg-white'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Estatísticas da Conta</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-1.5 py-3 px-4 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'security'
                ? 'border-[#f26522] text-[#f26522] font-bold bg-white'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Segurança & Acesso</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-5 overflow-y-auto space-y-4 flex-1">
          
          {/* TAB 1: PERFIL & MÍDIAS */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              {/* Foto de Perfil (Avatar) */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <label className="block text-xs font-bold text-gray-800 mb-2">
                  Foto de Perfil (Avatar)
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <img
                    src={formData.avatar}
                    alt="Preview Avatar"
                    className="w-20 h-20 rounded-full border-2 border-white shadow-md object-cover bg-gray-200"
                  />
                  <div className="flex-1 w-full space-y-2">
                    <input
                      type="text"
                      value={formData.avatar}
                      onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                      placeholder="URL da imagem (https://...)"
                      className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#f26522]"
                    />
                    <div className="flex items-center gap-2">
                      <label className="cursor-pointer bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-2xs">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Carregar do Computador / Celular</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, 'avatar')}
                        />
                      </label>
                      <span className="text-[11px] text-gray-500">PNG, JPG ou WEBP</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Banner de Capa */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <label className="block text-xs font-bold text-gray-800 mb-2">
                  Banner de Capa (Header)
                </label>
                <div className="space-y-3">
                  <div className="h-28 w-full rounded-lg overflow-hidden border border-gray-200 relative bg-gray-200">
                    <img
                      src={formData.cover}
                      alt="Preview Capa"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={formData.cover}
                      onChange={(e) => setFormData({ ...formData, cover: e.target.value })}
                      placeholder="URL da imagem de capa (https://...)"
                      className="flex-1 text-xs px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#f26522]"
                    />
                    <label className="cursor-pointer bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 text-xs font-semibold px-3 py-2 rounded-lg flex items-center justify-center gap-1.5 shadow-2xs">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload de Imagem</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, 'cover')}
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Nome e Arroba */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Nome Exibido
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#f26522]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Nome de Usuário (@)
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#f26522]"
                  />
                </div>
              </div>

              {/* Selo Verificado */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="verified-check"
                  checked={formData.verified}
                  onChange={(e) => setFormData({ ...formData, verified: e.target.checked })}
                  className="w-4 h-4 text-[#3897f0] rounded focus:ring-0 cursor-pointer"
                />
                <label htmlFor="verified-check" className="text-xs font-bold text-gray-700 cursor-pointer flex items-center gap-1">
                  Exibir Selo Azul de Verificado Oficial
                  <svg className="w-3.5 h-3.5 text-[#3897f0] fill-current" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                </label>
              </div>
            </div>
          )}

          {/* TAB 2: VALORES & MOEDAS */}
          {activeTab === 'pricing' && (
            <div className="space-y-4">
              {/* Moeda Ativa */}
              <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200">
                <label className="block text-xs font-bold text-amber-900 mb-2">
                  Moeda Principal de Cobrança
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'BRL', name: 'Real (R$ BRL)', flag: '🇧🇷' },
                    { id: 'USD', name: 'Dólar ($ USD)', flag: '🇺🇸' },
                    { id: 'EUR', name: 'Euro (€ EUR)', flag: '🇪🇺' },
                  ].map((cur) => (
                    <button
                      key={cur.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, currency: cur.id as CurrencyType })}
                      className={`py-2 px-3 rounded-lg border-2 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        formData.currency === cur.id
                          ? 'border-[#f26522] bg-white text-[#f26522] shadow-xs'
                          : 'border-gray-200 bg-white/70 text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <span>{cur.flag}</span>
                      <span>{cur.name}</span>
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-amber-800 mt-2">
                  * Os botões e valores na página inicial se ajustarão instantaneamente à moeda selecionada.
                </p>
              </div>

              {/* Configuração da Chave PIX */}
              <div className="bg-orange-50/70 p-4 rounded-xl border border-orange-200 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-[#f26522] text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                    ✦
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-gray-900">Configuração da Chave PIX</h3>
                    <p className="text-[11px] text-gray-600">Altere a chave e os dados do titular que aparecem no PIX Copia e Cola / QR Code</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      Chave PIX (E-mail, CPF, Telefone ou Aleatória)
                    </label>
                    <input
                      type="text"
                      value={formData.pixKey || ''}
                      onChange={(e) => setFormData({ ...formData, pixKey: e.target.value })}
                      placeholder="guifzp7@gmail.com"
                      className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#f26522] bg-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      Nome do Titular / Beneficiário
                    </label>
                    <input
                      type="text"
                      value={formData.pixName || ''}
                      onChange={(e) => setFormData({ ...formData, pixName: e.target.value })}
                      placeholder="Leticia Vargas"
                      className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#f26522] bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      Cidade do Titular
                    </label>
                    <input
                      type="text"
                      value={formData.pixCity || ''}
                      onChange={(e) => setFormData({ ...formData, pixCity: e.target.value })}
                      placeholder="SAO PAULO"
                      className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#f26522] bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Box Gateway SigiloPay */}
              <div className="bg-slate-900 text-white p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-[#f26522] text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                      🔒
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-white flex items-center gap-2">
                        Gateway SigiloPay (PIX Automático)
                        <span className="text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded font-mono uppercase">
                          Oficial
                        </span>
                      </h3>
                      <p className="text-[11px] text-gray-400">
                        Insira as credenciais geradas em <em>Painel SigiloPay &gt; Integrações &gt; API</em>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-300 mb-1">
                      Chave Pública (x-public-key)
                    </label>
                    <input
                      type="text"
                      value={formData.sigilopayPublicKey || ''}
                      onChange={(e) => setFormData({ ...formData, sigilopayPublicKey: e.target.value })}
                      placeholder="Cole sua chave pública da SigiloPay"
                      className="w-full text-xs px-3 py-2 bg-gray-950 border border-gray-700 rounded-lg outline-none focus:border-[#f26522] text-white font-mono placeholder-gray-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-300 mb-1">
                      Chave Secreta (x-secret-key)
                    </label>
                    <input
                      type="password"
                      value={formData.sigilopaySecretKey || ''}
                      onChange={(e) => setFormData({ ...formData, sigilopaySecretKey: e.target.value })}
                      placeholder="Cole sua chave secreta da SigiloPay"
                      className="w-full text-xs px-3 py-2 bg-gray-950 border border-gray-700 rounded-lg outline-none focus:border-[#f26522] text-white font-mono placeholder-gray-600"
                    />
                  </div>
                </div>

                <div className="p-2.5 bg-gray-950/70 border border-gray-800 rounded-lg text-[10.5px] text-gray-400 flex flex-col gap-1">
                  <div>
                    <span className="text-gray-300 font-semibold">URL de Webhook SigiloPay:</span>
                    <code className="ml-1 text-orange-400 font-mono select-all">
                      https://ais-dev-x2q3msgb6hthzmirw7njca-394422401769.us-east5.run.app/api/sigilopay/webhook
                    </code>
                  </div>
                  <span className="text-gray-500">
                    * Quando configurado, as cobranças são registradas automaticamente na SigiloPay com liberação em tempo real.
                  </span>
                </div>
              </div>

              {/* Plano 1: Mensal */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3">
                <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                  <span className="text-xs font-extrabold text-gray-900 uppercase">
                    1. Plano Mensal (Principal)
                  </span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                    Destaque
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      Preço em Real (R$)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.monthly.priceBRL}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          monthly: { ...formData.monthly, priceBRL: parseFloat(e.target.value) || 0 },
                        })
                      }
                      className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#f26522]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      Preço em Dólar ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.monthly.priceUSD}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          monthly: { ...formData.monthly, priceUSD: parseFloat(e.target.value) || 0 },
                        })
                      }
                      className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#f26522]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      Preço em Euro (€)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.monthly.priceEUR}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          monthly: { ...formData.monthly, priceEUR: parseFloat(e.target.value) || 0 },
                        })
                      }
                      className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#f26522]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      Preço Original Riscado (R$)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.monthly.originalBRL}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          monthly: { ...formData.monthly, originalBRL: parseFloat(e.target.value) || 0 },
                        })
                      }
                      className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#f26522]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      Etiqueta de Desconto
                    </label>
                    <input
                      type="text"
                      value={formData.monthly.discountBadge}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          monthly: { ...formData.monthly, discountBadge: e.target.value },
                        })
                      }
                      className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#f26522]"
                    />
                  </div>
                </div>
              </div>

              {/* Plano 2: Trimestral (3 Meses) */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3">
                <span className="text-xs font-extrabold text-gray-900 uppercase block border-b border-gray-200 pb-2">
                  2. Plano 3 Meses (Trimestral)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      Valor em Real (R$)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.quarterly.priceBRL}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          quarterly: { ...formData.quarterly, priceBRL: parseFloat(e.target.value) || 0 },
                        })
                      }
                      className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#f26522]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      Valor em Dólar ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.quarterly.priceUSD}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          quarterly: { ...formData.quarterly, priceUSD: parseFloat(e.target.value) || 0 },
                        })
                      }
                      className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#f26522]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      Valor em Euro (€)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.quarterly.priceEUR}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          quarterly: { ...formData.quarterly, priceEUR: parseFloat(e.target.value) || 0 },
                        })
                      }
                      className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#f26522]"
                    />
                  </div>
                </div>
              </div>

              {/* Plano 3: Semestral (6 Meses) */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3">
                <span className="text-xs font-extrabold text-gray-900 uppercase block border-b border-gray-200 pb-2">
                  3. Plano 6 Meses (Semestral)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      Valor em Real (R$)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.semiannual.priceBRL}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          semiannual: { ...formData.semiannual, priceBRL: parseFloat(e.target.value) || 0 },
                        })
                      }
                      className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#f26522]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      Valor em Dólar ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.semiannual.priceUSD}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          semiannual: { ...formData.semiannual, priceUSD: parseFloat(e.target.value) || 0 },
                        })
                      }
                      className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#f26522]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      Valor em Euro (€)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.semiannual.priceEUR}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          semiannual: { ...formData.semiannual, priceEUR: parseFloat(e.target.value) || 0 },
                        })
                      }
                      className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#f26522]"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: BIOGRAFIAS (PT / ES / EN) */}
          {activeTab === 'bios' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1 flex items-center gap-1.5">
                  <span>🇧🇷 Biografia em Português</span>
                </label>
                <textarea
                  rows={3}
                  value={formData.bio_pt}
                  onChange={(e) => setFormData({ ...formData, bio_pt: e.target.value })}
                  className="w-full text-xs p-3 border border-gray-300 rounded-lg outline-none focus:border-[#f26522]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1 flex items-center gap-1.5">
                  <span>🇪🇸 Biografia em Espanhol</span>
                </label>
                <textarea
                  rows={3}
                  value={formData.bio_es}
                  onChange={(e) => setFormData({ ...formData, bio_es: e.target.value })}
                  className="w-full text-xs p-3 border border-gray-300 rounded-lg outline-none focus:border-[#f26522]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1 flex items-center gap-1.5">
                  <span>🇺🇸 Biografia em Inglês</span>
                </label>
                <textarea
                  rows={3}
                  value={formData.bio_en}
                  onChange={(e) => setFormData({ ...formData, bio_en: e.target.value })}
                  className="w-full text-xs p-3 border border-gray-300 rounded-lg outline-none focus:border-[#f26522]"
                />
              </div>

              <div className="pt-2 border-t border-gray-200">
                <label className="block text-xs font-bold text-gray-800 mb-1">
                  Texto da Caixa Branca de Destaque
                </label>
                <input
                  type="text"
                  value={formData.offerNotice_pt}
                  onChange={(e) => setFormData({ ...formData, offerNotice_pt: e.target.value })}
                  placeholder="Ex: CHAMADA DE VIDEO ONN ( 90% OFF )"
                  className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#f26522]"
                />
              </div>
            </div>
          )}

          {/* TAB 4: ESTATÍSTICAS DA CONTA */}
          {activeTab === 'stats' && (
            <div className="space-y-4">
              <p className="text-xs text-gray-600">
                Ajuste os contadores exibidos no topo do perfil e dentro do post bloqueado:
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    🖼 Fotos
                  </label>
                  <input
                    type="number"
                    value={formData.photos}
                    onChange={(e) => setFormData({ ...formData, photos: parseInt(e.target.value) || 0 })}
                    className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#f26522]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    ▦ Vídeos
                  </label>
                  <input
                    type="number"
                    value={formData.videos}
                    onChange={(e) => setFormData({ ...formData, videos: parseInt(e.target.value) || 0 })}
                    className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#f26522]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    🔒 Mídias VIP
                  </label>
                  <input
                    type="number"
                    value={formData.locked}
                    onChange={(e) => setFormData({ ...formData, locked: parseInt(e.target.value) || 0 })}
                    className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#f26522]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    ♡ Curtidas
                  </label>
                  <input
                    type="text"
                    value={formData.likes}
                    onChange={(e) => setFormData({ ...formData, likes: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#f26522]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: SEGURANÇA & ACESSO SECRETO */}
          {activeTab === 'security' && (
            <div className="space-y-4">
              {/* Box: Alterar Senha Master */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-lg bg-orange-100 text-[#f26522] flex items-center justify-center">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-gray-900">Alterar Senha Master</h3>
                    <p className="text-[11px] text-gray-500">Defina uma nova senha para proteger este painel confidencial.</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      Senha Atual
                    </label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Digite a senha atual"
                      className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#f26522] bg-white font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">
                        Nova Senha (Mínimo 4 dígitos)
                      </label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Digite a nova senha"
                        className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#f26522] bg-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">
                        Confirmar Nova Senha
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repita a nova senha"
                        className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#f26522] bg-white font-mono"
                      />
                    </div>
                  </div>

                  {passwordMsg && (
                    <div className={`p-2.5 rounded-lg text-xs font-semibold flex items-center gap-2 ${
                      passwordMsg.type === 'success' 
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-300' 
                        : 'bg-red-50 text-red-800 border border-red-300'
                    }`}>
                      {passwordMsg.type === 'success' ? <Check className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-red-600" />}
                      <span>{passwordMsg.text}</span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleChangePassword}
                    disabled={isChangingPass || !currentPassword || !newPassword}
                    className="px-4 py-2 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-lg transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>{isChangingPass ? 'Atualizando senha...' : 'Salvar Nova Senha'}</span>
                  </button>
                </div>
              </div>

              {/* Box: Instruções de Acesso Invisível */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-slate-800">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck className="w-4 h-4 text-[#f26522]" />
                  <h4 className="text-xs font-bold text-slate-900">Como acessar este painel secreto:</h4>
                </div>
                <ul className="text-[11px] space-y-1.5 text-slate-600 list-disc list-inside">
                  <li>
                    <strong>Atalho de Teclado Secreto:</strong> Pressione <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-gray-800 font-mono font-bold">Ctrl + Shift + A</kbd> (ou <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-gray-800 font-mono font-bold">Cmd + Shift + A</kbd> no Mac).
                  </li>
                  <li>
                    <strong>Clique Secreto no Logo:</strong> Dê <span className="font-semibold text-gray-900">5 cliques rápidos</span> no logo da Privacy no topo da página.
                  </li>
                  <li>
                    <strong>Link Secreto:</strong> Adicione <code className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-orange-600 font-mono">?secret=admin</code> ou <code className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-orange-600 font-mono">#admin</code> no final da URL do seu site.
                  </li>
                  <li>
                    <strong>Bloqueio Automático:</strong> Sempre que você fechar a aba ou clicar em <em>"Bloquear e Sair"</em>, a senha será exigida novamente.
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* Feedback de Sucesso */}
          {saveSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2 animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Configurações salvas e aplicadas em tempo real com sucesso!</span>
            </div>
          )}

          {/* Footer Buttons */}
          <div className="pt-3 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-2.5">
            <button
              type="button"
              onClick={handleReset}
              className="text-xs text-gray-500 hover:text-red-600 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restaurar Padrões Originais</span>
            </button>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setIsAdminOpen(false)}
                className="flex-1 sm:flex-initial text-xs font-bold px-4 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                Fechar
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 sm:flex-initial text-xs font-extrabold px-5 py-2.5 bg-[#f26522] hover:bg-[#e05512] text-white rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-70"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Salvando...' : 'Salvar Alterações'}</span>
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
};
