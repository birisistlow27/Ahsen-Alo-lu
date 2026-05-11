import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package } from 'lucide-react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  setPersistence, 
  browserLocalPersistence, 
  browserSessionPersistence,
  updateProfile
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    if (user) {
      if (isAdmin) {
        navigate('/admin');
      } else {
        navigate('/');
      }
    }
  }, [user, isAdmin, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const cleanTurkish = (str: string) => str.replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c');
    const safeName = cleanTurkish(name.trim().toLowerCase()).replace(/\s+/g, '');
    const safeSurname = cleanTurkish(surname.trim().toLowerCase()).replace(/\s+/g, '');
    const email = `${safeName}${safeSurname}@ahsen.local`;

    try {
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);

      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCred.user, {
          displayName: `${name.trim()} ${surname.trim()}`
        });
      }
      
      if (email === 'ahsenaloglu27@gmail.com' || email === 'ahsenaloglu@ahsen.local') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        setError('Kullanıcı bulunamadı veya şifre hatalı. Lütfen kontrol edin.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('Bu isim ve soyisim ile kayıtlı bir kullanıcı zaten var. Lütfen giriş yapın.');
      } else if (err.code === 'auth/weak-password') {
        setError('Şifreniz en az 6 karakter olmalıdır.');
      } else {
        setError('Bir hata oluştu: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-natural-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-lg border border-natural-300 p-8">
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 rounded-full flex items-center justify-center overflow-hidden bg-natural-100 shadow-md">
            <img src="/logo.png" alt="ASN studio Logo" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }} />
            <Package className="h-8 w-8 text-moss-500 hidden" />
          </div>
        </div>
        
        <h2 className="text-3xl font-serif font-bold text-center text-natural-900 mb-2">
          ASN studio
        </h2>
        <p className="text-center text-natural-500 mb-8">
          {isLogin ? 'Hesabınıza giriş yapın' : 'Yeni bir hesap oluşturun'}
        </p>

        {error && (
          <div className="mb-6 p-4 bg-terracotta-500/10 border border-terracotta-500 rounded-xl text-terracotta-500 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-natural-900 mb-1">Ad</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-natural-100 rounded-xl border border-natural-300 px-4 py-3 text-natural-900 focus:border-moss-500 focus:ring-moss-500 transition-colors"
                placeholder="Adınız"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-natural-900 mb-1">Soyad</label>
              <input
                type="text"
                required
                value={surname}
                onChange={(e) => setSurname(e.target.value)}
                className="w-full bg-natural-100 rounded-xl border border-natural-300 px-4 py-3 text-natural-900 focus:border-moss-500 focus:ring-moss-500 transition-colors"
                placeholder="Soyadınız"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-natural-900 mb-1">Şifre</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-natural-100 rounded-xl border border-natural-300 px-4 py-3 text-natural-900 focus:border-moss-500 focus:ring-moss-500 transition-colors"
              placeholder="Şifrenizi girin"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-2 cursor-pointer text-natural-600">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-natural-300 text-moss-500 focus:ring-moss-500"
              />
              <span className="text-sm font-medium">Beni Hatırla</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-moss-500 hover:bg-moss-600 text-white rounded-xl font-bold shadow-sm transition-colors flex justify-center items-center"
          >
            {loading ? (
              <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
            ) : isLogin ? (
              'Giriş Yap'
            ) : (
              'Üye Ol'
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-natural-600">
            {isLogin ? 'Hesabınız yok mu?' : 'Zaten hesabınız var mı?'}{' '}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="text-moss-600 font-bold hover:text-moss-700 transition-colors"
            >
              {isLogin ? 'Hemen Üye Ol' : 'Giriş Yap'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
