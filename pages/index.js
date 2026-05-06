import { useState, useEffect } from 'react';
import Head from 'next/head';
import config from '../config.json';

// --- DECODER QUOTED-PRINTABLE (ANTI KODE ANEH) ---
const processEmailContent = (rawText) => {
  if (!rawText) return "<html><body><p style='color:#999; text-align:center; padding:20px;'>Isi pesan kosong.</p></body></html>";
  let content = rawText;

  // 1. Bongkar Enkripsi Quoted-Printable (=20, =3D, dll)
  try {
    // Hapus soft line breaks (=\r\n atau =\n)
    content = content.replace(/=\r?\n/g, '');
    // Ubah format =XX menjadi %XX agar bisa dibaca JavaScript
    content = content.replace(/=([0-9A-F]{2})/gi, '%$1');
    // Decode menjadi teks asli (termasuk emoji)
    content = decodeURIComponent(content);
  } catch (e) {
    // Fallback jika gagal
    try { content = unescape(content); } catch(ex){}
  }

  // 2. Ekstrak hanya bagian HTML
  const htmlStart = content.search(/<!DOCTYPE|<html|<body|<div/i);
  if (htmlStart !== -1) {
    content = content.substring(htmlStart);
  } else {
    // Cari bagian text/html jika tersembunyi di dalam boundary
    const parts = content.split(/Content-Type:\s*text\/html/i);
    if (parts.length > 1) {
      let bodyPart = parts[1].replace(/Content-Transfer-Encoding:.*?\r?\n\r?\n/is, '');
      const firstTag = bodyPart.search(/</);
      if (firstTag !== -1) content = bodyPart.substring(firstTag);
    }
  }

  // Bersihkan sisa ekor email
  content = content.replace(/--[a-zA-Z0-9._-]+--\s*$/g, '');
  
  // 3. Inject CSS agar tampil sempurna dan bersih di iFrame
  const baseTag = '<base target="_blank"><style>body{margin:0; padding:12px; font-family:"Helvetica Neue",Helvetica,Arial,sans-serif; font-size:14px; color:#333; background:#fff; word-wrap:break-word;} img{max-width:100%; height:auto; border-radius:4px;} table{max-width:100% !important;} a{color:#337ab7; text-decoration:none;}</style>';
  
  if (content.includes('<head>')) {
    content = content.replace('<head>', '<head>' + baseTag);
  } else {
    content = baseTag + content;
  }
  return content;
};

