import { useState, useEffect } from 'react';
import Head from 'next/head';
import config from '../config.json';

// --- DECODER ANTI-MOJIBAKE (Tetap dipertahankan karena sudah sempurna) ---
const processEmailContent = (rawText) => {
  if (!rawText) return "<html><body><p style='color:#999; text-align:center; padding:20px;'>Isi pesan kosong.</p></body></html>";
  let content = rawText;

  try {
    content = content.replace(/=\r?\n/g, '');
    content = content.replace(/=([0-9A-F]{2})/gi, '%$1');
    content = decodeURIComponent(content);
    try { content = decodeURIComponent(escape(content)); } catch(e) {}
  } catch (e) {
    try { content = unescape(content); } catch(ex){}
  }

  const htmlStart = content.search(/<!DOCTYPE|<html|<body|<div/i);
  if (htmlStart !== -1) {
    content = content.substring(htmlStart);
  } else {
    const parts = content.split(/Content-Type:\s*text\/html/i);
    if (parts.length > 1) {
      let bodyPart = parts[1].replace(/Content-Transfer-Encoding:.*?\r?\n\r?\n/is, '');
      const firstTag = bodyPart.search(/</);
      if (firstTag !== -1) content = bodyPart.substring(firstTag);
    }
  }

  content = content.replace(/--[a-zA-Z0-9._-]+--\s*$/g, '');
  
  const baseTag = '<base target="_blank"><style>body{margin:0; padding:10px; font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif; font-size:14px; color:#111; line-height:1.5; word-wrap:break-word;} img{max-width:100%; height:auto;} table{max-width:100% !important;} a{color:#0066cc;}</style>';
  
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
  
  // State baru untuk melacak pesan mana yang sedang DIBUKA
  const [expandedEmailId, setExpandedEmailId] = useState(null);

  const generateRandom = () => {
    const random = Math.random().toString(36).substring(2, 10);
    const newEmail = `${random}@${config.domain}`;
    saveToStorage(newEmail);
  };

  const saveToStorage = (newEmail) => {
    localStorage.setItem('saved_email', newEmail);
    setEmail(newEmail);
    setInbox([]); 
    setShowCustom(false);
    setCustomInput('');
    setExpandedEmailId(null); // Tutup semua pesan yang terbuka saat ganti email
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(email);
    setCopyStatus('Tersalin!');
    setTimeout(() => setCopyStatus('Salin'), 2000);
  };

  const fetchInbox = async (isSilent = false) => {
    if (!email) return;
    if (!isSilent) setLoading(true);
    try {
      const res = await fetch(`/api/get-emails?address=${email}`);
      const data = await res.json();
      if (Array.isArray(data)) setInbox(data);
    } catch (err) {}
    if (!isSilent) setLoading(false);
  };

  // Fungsi untuk Buka/Tutup Pesan
  const toggleEmail = (id) => {
    if (expandedEmailId === id) {
      setExpandedEmailId(null); // Kalau diklik lagi, tutup
    } else {
      setExpandedEmailId(id); // Buka pesan yang diklik
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem('saved_email');
    if (saved) setEmail(saved); else generateRandom();
  }, []);

  useEffect(() => {
    if (!email) return;
    const interval = setInterval(() => fetchInbox(true), 10000);
    return () => clearInterval(interval);
  }, [email]);

  return (
    <div className="flat-ui-container">
            <Head>
        {/* Judul & Viewport */}
        <title>{config.sitename} - TempMail & Fake Mail Generator</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0"/>
        
        {/* Meta Tag Dasar (Untuk Google Search) */}
        <meta name="description" content={`Gunakan ${config.sitename} untuk membuat email sementara (fake mail) gratis. Lindungi email utama Anda dari spam dengan email sekali pakai yang aman.`} />
        <meta name="keywords" content="fake mail, temp mail, email sementara, generator email, anti spam, 10 minute mail" />

        {/* Open Graph / Facebook / WhatsApp (Biar kalau di-share link-nya muncul gambar & deskripsi) */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://${config.domain}`} />
        <meta property="og:title" content={`${config.sitename} - TempMail Generator`} />
        <meta property="og:description" content="Buat email sementara dengan sekali klik. Otomatis terhapus, 100% aman dari spam!" />
        <meta property="og:image" content={`https://${config.domain}/og.jpg`} />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${config.sitename} - TempMail Generator`} />
        <meta name="twitter:description" content="Buat email sementara dengan sekali klik. Bebas spam." />
        <meta name="twitter:image" content={`https://${config.domain}/og.jpg`} />
      </Head>


      <div className="header-area">
        <h2 className="brand-title">
          <span className="material-icons brand-icon">mail</span>
          {config.sitename}
        </h2>
      </div>

      <div className="email-section">
        <div className="email-label">ALAMAT EMAIL ANDA</div>
        <div className="email-display">{email || 'Menyiapkan...'}</div>
        
        <div className="action-grid">
          <button className="btn-flat btn-primary" onClick={handleCopy}>
            <span className="material-icons">content_copy</span> {copyStatus}
          </button>
          <button className="btn-flat btn-secondary" onClick={generateRandom}>
            <span className="material-icons">autorenew</span> Auto
          </button>
          <button className="btn-flat btn-secondary" onClick={() => setShowCustom(!showCustom)}>
            <span className="material-icons">edit</span> Custom
          </button>
        </div>

        {showCustom && (
          <div className="custom-input-area">
            <input 
              type="text" 
              className="flat-input" 
              placeholder="nama email..." 
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))}
            />
            <button className="btn-flat btn-success" onClick={() => saveToStorage(`${customInput}@${config.domain}`)}>
              Set
            </button>
          </div>
        )}
      </div>

      <div className="divider"></div>

      <div className="inbox-section">
        <div className="inbox-header">
          <div className="inbox-title">
            Kotak Masuk 
            <span className="inbox-badge">{inbox.length}</span>
          </div>
          <button className="btn-refresh" onClick={() => fetchInbox(false)} disabled={loading}>
            <span className="material-icons" style={{ fontSize: '14px', marginRight: '4px' }}>sync</span>
            {loading ? 'Cek...' : 'Refresh'}
          </button>
        </div>

        <div className="inbox-list">
          {inbox.length === 0 ? (
            <div className="empty-msg">
              <span className="material-icons empty-icon">hourglass_empty</span>
              Menunggu email masuk...
            </div>
          ) : (
            inbox.map((msg) => {
              // Cek apakah pesan ini sedang dibuka atau tidak
              const isExpanded = expandedEmailId === (msg.id || msg.created_at);
              
              return (
                <div key={msg.id || msg.created_at} className={`email-item ${isExpanded ? 'expanded' : ''}`}>
                  {/* Bagian Header yang BISA DIKLIK */}
                  <div className="email-header-clickable" onClick={() => toggleEmail(msg.id || msg.created_at)}>
                    <div className="email-info">
                      <div className="email-sender">
                        <span className="material-icons">account_circle</span>
                        {msg.sender}
                      </div>
                      <div className="email-subject">{msg.subject}</div>
                    </div>
                    <div className="email-toggle-icon">
                      <span className="material-icons">
                        {isExpanded ? 'expand_less' : 'expand_more'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Bagian Isi Pesan (Hanya muncul kalau diklik) */}
                  {isExpanded && (
                    <div className="email-body-container">
                      <iframe 
                        title={`Email from ${msg.sender}`}
                        srcDoc={processEmailContent(msg.body)}
                        sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox"
                        className="email-iframe"
                      />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      <style jsx global>{`
        body { 
          margin: 0; 
          padding: 0; 
          background-color: #ffffff; 
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          color: #222;
        }
        
        .flat-ui-container { max-width: 600px; margin: 0 auto; padding: 0; }
        .header-area { padding: 20px 15px 10px; text-align: center; }
        .brand-title { margin: 0; font-size: 24px; font-weight: 800; display: flex; align-items: center; justify-content: center; gap: 8px; }
        .brand-icon { font-size: 28px; color: #111; }
        
        .email-section { padding: 15px; text-align: center; }
        .email-label { font-size: 11px; font-weight: 700; color: #888; letter-spacing: 1px; margin-bottom: 5px; }
        .email-display { font-size: 22px; font-weight: 700; color: #111; word-break: break-all; margin-bottom: 20px; }
        
        .action-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; }
        .btn-flat { border: none; padding: 10px 0; font-size: 13px; font-weight: 600; border-radius: 6px; display: flex; align-items: center; justify-content: center; gap: 5px; cursor: pointer; transition: background 0.2s; }
        .btn-flat .material-icons { font-size: 16px; }
        .btn-primary { background-color: #111; color: #fff; }
        .btn-primary:active { background-color: #333; }
        .btn-secondary { background-color: #f2f2f2; color: #333; }
        .btn-secondary:active { background-color: #e0e0e0; }
        .btn-success { background-color: #28a745; color: #fff; padding: 10px 15px; }
        
        .custom-input-area { display: flex; gap: 8px; margin-top: 15px; }
        .flat-input { flex: 1; border: 1px solid #ddd; padding: 10px; border-radius: 6px; outline: none; font-size: 14px; }
        .flat-input:focus { border-color: #111; }
        
        .divider { height: 8px; background-color: #f8f9fa; border-top: 1px solid #f0f0f0; border-bottom: 1px solid #f0f0f0; }
        
        .inbox-section { padding: 0; }
        .inbox-header { display: flex; justify-content: space-between; align-items: center; padding: 15px; border-bottom: 1px solid #eee; position: sticky; top: 0; background: #fff; z-index: 10; }
        .inbox-title { font-size: 16px; font-weight: 700; display: flex; align-items: center; gap: 8px; }
        .inbox-badge { background: #111; color: #fff; font-size: 12px; font-weight: 600; padding: 2px 8px; border-radius: 12px; }
        
        .btn-refresh { background: transparent; border: 1px solid #ddd; border-radius: 20px; padding: 5px 12px; font-size: 12px; font-weight: 600; display: flex; align-items: center; cursor: pointer; color: #444; }
        .btn-refresh:active { background: #f0f0f0; }
        
        .empty-msg { text-align: center; padding: 50px 20px; color: #999; font-size: 14px; }
        .empty-icon { display: block; font-size: 40px; color: #ddd; margin-bottom: 10px; }
        
        /* DESAIN LIST EMAIL BISA DIKLIK */
        .email-item { border-bottom: 1px solid #eee; transition: background 0.2s; }
        .email-item.expanded { background-color: #fafafa; }
        
        .email-header-clickable { display: flex; justify-content: space-between; align-items: center; padding: 15px; cursor: pointer; user-select: none; }
        .email-header-clickable:active { background-color: #f0f0f0; }
        
        .email-info { flex: 1; overflow: hidden; }
        .email-sender { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #666; margin-bottom: 4px; }
        .email-sender .material-icons { font-size: 14px; color: #aaa; }
        .email-subject { font-size: 15px; font-weight: 700; color: #111; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding-right: 15px; }
        
        .email-toggle-icon { color: #888; display: flex; align-items: center; }
        
        .email-body-container { padding: 0 15px 20px 15px; }
        .email-iframe { width: 100%; height: 400px; border: 1px solid #e0e0e0; background: #fff; border-radius: 6px; display: block; }
      `}</style>
    </div>
  );
}
