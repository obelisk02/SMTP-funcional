import React, { useState } from 'react';

const SMTPConfig = ({ onConfigSave }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [status, setStatus] = useState('');

    const handleVerify = async () => {
        setStatus('Verifying...');
        try {
            const response = await fetch('http://localhost:10001/api/verify-smtp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();
            if (data.success) {
                setStatus('Verified ✅');
                onConfigSave({ email, password });
            } else {
                // Check for common Gmail errors to give better advice
                if (data.message && data.message.includes('Application-specific password')) {
                    setStatus('Error: App Password Required (see below)');
                    alert('Gmail requires an App Password because you have 2-Step Verification enabled.\n\nGo to Google Account > Security > 2-Step Verification > App Passwords to generate one.');
                } else {
                    setStatus(`Failed: ${data.message}`);
                }
            }
        } catch (error) {
            setStatus('Error connecting to server');
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800">SMTP Configuration (Gmail)</h2>
            <div className="grid grid-cols-1 gap-4">
                <input
                    type="email"
                    placeholder="Gmail Address"
                    className="border p-2 rounded w-full"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="App Password"
                    className="border p-2 rounded w-full"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <div className="flex justify-between items-center">
                    <button
                        onClick={handleVerify}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                    >
                        Verify & Save
                    </button>
                    <span className="text-sm font-medium">{status}</span>
                </div>
            </div>
        </div>
    );
};

export default SMTPConfig;
