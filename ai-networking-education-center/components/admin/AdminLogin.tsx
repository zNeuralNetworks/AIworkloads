import React, { useState } from 'react';
import { Lock, Mail, Chrome, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface AdminLoginProps {
  onLogin: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin }) => {
  const { signInWithMagicLink, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [step, setStep] = useState<'input' | 'sent'>('input');

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setMessage({ type: 'error', text: 'Please enter your email' });
      return;
    }

    setLoading(true);
    setMessage(null);

    const { error } = await signInWithMagicLink(email);
    if (error) {
      setMessage({ type: 'error', text: error });
    } else {
      setStep('sent');
      setMessage({ type: 'success', text: `Check ${email} for login link` });
    }

    setLoading(false);
  };

  const handleGoogle = async () => {
    setLoading(true);
    setMessage(null);

    const { error } = await signInWithGoogle();
    if (error) {
      setMessage({ type: 'error', text: error });
    }

    setLoading(false);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-[#0F1117] to-[#0F1117]">
      <form onSubmit={handleMagicLink} className="w-full max-w-sm space-y-6">
        <div className="text-center mb-8">
          <div className="inline-block p-6 bg-slate-800/50 rounded-2xl mb-4 text-blue-400 ring-1 ring-white/10 shadow-xl">
            <Lock size={40} />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Admin Access</h3>
          <p className="text-slate-400">Sign in to edit application data</p>
        </div>

        {step === 'input' && (
          <>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#0d1117] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:border-blue-500 outline-none transition-all focus:ring-1 focus:ring-blue-500"
                  disabled={loading}
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all shadow-lg hover:shadow-blue-500/25 flex items-center justify-center gap-2"
              >
                <Mail size={18} />
                {loading ? 'Sending...' : 'Send Magic Link'}
              </button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-[#0F1117] text-slate-400">Or continue with</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogle}
              disabled={loading}
              className="w-full bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 rounded-xl transition-all border border-white/10 flex items-center justify-center gap-2"
            >
              <Chrome size={18} />
              {loading ? 'Processing...' : 'Google'}
            </button>
          </>
        )}

        {step === 'sent' && (
          <div className="text-center space-y-4">
            <div className="inline-block p-4 bg-green-900/30 rounded-full text-green-400 ring-1 ring-green-500/30">
              <CheckCircle size={32} />
            </div>
            <p className="text-white font-medium">Check your email</p>
            <p className="text-slate-400 text-sm">We sent a login link to {email}</p>
            <button
              type="button"
              onClick={() => {
                setStep('input');
                setEmail('');
                setMessage(null);
              }}
              className="mt-4 text-blue-400 hover:text-blue-300 text-sm font-medium"
            >
              Try another email
            </button>
          </div>
        )}

        {message && (
          <div
            className={`p-3 rounded-lg flex gap-2 ${
              message.type === 'error'
                ? 'bg-red-900/30 border border-red-500/30 text-red-300'
                : 'bg-green-900/30 border border-green-500/30 text-green-300'
            }`}
          >
            {message.type === 'error' ? (
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
            ) : (
              <CheckCircle size={18} className="shrink-0 mt-0.5" />
            )}
            <p className="text-sm">{message.text}</p>
          </div>
        )}
      </form>
    </div>
  );
};

export default AdminLogin;