// --- KOMPONEN UTAMA ---
export default function Home() {
  const [email, setEmail] = useState('');
  const [inbox, setInbox] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copyStatus, setCopyStatus] = useState('Salin');
  const [showCustom, setShowCustom] = useState(false);
  const [customInput, setCustomInput] = useState('');

  const generateRandom = () => {
    const random = Math.random().toString(36).substring(2, 10);
    const newEmail = `${random}@${config.domain}`;
    saveToStorage(newEmail);
  };

  const saveToStorage = (newEmail) => {
    localStorage.setItem('saved_email', newEmail);
    setEmail(newEmail);
    setInbox([]); // Kosongkan inbox hanya saat ganti email
    setShowCustom(false);
    setCustomInput('');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(email);
    setCopyStatus('Tersalin!');
    setTimeout(() => setCopyStatus('Salin'), 2000);
  };

  // Fungsi Fetch API (Parameter isSilent agar tidak berkedip saat auto-refresh)
  const fetchInbox = async (isSilent = false) => {
    if (!email) return;
    if (!isSilent) setLoading(true);
    try {
      const res = await fetch(`/api/get-emails?address=${email}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setInbox(data);
      }
    } catch (err) {
      console.error("Gagal mengambil email");
    }
    if (!isSilent) setLoading(false);
  };

  useEffect(() => {
    const saved = localStorage.getItem('saved_email');
    if (saved) setEmail(saved); else generateRandom();
  }, []);

  // Auto-refresh di background tanpa mengganggu tampilan
  useEffect(() => {
    if (!email) return;
    const interval = setInterval(() => fetchInbox(true), 10000);
    return () => clearInterval(interval);
  }, [email]);

  return (
    <div className="main-bg">
      <Head>
        <title>{config.sitename}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0"/>
      </Head>

      <div className="container trim-box wrapper-mobile">
        <div className="text-center header-title">
          <h2 style={{ fontWeight: '800', color: '#2c3e50', margin: '0' }}>
            <span className="material-icons" style={{ verticalAlign: 'bottom', marginRight: '8px', fontSize: '36px', color: '#337ab7' }}>mark_email_unread</span>
            {config.sitename}
          </h2>
        </div>

        {/* --- KOTAK IDENTITAS EMAIL --- */}
        <div className="panel panel-default shadow-panel custom-border-blue">
          <div className="panel-body text-center" style={{ padding: '20px 15px' }}>
            <span className="label label-primary" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>ALAMAT EMAIL ANDA</span>
            <h3 className="email-text">
              {email || 'Menyiapkan...'}
            </h3>
            
            <div className="btn-group btn-group-justified action-buttons">
              <a href="#" className="btn btn-primary" onClick={(e) => { e.preventDefault(); handleCopy(); }}>
                <span className="material-icons">content_copy</span> {copyStatus}
              </a>
              <a href="#" className="btn btn-default" onClick={(e) => { e.preventDefault(); generateRandom(); }}>
                <span className="material-icons">autorenew</span> Auto
              </a>
              <a href="#" className="btn btn-default" onClick={(e) => { e.preventDefault(); setShowCustom(!showCustom); }}>
                <span className="material-icons">edit</span> Custom
              </a>
            </div>

            {showCustom && (
              <div className="input-group" style={{ marginTop: '15px' }}>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Ketik nama (tanpa @)" 
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))}
                />
                <span className="input-group-btn">
                  <button className="btn btn-success" onClick={() => saveToStorage(`${customInput}@${config.domain}`)}>
                    <span className="material-icons" style={{ fontSize: '16px', verticalAlign: 'middle' }}>check</span> Set
                  </button>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* --- KOTAK INBOX --- */}
        <div className="panel panel-default shadow-panel custom-border-green" style={{ marginTop: '20px' }}>
          <div className="panel-heading inbox-header">
            <div>
              <span className="material-icons" style={{ verticalAlign: 'middle', marginRight: '5px', color: '#5cb85c' }}>inbox</span>
              <b style={{ fontSize: '16px', verticalAlign: 'middle' }}>Kotak Masuk</b>
              <span className="badge" style={{ backgroundColor: '#5cb85c', marginLeft: '10px', verticalAlign: 'middle' }}>
                {inbox.length}
              </span>
            </div>
            <button className="btn btn-sm btn-default btn-refresh" onClick={() => fetchInbox(false)} disabled={loading}>
              <span className="material-icons" style={{ fontSize: '14px' }}>sync</span> {loading ? 'Cek...' : 'Refresh'}
            </button>
          </div>
          
          <div className="list-group" style={{ margin: '0' }}>
            {inbox.length === 0 ? (
              <div className="list-group-item text-center text-muted empty-state">
                <span className="material-icons" style={{ fontSize: '48px', color: '#e0e0e0', display: 'block', marginBottom: '10px' }}>hourglass_empty</span>
                Menunggu email masuk...
              </div>
            ) : (
              inbox.map((msg) => (
                <div key={msg.id || msg.created_at} className="list-group-item email-item">
                  <div className="email-meta">
                    <span className="material-icons">account_circle</span>
                    <b>{msg.sender}</b>
                  </div>
                  <h4 className="list-group-item-heading email-subject">
                    {msg.subject}
                  </h4>
                  
                  <iframe 
                    title={`Email from ${msg.sender}`}
                    srcDoc={processEmailContent(msg.body)}
                    sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox"
                    className="email-iframe"
                  />
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* --- CSS KHUSUS --- */}
      <style jsx global>{`
        body { background-color: #f4f7f9; }
        .main-bg { min-height: 100vh; padding-top: 20px; padding-bottom: 40px; }
        
        /* Memaksimalkan layar di HP agar dempet (tight layout) */
        @media (max-width: 768px) {
          .wrapper-mobile { padding-left: 10px !important; padding-right: 10px !important; }
        }
        
        .header-title { margin-bottom: 25px; }
        .shadow-panel { box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: none; border-radius: 8px; overflow: hidden; }
        .custom-border-blue { border-left: 5px solid #337ab7; }
        .custom-border-green { border-left: 5px solid #5cb85c; }
        
        .email-text { word-break: break-all; font-weight: 700; color: #337ab7; margin: 15px 0 20px 0; font-size: 24px; letter-spacing: -0.5px; }
        
        .action-buttons .btn { border-radius: 6px; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 4px; padding: 10px 0; }
        .action-buttons .material-icons { font-size: 18px; }
        .action-buttons .btn:not(:last-child) { border-right: 1px solid rgba(0,0,0,0.05); }
        
        .inbox-header { display: flex; justify-content: space-between; align-items: center; background-color: #fff !important; border-bottom: 1px solid #eee; padding: 15px; }
        .btn-refresh { border-radius: 20px; padding: 4px 15px; font-weight: 600; display: flex; align-items: center; gap: 4px; background: #f8f9fa; border: 1px solid #ddd; }
        .btn-refresh:hover { background: #eee; }
        
        .empty-state { padding: 60px 20px; background-color: #fafafa; border: none; }
        
        .email-item { padding: 20px; border-left: none; border-right: none; border-radius: 0; border-bottom: 1px solid #eee; }
        .email-item:last-child { border-bottom: none; }
        .email-meta { display: flex; align-items: center; gap: 6px; color: #666; font-size: 13px; margin-bottom: 8px; }
        .email-meta .material-icons { font-size: 18px; color: #bbb; }
        .email-subject { font-weight: 700; font-size: 18px; margin-bottom: 15px; color: #222; }
        
        .email-iframe { width: 100%; height: 400px; border: 1px solid #eaebec; border-radius: 6px; background-color: #fdfdfd; display: block; }
      `}</style>
    </div>
  );
}
