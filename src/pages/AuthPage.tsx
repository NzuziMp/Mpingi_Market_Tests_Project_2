import { useState } from 'react';
import { Eye, EyeOff, Globe, UserPlus, LogIn, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { checkUserAge } from '../lib/utils';

interface AuthPageProps {
  onNavigate: (page: string) => void;
  initialMode?: 'signin' | 'signup';
}

export default function AuthPage({ onNavigate, initialMode = 'signin' }: AuthPageProps) {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    email: '',
    password: '',
    fullName: '',
    dateOfBirth: '',
    confirmPassword: '',
    agreeTerms: false,
  });

  function update(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError('');
  }


  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    if (!form.email || !form.password) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    const { error } = await signIn(form.email, form.password);
    if (error) {
      setError(error.message.includes('Invalid') ? 'Invalid email or password.' : error.message);
    } else {
      onNavigate('home');
    }
    setLoading(false);
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    if (!form.fullName || !form.email || !form.password || !form.dateOfBirth) {
      setError('Please fill in all required fields.'); return;
    }
    if (!checkUserAge(form.dateOfBirth)) {
      setError('You must be at least 18 years old to register.'); return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.'); return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.'); return;
    }
    if (!form.agreeTerms) {
      setError('You must agree to the Terms of Service.'); return;
    }
    setLoading(true);
    const { error } = await signUp(form.email, form.password, form.fullName, form.dateOfBirth);
    if (error) {
      setError(error.message.includes('already registered') ? 'This email is already registered.' : error.message);
    } else {
      setSuccess('Account created successfully! You can now sign in.');
      setMode('signin');
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'url(https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=800)',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <button onClick={() => onNavigate('home')} className="flex items-center gap-2 mb-12">
            <div className="w-9 h-9 bg-blue-500 rounded-xl flex items-center justify-center">
              <Globe className="w-5 h-5" />
            </div>
            <span className="text-2xl font-bold">Mpingi<span className="text-yellow-300">Market</span></span>
          </button>
          <h2 className="text-4xl font-extrabold mb-4 leading-tight">
            Connect with buyers<br />& sellers worldwide
          </h2>
          <p className="text-blue-100 text-lg leading-relaxed mb-8">
            Join millions of users posting and finding great deals on cars, electronics, fashion, real estate, services, and more.
          </p>
          <div className="grid grid-cols-2 gap-4">
            {[
              { value: '239+', label: 'Countries' },
              { value: '47K+', label: 'Cities' },
              { value: '12', label: 'Categories' },
              { value: 'Free', label: 'To Post' },
            ].map((s) => (
              <div key={s.label} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                <p className="text-2xl font-bold text-yellow-300">{s.value}</p>
                <p className="text-blue-200 text-sm">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex justify-center mb-8">
            <button onClick={() => onNavigate('home')} className="flex items-center gap-2">
              <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">Mpingi<span className="text-blue-600">Market</span></span>
            </button>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <div className="flex rounded-2xl bg-gray-100 p-1 mb-7">
              <button
                onClick={() => { setMode('signin'); setError(''); setSuccess(''); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${mode === 'signin' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <LogIn className="w-4 h-4" /> Sign In
              </button>
              <button
                onClick={() => { setMode('signup'); setError(''); setSuccess(''); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${mode === 'signup' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <UserPlus className="w-4 h-4" /> Register
              </button>
            </div>

            {error && (
              <div className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-100 rounded-xl mb-4 text-sm text-red-700">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                {error}
              </div>
            )}
            {success && (
              <div className="flex items-start gap-2.5 p-3.5 bg-emerald-50 border border-emerald-100 rounded-xl mb-4 text-sm text-emerald-700">
                <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                {success}
              </div>
            )}

            {mode === 'signin' ? (
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => update('email', e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={form.password}
                      onChange={(e) => update('password', e.target.value)}
                      placeholder="Enter your password"
                      className="w-full px-4 py-3 pr-11 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors text-sm"
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleSignUp} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                  <input
                    type="text"
                    required
                    value={form.fullName}
                    onChange={(e) => update('fullName', e.target.value)}
                    placeholder="Your full name"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => update('email', e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Date of Birth <span className="text-red-500">*</span>
                    <span className="text-gray-400 font-normal ml-1">(Must be 18+)</span>
                  </label>
                  <input
                    type="date"
                    required
                    max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                    value={form.dateOfBirth}
                    onChange={(e) => update('dateOfBirth', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={8}
                      value={form.password}
                      onChange={(e) => update('password', e.target.value)}
                      placeholder="Min. 8 characters"
                      className="w-full px-4 py-3 pr-11 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
                  <input
                    type="password"
                    required
                    value={form.confirmPassword}
                    onChange={(e) => update('confirmPassword', e.target.value)}
                    placeholder="Re-enter your password"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.agreeTerms}
                    onChange={(e) => update('agreeTerms', e.target.checked)}
                    className="mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-xs text-gray-600 leading-relaxed">
                    I agree to the <a href="#" className="text-blue-600 hover:underline">Terms of Service</a> and <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>. I confirm I am at least 18 years old.
                  </span>
                </label>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors text-sm"
                >
                  {loading ? 'Creating account...' : 'Create Account'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
