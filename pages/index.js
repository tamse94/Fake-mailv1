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
    localStorage.setItem('saved_email', newEmail);
    setEmail(newEmail);
    setInbox([]);
    setShowCustom(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(email);
    setCopyStatus('Tersalin!');
    setTimeout(() => setCopyStatus('Copy'), 2000);
  };

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

  useEffect(() => {
    if (!email) return;
    const interval = setInterval(fetchInbox, 10000);
    return () => clearInterval(interval);
  }, [email]);

  return (
    <div className="content-wrapper">
      <Head>
        <title>{config.sitename}</title>
      </Head>

      <div className="container trim-box">
        <div className="text-center" style={{ marginTop: '30px' }}>
          <h2 style={{ fontWeight: '700', marginBottom: '25px' }}>
            <span className="material-icons" style={{ verticalAlign: 'middle', marginRight: '5px' }}>mail</span>
            {config.sitename}
          </h2>

          {/* Bagian Email Display */}
          <div className="well" style={{ backgroundColor: '#fff', border: '1px solid #ddd' }}>
            <p className="text-muted small">Alamat Email Sementara:</p>
            <h4 style={{ wordBreak: 'break-all', fontWeight: '700', color: '#337ab7' }}>{email}</h4>
            
            <div className="btn-group btn-group-justified" style={{ marginTop: '15px' }}>
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
          </div>

          {/* Form Custom */}
          {showCustom && (
            <div className="well" style={{ padding: '10px' }}>
              <div className="input-group">
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="nama-email" 
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))}
                />
                <span className="input-group-btn">
                  <button className="btn btn-success" onClick={() => saveToStorage(`${customInput}@${config.domain}`)}>OK</button>
                </span>
              </div>
            </div>
          )}

          {/* Inbox Area */}
          <div className="panel panel-default text-left">
            <div className="panel-heading" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <b>Kotak Masuk</b>
              <button className="btn btn-xs btn-link" onClick={fetchInbox} disabled={loading}>
                <span className="material-icons" style={{ fontSize: '16px', verticalAlign: 'middle' }}>refresh</span> {loading ? 'Cek...' : 'Refresh'}
              </button>
            </div>
            <div className="list-group">
              {inbox.length === 0 ? (
                <div className="list-group-item text-center text-muted" style={{ padding: '40px' }}>
                  Belum ada email masuk...
                </div>
              ) : (
                inbox.map((msg, index) => (
                  <div key={index} className="list-group-item">
                    <p className="small text-primary" style={{ marginBottom: '5px' }}>Dari: {msg.sender}</p>
                    <h5 className="list-group-item-heading" style={{ fontWeight: '700' }}>{msg.subject}</h5>
                    <div style={{ marginTop: '10px', fontSize: '13px', whiteSpace: 'pre-wrap' }}>{msg.body}</div>
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
