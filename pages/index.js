import { useState, useEffect } from 'react';
import config from '../config.json';

export default function Home() {
  const [emailAddress, setEmailAddress] = useState('');
  const [emails, setEmails] = useState([]);
  const [copyStatus, setCopyStatus] = useState('Copy');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customName, setCustomName] = useState('');

  // 1. Fungsi Create (Acak)
  const handleCreateRandom = () => {
    const random = Math.random().toString(36).substring(2, 10);
    setEmailAddress(`${random}@${config.domain}`);
    setShowCustomInput(false);
    setCopyStatus('Copy');
    setEmails([]); // Bersihkan inbox saat buat email baru
  };

  // 2. Fungsi Custom Email
  const handleSaveCustom = () => {
    if (customName.trim() === '') return;
    // Bersihkan karakter aneh dan spasi agar valid jadi email
    const cleanName = customName.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setEmailAddress(`${cleanName}@${config.domain}`);
    setShowCustomInput(false);
    setCopyStatus('Copy');
    setEmails([]);
  };

  // 3. Fungsi Copy tanpa Alert JS
  const handleCopy = () => {
    if (!emailAddress) return;
    navigator.clipboard.writeText(emailAddress);
    setCopyStatus('Tersalin!');
    // Kembalikan teks tombol ke "Copy" setelah 2 detik
    setTimeout(() => setCopyStatus('Copy'), 2000);
  };

  // 4. Fungsi Refresh Manual & Otomatis
  const handleRefresh = () => {
    if (!emailAddress) return;
    fetch(`/api/get-emails?address=${emailAddress}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setEmails(data);
      })
      .catch(err => console.error(err));
  };

  // Cek email otomatis setiap 5 detik HANYA JIKA email sudah dibuat
  useEffect(() => {
    if (!emailAddress) return;
    const interval = setInterval(handleRefresh, 5000);
    return () => clearInterval(interval);
  }, [emailAddress]);

  return (
    <div className="content-wrapper">
      <div className="container trim-box">
        <div className="text-center" style={{ marginTop: '20px' }}>
          
          <h3 style={{ fontWeight: '700', marginBottom: '20px', color: '#333' }}>
            <span className="material-icons" style={{ verticalAlign: 'middle', fontSize: '28px', marginRight: '8px' }}>mail_outline</span>
            {config.sitename}
          </h3>
          
          {/* Box Panel Kontrol (Bostrap 3) */}
          <div className="panel panel-default text-left" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div className="panel-body">
              <p className="text-muted" style={{ fontSize: '13px', marginBottom: '15px' }}>Pilih metode pembuatan alamat email sementara Anda:</p>
              
              {/* Grup Tombol Auto & Custom */}
              <div className="btn-group btn-group-justified" style={{ marginBottom: '20px' }}>
                <a href="#" className="btn btn-primary" onClick={(e) => { e.preventDefault(); handleCreateRandom(); }}>
                  <span className="material-icons" style={{ verticalAlign: 'middle', fontSize: '16px' }}>autorenew</span> Auto
                </a>
                <a href="#" className="btn btn-default" onClick={(e) => { e.preventDefault(); setShowCustomInput(!showCustomInput); }}>
                  <span className="material-icons" style={{ verticalAlign: 'middle', fontSize: '16px' }}>edit</span> Custom
                </a>
              </div>

              {/* Area Input Custom (Tersembunyi sampai tombol Custom diklik) */}
              {showCustomInput && (
                <div className="input-group" style={{ marginBottom: '20px' }}>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Nama (misal: boss12)" 
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                  />
                  <span className="input-group-addon" style={{ padding: '6px 10px', fontSize: '12px' }}>@{config.domain}</span>
                  <span className="input-group-btn">
                    <button className="btn btn-success" onClick={handleSaveCustom}>Buat</button>
                  </span>
                </div>
              )}

              {/* Input Group untuk Menampilkan Email & Copy */}
              <div className="form-group" style={{ marginBottom: '0' }}>
                <label style={{ fontSize: '13px', color: '#555' }}>Alamat Email Anda:</label>
                <div className="input-group input-group-lg">
                  <input 
                    type="text" 
                    className="form-control text-center" 
                    value={emailAddress || 'Klik Auto atau Custom'} 
                    readOnly 
                    style={{ 
                      fontWeight: '600', 
                      backgroundColor: emailAddress ? '#e8f4f8' : '#f5f5f5', 
                      color: emailAddress ? '#000' : '#aaa',
                      fontSize: '15px'
                    }} 
                  />
                  <span className="input-group-btn">
                    <button 
                      className={`btn ${copyStatus === 'Copy' ? 'btn-default' : 'btn-success'}`} 
                      onClick={handleCopy}
                      disabled={!emailAddress}
                      style={{ transition: 'all 0.3s' }}
                    >
                      <span className="material-icons" style={{ verticalAlign: 'middle', fontSize: '18px' }}>
                        {copyStatus === 'Copy' ? 'content_copy' : 'check'}
                      </span> {copyStatus}
                    </button>
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* Box Panel Inbox (Bostrap 3) */}
          <div className="panel panel-default text-left" style={{ marginTop: '15px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div className="panel-heading" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>
                <span className="material-icons" style={{ verticalAlign: 'middle', fontSize: '18px', marginRight: '5px' }}>inbox</span> 
                <b>Kotak Masuk</b>
              </span>
              <button className="btn btn-xs btn-default" onClick={handleRefresh} disabled={!emailAddress}>
                <span className="material-icons" style={{ verticalAlign: 'middle', fontSize: '14px' }}>refresh</span> Segarkan
              </button>
            </div>
            
            <div className="list-group" style={{ marginBottom: '0' }}>
              {!emailAddress ? (
                // Tampilan jika belum buat email
                <div className="list-group-item text-center text-muted" style={{ padding: '40px 15px' }}>
                  <span className="material-icons" style={{ fontSize: '40px', color: '#ddd' }}>hourglass_empty</span>
                  <p style={{ marginTop: '10px', fontSize: '13px' }}>Silakan buat alamat email terlebih dahulu.</p>
                </div>
              ) : emails.length === 0 ? (
                // Tampilan jika inbox kosong
                <div className="list-group-item text-center text-muted" style={{ padding: '40px 15px' }}>
                  <div style={{ marginBottom: '10px' }}>
                    <span className="material-icons" style={{ fontSize: '30px', color: '#337ab7' }}>mark_email_unread</span>
                  </div>
                  <p style={{ fontSize: '13px' }}>Menunggu email masuk ke<br/><b>{emailAddress}</b>...</p>
                </div>
              ) : (
                // Tampilan Daftar Email
                emails.map((msg, index) => (
                  <div key={index} className="list-group-item">
                    <h4 className="list-group-item-heading" style={{ fontSize: '15px', fontWeight: 'bold' }}>
                      {msg.subject || 'Tanpa Subjek'}
                    </h4>
                    <p className="list-group-item-text text-muted" style={{ fontSize: '12px', marginBottom: '10px' }}>
                      <span className="material-icons" style={{ verticalAlign: 'middle', fontSize: '14px' }}>person</span> Dari: {msg.sender}
                    </p>
                    <div style={{ 
                      fontSize: '13px', 
                      backgroundColor: '#f9f9f9', 
                      padding: '12px', 
                      borderRadius: '4px', 
                      border: '1px solid #eee',
                      overflowX: 'auto'
                    }} dangerouslySetInnerHTML={{ __html: msg.body }} />
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
