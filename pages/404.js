import Link from 'next/link';
import config from '../config.json';

export default function Custom404() {
  return (
    <div className="content-wrapper" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f4f7f9' }}>
      <div className="container trim-box text-center" style={{ padding: '20px' }}>
        
        {/* Grafis SVG 404 agar ringan dan profesional tanpa perlu upload gambar */}
        <svg 
          width="150" 
          height="150" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="#337ab7" 
          strokeWidth="1.5" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          style={{ marginBottom: '20px' }}
        >
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
          <line x1="12" y1="9" x2="12" y2="13"></line>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
        
        <h1 style={{ fontWeight: '700', fontSize: '48px', marginTop: '0', color: '#333' }}>404</h1>
        <h3 style={{ marginTop: '10px', marginBottom: '20px', fontWeight: '600' }}>Waduh, Kesasar Ya?</h3>
        
        <p className="text-muted" style={{ marginBottom: '30px', fontSize: '15px' }}>
          Halaman atau alamat email yang kamu cari di <b>{config.sitename}</b> tidak ditemukan atau mungkin sudah dihapus.
        </p>
        
        {/* Tombol kembali ke halaman utama */}
        <Link href="/" className="btn btn-primary btn-lg" style={{ padding: '10px 30px', fontWeight: '600', borderRadius: '6px' }}>
          Kembali ke Beranda
        </Link>

      </div>
    </div>
  );
}
