import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function Home() {
  const [email, setEmail] = useState('');
  const [inbox, setInbox] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copyText, setCopyText] = useState('Salin');
  const [showCustom, setShowCustom] = useState(false);
  const [customInput, setCustomInput] = useState('');

  const domain = 'sekphim-tv.eu.org';

  // 1. Fungsi buat email acak
  const generateRandom = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const newEmail = `${result}@${domain}`;
    saveEmail(newEmail);
  };

  // 2. Fungsi simpan email & reset inbox
  const saveEmail = (newEmail) => {
    localStorage.setItem('saved_fake_email', newEmail);
    setEmail(newEmail);
    setInbox([]); // Bersihkan inbox setiap ganti alamat
    setShowCustom(false);
  };

  // 3. Fungsi Copy (Tanpa Alert)
  const handleCopy = () => {
    navigator.clipboard.writeText(email);
    setCopyText('Tersalin!');
    setTimeout(() => setCopyText('Salin'), 2000);
  };

  // 4. Fungsi Ambil Inbox
  const fetchInbox = async () => {
    if (!email) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/get-emails?recipient=${email}`);
      const data = await res.json();
      if (Array.isArray(data)) setInbox(data);
    } catch (err) {
      console.error("Gagal refresh");
    }
    setLoading(false);
  };

  useEffect(() => {
    const saved = localStorage.getItem('saved_fake_email');
    if (saved) setEmail(saved); else generateRandom();
  }, []);

  useEffect(() => {
    const interval = setInterval(fetchInbox, 8000);
    return () => clearInterval(interval);
  }, [email]);

  return (
    <div className="main-app">
      <Head>
        <title>Fake Mail Pro</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0"/>
      </Head>

      <div className="card-container">
        <h2 className="title">📧 Fake Mail Pro</h2>
        
        <div className="address-box">
          <div className="email-display">{email}</div>
          
          <div className="button-grid">
            <button className="btn btn-copy" onClick={handleCopy}>{copyText}</button>
            <button className="btn btn-action" onClick={generateRandom}>Auto</button>
            <button className="btn btn-action" onClick={() => setShowCustom(!showCustom)}>Custom</button>
          </div>
        </div>

        {showCustom && (
          <div className="custom-form">
            <input 
              type="text" 
              placeholder="Masukkan nama..." 
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))}
            />
            <button onClick={() => saveEmail(`${customInput}@${domain}`)}>Simpan</button>
          </div>
        )}

        <div className="inbox-card">
          <div className="inbox-header">
            <span>Inbox</span>
            <button onClick={fetchInbox} className="btn-refresh" disabled={loading}>
              {loading ? '...' : 'Refresh'}
            </button>
          </div>

          <div className="inbox-content">
            {inbox.length === 0 ? (
              <div className="empty-state">Menunggu email masuk...</div>
            ) : (
              inbox.map((msg) => (
                <div key={msg.id} className="email-item">
                  <div className="sender">Dari: {msg.sender}</div>
                  <div className="subject">{msg.subject}</div>
                  <div className="body-preview">{msg.body}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <style jsx global>{`
        body { background: #f0f2f5; margin: 0; font-family: 'Segoe UI', Roboto, sans-serif; }
        .main-app { padding: 15px; display: flex; justify-content: center; }
        .card-container { width: 100%; max-width: 450px; background: white; border-radius: 12px; padding: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .title { text-align: center; margin: 0 0 20px 0; font-size: 20px; }
        .address-box { background: #f8f9fa; border: 1px solid #e1e4e8; border-radius: 8px; padding: 15px; text-align: center; }
        .email-display { font-family: monospace; font-size: 16px; font-weight: bold; color: #0070f3; margin-bottom: 15px; word-break: break-all; }
        .button-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; }
        .btn { border: none; padding: 10px; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 13px; transition: 0.2s; }
        .btn-copy { background: #0070f3; color: white; }
        .btn-action { background: #e1e4e8; color: #333; }
        .btn:active { transform: scale(0.95); }
        .custom-form { margin-top: 15px; display: flex; gap: 5px; }
        .custom-form input { flex: 1; padding: 10px; border: 1px solid #ddd; border-radius: 6px; }
        .custom-form button { background: #28a745; color: white; border: none; padding: 0 15px; border-radius: 6px; }
        .inbox-card { margin-top: 25px; border-top: 1px solid #eee; padding-top: 20px; }
        .inbox-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; font-weight: bold; }
        .btn-refresh { border: none; background: none; color: #0070f3; cursor: pointer; }
        .email-item { padding: 12px; border: 1px solid #eee; border-radius: 8px; margin-bottom: 10px; }
        .sender { font-size: 11px; color: #666; }
        .subject { font-size: 14px; font-weight: bold; margin: 4px 0; }
        .body-preview { font-size: 13px; color: #444; white-space: pre-wrap; overflow-wrap: break-word; }
        .empty-state { text-align: center; padding: 30px; color: #999; font-size: 13px; }
      `}</style>
    </div>
  );
}
