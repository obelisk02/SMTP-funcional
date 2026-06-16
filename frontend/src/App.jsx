import React, { useState } from 'react';
import SMTPConfig from './components/SMTPConfig';
import ExcelUploader from './components/ExcelUploader';
import EmailEditor from './components/EmailEditor';
import StatusLog from './components/StatusLog';

function App() {
  const [smtpConfig, setSmtpConfig] = useState(null);
  const [recipients, setRecipients] = useState([]);
  const [template, setTemplate] = useState({ subject: '', body: '' });
  const [logs, setLogs] = useState([]);
  const [isSending, setIsSending] = useState(false);
  
  // New State variables
  const [sendWithAttachments, setSendWithAttachments] = useState(true);
  const [verificationResult, setVerificationResult] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerifyAttachments = async () => {
    setIsVerifying(true);
    setVerificationResult(null);
    try {
      const response = await fetch('http://localhost:10001/api/verify-attachments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipients })
      });
      const data = await response.json();
      if (data.success) {
        setVerificationResult(data);
      } else {
        alert('Failed to verify attachments.');
      }
    } catch (error) {
      console.error('Error verifying attachments:', error);
      alert('Error verifying attachments');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSendBatch = async () => {
    if (!smtpConfig || recipients.length === 0) {
      alert('Please configure SMTP and upload recipients first.');
      return;
    }

    setIsSending(true);
    setLogs([]); // Clear previous logs

    try {
      const response = await fetch('http://localhost:10001/api/send-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config: smtpConfig,
          recipients,
          template,
          sendWithAttachments
        })
      });
      const data = await response.json();
      if (data.success) {
        setLogs(data.results);
      } else {
        alert('Error sending batch');
      }
    } catch (error) {
      console.error('Error sending batch:', error);
      alert('Error sending batch');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold text-blue-900 tracking-tight">Email Campaign Manager</h1>
          <p className="text-gray-600 mt-2">Send personalized emails with attachments easily.</p>
        </header>

        <SMTPConfig onConfigSave={setSmtpConfig} />

        <div className={`transition-opacity duration-500 ${smtpConfig ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
          <ExcelUploader onDataLoaded={(data) => {
             setRecipients(data);
             setVerificationResult(null); // Reset on new upload
          }} />

          {recipients.length > 0 && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded">
              <p className="text-blue-800 font-bold mb-3">Loaded {recipients.length} recipients.</p>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white p-3 rounded shadow-sm gap-2">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={handleVerifyAttachments} 
                    disabled={isVerifying}
                    className="bg-indigo-100 hover:bg-indigo-200 text-indigo-800 py-1.5 px-4 rounded font-semibold text-sm transition disabled:opacity-50"
                  >
                    {isVerifying ? 'Verifying...' : 'Verify Attachment Paths'}
                  </button>
                  {verificationResult && (
                     <span className="text-sm text-gray-700 bg-gray-50 px-2 py-1 rounded border border-gray-200">
                       Found: <strong className="text-green-600">{verificationResult.foundCount}</strong> | 
                       Missing: <strong className="text-red-500">{verificationResult.missingCount}</strong>
                     </span>
                  )}
                </div>

                <label className="flex items-center space-x-2 cursor-pointer text-sm font-medium text-gray-700 bg-gray-50 px-3 py-1.5 rounded border border-gray-200 hover:bg-gray-100 transition">
                  <input 
                    type="checkbox" 
                    checked={sendWithAttachments} 
                    onChange={e => setSendWithAttachments(e.target.checked)} 
                    className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                  />
                  <span>Send Attachments</span>
                </label>
              </div>
            </div>
          )}

          <EmailEditor onTemplateChange={setTemplate} />

          <div className="mb-6 text-center">
            <button
              onClick={handleSendBatch}
              disabled={isSending || recipients.length === 0}
              className={`px-8 py-3 rounded-full text-lg font-bold shadow-lg transform transition hover:scale-105 ${isSending
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700'
                }`}
            >
              {isSending ? 'Sending...' : '🚀 Send Campaign'}
            </button>
          </div>

          <StatusLog logs={logs} />
        </div>
      </div>
    </div>
  );
}

export default App;
