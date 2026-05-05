import { useState, useEffect } from 'react';
import config from '../config.json';

export default function Home() {
  const [emailAddress, setEmailAddress] = useState('');
  const [emails, setEmails] = useState([]);

  useEffect(() => {
    // Generate email acak
    const random = Math.random().toString(36).substring(2, 10);
    const fullEmail = `${random}@${config.domain}`;
    setEmailAddress(fullEmail);
    
    // Interval untuk cek email baru setiap 5 detik melalui API
    const interval = setInterval(() => {
      fetch(`/api/get-emails?address=${fullEmail}`)
        .then(res => res.json())
        .then(data => setEmails(data))
        .catch(err => console.error(err));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="content-wrapper">
      <div className="container trim-box">
        <div className="text-center" style={{ marginTop: '30px' }}>
          <h1 style={{ fontWeight: '700', fontSize: '24px' }}>{config.sitename}</h1>
          <p className="text-muted">Gunakan alamat ini untuk verifikasi:</p>
          
          <div className="email-box">
            <div className="input-group">
              <input type="text" className="form-control" value={emailAddress} readOnly style={{ fontWeight: 'bold' }} />
              <span className="input-group-btn">
                <button className="btn btn-primary">Salin</button>
              </span>
            </div>
          </div>

          <div style={{ marginTop: '30px' }} className="panel panel-default text-left">
            <div className="panel-heading"><b>Kotak Masuk</b></div>
            <div className="list-group">
              {emails.length === 0 ? (
                <div className="list-group-item text-center text-muted" style={{ padding: '40px' }}>
                  Belum ada email. Menunggu verifikasi...
                </div>
              ) : (
                emails.map((msg, index) => (
                  <div key={index} className="list-group-item">
                    <h4 className="list-group-item-heading" style={{ fontSize: '16px' }}>{msg.subject}</h4>
                    <p className="list-group-item-text text-muted">Dari: {msg.sender}</p>
                    <hr style={{ margin: '10px 0' }} />
                    <div dangerouslySetInnerHTML={{ __html: msg.body }} />
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
