import React from 'react';

const StatusLog = ({ logs }) => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Sending Status</h2>
            <div className="h-64 overflow-y-auto border rounded p-2 bg-gray-50">
                {logs.length === 0 ? (
                    <p className="text-gray-400 text-center mt-4">No logs yet...</p>
                ) : (
                    logs.map((log, index) => (
                        <div key={index} className={`mb-2 text-sm ${log.status === 'Sent' ? 'text-green-600' : 'text-red-600'}`}>
                            <span className="font-bold">[{log.email}]</span> {log.status} {log.error && `- ${log.error}`}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default StatusLog;
