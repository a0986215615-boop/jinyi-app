import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { User as UserIcon, Lock, Mail, Phone, ArrowRight, Loader2, Shield, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const success = await login(email, password);
      if (success) {
        navigate('/');
      } else {
        setError('電子郵件或密碼錯誤');
      }
    } finally {
      setLoading(false);
    }
  };

  const fillTestAccount = (type: 'admin' | 'user') => {
    if (type === 'admin') {
        setEmail('admin@clinic.com');
        setPassword('admin');
    } else {
        setEmail('test@clinic.com');
        setPassword('test');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg border border-slate-100">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-800">會員登入</h2>
          <p className="text-slate-500 mt-2">歡迎回到康健預約</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm mb-6 flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">電子郵件</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                placeholder="hello@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">密碼</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary text-white rounded-xl font-bold text-lg hover:bg-secondary transition-all shadow-md hover:shadow-lg flex items-center justify-center"
          >
            {loading ? <Loader2 className="animate-spin" /> : '登入'}
          </button>
        </form>

        <div className="mt-6 flex justify-center">
             <button 
                onClick={() => fillTestAccount('user')}
                className="text-xs py-2 px-4 bg-slate-50 text-slate-500 rounded-lg hover:bg-slate-100 transition-colors flex items-center justify-center gap-2"
             >
                <UserIcon size={14} /> 快速填入測試帳號
             </button>
        </div>

        <div className="mt-6 text-center text-sm text-slate-500">
          還沒有帳號嗎？{' '}
          <Link to="/register" className="text-primary font-semibold hover:underline">
            立即註冊
          </Link>
        </div>
      </div>
    </div>
  );
};

export const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  
  // Validation Errors State
  const [validation, setValidation] = useState({
    email: { valid: false, msg: '' },
    phone: { valid: false, msg: '' },
    password: { valid: false, msg: '' }
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  // Validation patterns
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^09\d{8}$/; // Taiwan mobile format: 09xxxxxxxx

  const validateField = (name: string, value: string) => {
    let isValid = true;
    let msg = '';

    if (name === 'email') {
        if (value && !emailRegex.test(value)) {
            isValid = false;
            msg = '格式錯誤';
        }
    } else if (name === 'phone') {
        if (value && !phoneRegex.test(value)) {
            isValid = false;
            msg = '請輸入 09 開頭的 10 碼手機號';
        }
    } else if (name === 'confirmPassword') {
        if (value && value !== formData.password) {
            isValid = false;
            msg = '密碼不一致';
        }
    }

    return { isValid, msg };
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Real-time check
    if (name === 'email' || name === 'phone') {
        const { isValid, msg } = validateField(name, value);
        setValidation(prev => ({
            ...prev,
            [name]: { valid: isValid && value !== '', msg: value ? msg : '' }
        }));
    }
    
    if (name === 'confirmPassword') {
         const { isValid, msg } = validateField(name, value);
         setValidation(prev => ({
            ...prev,
            password: { valid: isValid, msg: value ? msg : '' }
         }));
    }

    // Special case: re-validate confirm password if password changes
    if (name === 'password' && formData.confirmPassword) {
         const match = value === formData.confirmPassword;
         setValidation(prev => ({
            ...prev,
            password: { valid: match, msg: match ? '' : '密碼不一致' }
         }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Final comprehensive check
    if (!emailRegex.test(formData.email)) {
        return setError('請輸入有效的電子郵件格式');
    }
    if (!phoneRegex.test(formData.phone)) {
        return setError('請輸入有效的手機號碼 (09xxxxxxxx)');
    }
    if (formData.password !== formData.confirmPassword) {
      return setError('兩次輸入的密碼不符');
    }

    setLoading(true);
    try {
      const success = await register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password
      });

      if (success) {
        navigate('/');
      } else {
        setError('此電子郵件已被註冊');
      }
    } finally {
      setLoading(false);
    }
  };

  const getInputClass = (name: 'email' | 'phone', value: string) => {
     const status = validation[name];
     if (!value) return 'border-slate-200 focus:border-primary focus:ring-primary';
     if (status.msg) return 'border-red-300 focus:border-red-500 focus:ring-red-200';
     return 'border-green-300 focus:border-green-500 focus:ring-green-200';
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg border border-slate-100">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-800">註冊會員</h2>
          <p className="text-slate-500 mt-2">建立帳戶以管理您的預約</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm mb-6 flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">真實姓名</label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <input
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary outline-none"
                placeholder="王小明"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between">
                <label className="block text-sm font-medium text-slate-700 mb-1">電子郵件</label>
                {validation.email.msg && <span className="text-xs text-red-500 pt-1">{validation.email.msg}</span>}
            </div>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <input
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className={`w-full pl-10 pr-10 py-3 rounded-xl border outline-none focus:ring-2 transition-colors ${getInputClass('email', formData.email)}`}
                placeholder="hello@example.com"
              />
              <div className="absolute right-3 top-3">
                {formData.email && !validation.email.msg && <CheckCircle className="w-5 h-5 text-green-500" />}
                {validation.email.msg && <XCircle className="w-5 h-5 text-red-500" />}
              </div>
            </div>
          </div>

          <div>
            <div className="flex justify-between">
                <label className="block text-sm font-medium text-slate-700 mb-1">聯絡電話</label>
                {validation.phone.msg && <span className="text-xs text-red-500 pt-1">{validation.phone.msg}</span>}
            </div>
            <div className="relative">
              <Phone className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <input
                name="phone"
                type="tel"
                required
                value={formData.phone}
                onChange={handleChange}
                className={`w-full pl-10 pr-10 py-3 rounded-xl border outline-none focus:ring-2 transition-colors ${getInputClass('phone', formData.phone)}`}
                placeholder="0912345678"
              />
              <div className="absolute right-3 top-3">
                {formData.phone && !validation.phone.msg && <CheckCircle className="w-5 h-5 text-green-500" />}
                {validation.phone.msg && <XCircle className="w-5 h-5 text-red-500" />}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">密碼</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary outline-none"
                  placeholder="••••"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">確認密碼</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border outline-none focus:ring-2 transition-colors ${
                    validation.password.msg ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-slate-200 focus:ring-primary'
                  }`}
                  placeholder="••••"
                />
              </div>
            </div>
          </div>
          {validation.password.msg && <p className="text-xs text-red-500 text-center">{validation.password.msg}</p>}

          <button
            type="submit"
            disabled={loading || !!validation.email.msg || !!validation.phone.msg || !!validation.password.msg}
            className="w-full mt-6 py-3 bg-slate-800 text-white rounded-xl font-bold text-lg hover:bg-slate-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="animate-spin" /> : <>註冊帳戶 <ArrowRight className="w-4 h-4" /></>}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-500">
          已經有帳號了？{' '}
          <Link to="/login" className="text-primary font-semibold hover:underline">
            直接登入
          </Link>
        </div>
      </div>
    </div>
  );
};