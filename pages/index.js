import { useState, useEffect } from 'react';
import Head from 'next/head';
import config from '../config.json';

export default function Home() {
  const [email, setEmail] = useState('');
  const [inbox, setInbox] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copyStatus, setCopyStatus] = useState('Copy');
  const [showCustom, setShowCustom] = useState(false);
  const [customInput, setCustomInput] = useState('');

  const generateRandom = () => {
    const random = Math.random().toString(36).substring(2, 10);
    const newEmail = `${random}@${config.domain}`;
    saveToStorage(newEmail);
  };

  const saveToStorage = (newEmail) => {
import { useState, useEffect } from 'react';
import Head from 'next/head';
import config from '../config.json';

// --- FUNGSI DECODER CANGGIH DARI KAMU ---
const processEmailContent = (rawText) => {
  if (!rawText) return "<html><body><p style='color:#999; text-align:center;'>Tidak ada konten pesan.</p></body></html>";
  let content = rawText;
  try {
    content = content
      .replace(/=\r\n/g, '').replace(/=\n/g, '')
      .replace(/=([0-9A-F]{2})=([0-9A-F]{2})=([0-9A-F]{2})/gi, (m, h1, h2, h3) => decodeURIComponent(`%${h1}%${h2}%${h3}`))
      .replace(/=([0-9A-F]{2})=([0-9A-F]{2})/gi, (m, h1, h2) => decodeURIComponent(`%${h1}%${h2}`))
      .replace(/=([0-9A-F]{2})/gi, (m, hex) => {
        if (hex === '3D') return '=';
        if (hex === '20') return ' ';
        return String.fromCharCode(parseInt(hex, 16));
      });
  } catch (e) {}

  const htmlStart = content.search(/<!DOCTYPE|<html|<body|<div/i);
  if (htmlStart !== -1) {
    content = content.substring(htmlStart);
  } else {
    const parts = content.split('Content-Type: text/html');
    if (parts.length > 1) {
      let bodyPart = parts[1].replace(/Content-Transfer-Encoding:.*?\n\n/s, '');
      const firstTag = bodyPart.search(/</);
      if (firstTag !== -1) content = bodyPart.substring(firstTag);
    }
  }
  content = content.replace(/--[a-zA-Z0-9._-]+--\s*$/, '');
  
  // Menambahkan styling dasar agar tampilan responsif di HP
  const baseTag = '<base target="_blank"><style>body{margin:0; padding:10px; font-family:"Open Sans",Arial,sans-serif; font-size:14px; word-wrap:break-word;} img{max-width:100%; height:auto;} table{max-width:100%;}</style>';
  
  if (content.includes('<head>')) {
    content = content.replace('<head>', '<head>' + baseTag);
  } else {
    content = baseTag + content;
  }
  return content;
};

// --- KOMPONEN UTAMA UI ---
export default function Home() {
  const [email, setEmail] = useState('');
  const [inbox, setInbox] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copyStatus, setCopyStatus] = useState('Salin');
  const [showCustom, setShowCustom] = useState(false);
  const [customInput, setCustomInput] = useState('');

  // Buat Email Acak
  const generateRandom = () => {
    const random = Math.random().toString(36).substring(2, 10);
    const newEmail = `${random}@${config.domain}`;
    saveToStorage(newEmail);
  };

  // Simpan ke memori agar anti-hilang pas di-refresh
  const saveToStorage = (newEmail) => {
    localStorage.setItem('saved_email', newEmail);
    setEmail(newEmail);
    setInbox([]);
    setShowCustom(false);
    setCustomInput('');
  };

  // Fungsi Copy Teks (Tanpa Alert)
  const handleCopy = () => {
    navigator.clipboard.writeText(email);
    setCopyStatus('Tersalin!');
    setTimeout(() => setCopyStatus('Salin'), 2000);
  };

  // Ambil Data dari API
  const fetchInbox = async () => {
    if (!email) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/get-emails?address=${email}`);
      const data = await res.json();
      if (Array.isArray(data)) setInbox(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    const saved = localStorage.getItem('saved_email');
    if (saved) setEmail(saved); else generateRandom();
  }, []);

  // Auto-refresh setiap 10 detik
  useEffect(() => {
    if (!email) return;
    const interval = setInterval(fetchInbox, 10000);
    return () => clearInterval(interval);
  }, [email]);

  // CSS Khusus untuk panel garis tipis samping
  const panelStyle = {
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    borderLeft: '4px solid #337ab7', // GARIS BIRU TIPIS DI KIRI
    borderRadius: '6px'
  };

  return (
    <div className="content-wrapper" style={{ backgroundColor: '#f4f7f9', minHeight: '100vh', paddingBottom: '30px' }}>
      <Head>
        <title>{config.sitename}</title>
      </Head>

      <div className="container trim-box">
        <div className="text-center" style={{ marginTop: '20px', marginBottom: '20px' }}>
          <h2 style={{ fontWeight: '700', color: '#2c3e50' }}>
            <span className="material-icons" style={{ verticalAlign: 'middle', marginRight: '8px', fontSize: '32px', color: '#337ab7' }}>mail_outline</span>
            {config.sitename}
          </h2>
        </div>

        {/* BOX EMAIL CONTROL (Garis Samping) */}
        <div className="panel panel-default" style={panelStyle}>
          <div className="panel-body text-center">
            <p className="text-muted small" style={{ marginBottom: '5px' }}>Alamat Email Sementara Anda:</p>
            <h3 style={{ wordBreak: 'break-all', fontWeight: '700', color: '#337ab7', marginTop: '0', marginBottom: '20px', fontSize: '22px' }}>
              {email || 'Memuat...'}
            </h3>
            
            {/* Grup Tombol Aksi */}
            <div className="btn-group btn-group-justified">
              <a href="#" className="btn btn-primary" onClick={(e) => { e.preventDefault(); handleCopy(); }}>
                <span className="material-icons" style={{ fontSize: '16px', verticalAlign: 'middle' }}>content_copy</span> {copyStatus}
              </a>
              <a href="#" className="btn btn-default" onClick={(e) => { e.preventDefault(); generateRandom(); }}>
                <span className="material-icons" style={{ fontSize: '16px', verticalAlign: 'middle' }}>autorenew</span> Auto
              </a>
              <a href="#" className="btn btn-default" onClick={(e) => { e.preventDefault(); setShowCustom(!showCustom); }}>
                <span className="material-icons" style={{ fontSize: '16px', verticalAlign: 'middle' }}>edit</span> Custom
              </a>
            </div>

            {/* Input Custom yang Muncul Saat Diklik */}
            {showCustom && (
              <div className="input-group" style={{ marginTop: '15px' }}>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Ketik nama (misal: bos123)" 
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))}
                />
                <span className="input-group-btn">
                  <button className="btn btn-success" onClick={() => saveToStorage(`${customInput}@${config.domain}`)}>
                    <span className="material-icons" style={{ fontSize: '16px', verticalAlign: 'middle' }}>check</span> Buat
                  </button>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* BOX INBOX (Garis Samping) */}
        <div className="panel panel-default" style={{ ...panelStyle, borderLeft: '4px solid #5cb85c' }}>
          <div className="panel-heading" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff' }}>
            <b style={{ fontSize: '16px' }}>
              <span className="material-icons" style={{ verticalAlign: 'middle', marginRight: '5px', fontSize: '18px', color: '#5cb85c' }}>inbox</span> 
              Kotak Masuk
            </b>
            <button className="btn btn-sm btn-default" onClick={fetchInbox} disabled={loading} style={{ borderRadius: '20px', padding: '4px 12px' }}>
              <span className="material-icons" style={{ fontSize: '14px', verticalAlign: 'middle' }}>refresh</span> {loading ? 'Cek...' : 'Refresh'}
            </button>
          </div>
          
          <div className="list-group">
            {inbox.length === 0 ? (
              <div className="list-group-item text-center text-muted" style={{ padding: '50px 20px' }}>
                <span className="material-icons" style={{ fontSize: '48px', color: '#e0e0e0', display: 'block', marginBottom: '10px' }}>hourglass_empty</span>
                Menunggu email masuk... (Auto-Refresh)
              </div>
            ) : (
              inbox.map((msg, index) => (
                <div key={index} className="list-group-item" style={{ borderLeft: 'none', borderRight: 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                    <span className="material-icons" style={{ fontSize: '18px', color: '#888', marginRight: '5px' }}>account_circle</span>
                    <span className="small text-muted" style={{ fontWeight: '600' }}>{msg.sender}</span>
                  </div>
                  <h4 className="list-group-item-heading" style={{ fontWeight: '700', fontSize: '16px', marginTop: '5px' }}>
                    {msg.subject}
                  </h4>
                  
                  {/* IFRAME: Untuk merender HTML Email agar bersih dan tidak merusak layout */}
                  <iframe 
                    srcDoc={processEmailContent(msg.body)}
                    sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox"
                    style={{ 
                      width: '100%', 
                      height: '350px', 
                      border: '1px solid #eee', 
                      borderRadius: '4px',
                      marginTop: '10px',
                      backgroundColor: '#fafafa'
                    }}
                  />
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
