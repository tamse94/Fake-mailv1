import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function Home() {
  const [email, setEmail] = useState('');
  const [inbox, setInbox] = useState([]);
  const [loading, setLoading] = useState(false);

  // 1. Fungsi buat email acak
  const generateRandomEmail = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const newEmail = `${result}@sekphim-tv.eu.org`;
    
    // Simpan ke localStorage biar gak hilang pas refresh
    localStorage.setItem('saved_fake_email', newEmail);
    setEmail(newEmail);
  };

  // 2. Load email dari memori pas pertama kali buka
  useEffect(() => {
    const savedEmail = localStorage.getItem('saved_fake_email');
    if (savedEmail) {
      setEmail(savedEmail);
    } else {
      generateRandomEmail();
    }
  }, []);

  // 3. Ambil data dari Supabase via API kita
  const fetchInbox = async () => {
    if (!email) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/get-emails?recipient=${email}`);
      const data = await res.json();
      setInbox(data);
    } catch (err) {
      console.error("Gagal ambil inbox");
    }
    setLoading(false);
  };

  // Auto-refresh inbox setiap 10 detik
  useEffect(() => {
    const interval = setInterval(fetchInbox, 10000);
    return () => clearInterval(interval);
  }, [email]);

  return (
    <div className="container" style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <Head>
        <title>Fake Mail - {email}</title>
      </Head>

      <h2 style={{ textAlign: 'center' }}>📧 Fake Mail Generator</h2>
      
      <div style={{ background: '#f0f0f0', padding: '15px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center' }}>
        <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#666' }}>Alamat Email Anda:</p>
        <code style={{ fontSize: '18px', fontWeight: 'bold', color: '#0070f3' }}>{email}</code>
        <div style={{ marginTop: '10px' }}>
          <button onClick={() => {
            if(confirm("Ganti email baru? Email lama akan hilang!")) generateRandomEmail();
          }} style={{ marginRight: '10px' }}>Ganti Baru</button>
          <button onClick={fetchInbox} disabled={loading}>
            {loading ? 'Cek...' : 'Refresh Inbox'}
          </button>
        </div>
      </div>

      <div className="inbox-section">
        <h3>Inbox</h3>
        {inbox.length === 0 ? (
          <p style={{ color: '#999' }}>Belum ada email masuk. Menunggu...</p>
        ) : (
          inbox.map((msg) => (
            <div key={msg.id} style={{ border: '1px solid #ddd', padding: '10px', borderRadius: '5px', marginBottom: '10px' }}>
              <div style={{ fontSize: '12px', color: '#666' }}>Dari: {msg.sender}</div>
              <div style={{ fontWeight: 'bold', margin: '5px 0' }}>Subjek: {msg.subject}</div>
              <hr />
              {/* Render isi email secara aman */}
              <div style={{ fontSize: '14px', whiteSpace: 'pre-wrap', maxHeight: '200px', overflowY: 'auto' }}>
                {msg.body}
              </div>
            </div>
          ))
        )}
      </div>

      <style jsx global>{`
        body { background: #fafafa; color: #333; }
        button { padding: 8px 15px; cursor: pointer; border-radius: 5px; border: 1px solid #ccc; background: #fff; }
        button:hover { background: #eee; }
      `}</style>
    </div>
  );
}
