import { Link } from 'react-router-dom';
import { CheckCircle2, Home, Package } from 'lucide-react';

export default function CheckoutSuccess() {
  return (
    <div className="max-w-2xl mx-auto text-center py-20 px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-3xl p-10 shadow-sm border border-natural-300 flex flex-col items-center">
        <CheckCircle2 className="h-24 w-24 text-moss-500 mb-6" />
        <h1 className="text-4xl font-extrabold text-natural-900 tracking-tight mb-4">Siparişiniz Onaylandı!</h1>
        <p className="text-lg text-natural-900 max-w-lg mb-8 leading-relaxed">
          Siparişiniz başarıyla bize ulaştı. Sipariş hazırlandığında size bildirilecektir.
          Ödeme ve teslimat için okulda <strong>Ahsen Aloğlu</strong> ile buluşmayı unutmayın.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <Link
            to="/"
            className="inline-flex justify-center items-center px-6 py-3 border border-natural-300 shadow-sm text-base font-medium rounded-xl text-natural-900 bg-white hover:bg-natural-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-moss-500 transition-colors"
          >
            <Home className="mr-2 h-5 w-5" />
            Ana Sayfaya Dön
          </Link>
          <Link
            to="/"
            className="inline-flex justify-center items-center px-6 py-3 border border-transparent shadow-sm text-base font-bold rounded-xl text-white bg-moss-500 hover:bg-moss-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-moss-500 transition-colors"
          >
             <Package className="mr-2 h-5 w-5" />
             Yeni Alışveriş Yap
          </Link>
        </div>
      </div>
    </div>
  );
}
