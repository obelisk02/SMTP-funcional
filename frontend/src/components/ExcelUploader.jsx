import React, { useState } from 'react';

const ExcelUploader = ({ onDataLoaded }) => {
    const [fileName, setFileName] = useState('');

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setFileName(file.name);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('http://localhost:10001/api/upload-excel', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            if (data.success) {
                onDataLoaded(data.data);
            } else {
                alert('Failed to upload file');
            }
        } catch (error) {
            console.error('Error uploading file:', error);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6 relative">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Upload Excel Data</h2>
            <button 
                onClick={() => window.open('http://localhost:10001/api/download-template', '_blank')}
                className="absolute top-6 right-6 text-xs bg-gray-100 border border-gray-300 hover:bg-gray-200 text-gray-700 py-1 px-3 rounded shadow-sm transition"
            >
                ⬇ Download Template
            </button>
            <div className="border-2 border-dashed border-gray-300 p-6 rounded-lg text-center hover:border-blue-500 transition cursor-pointer relative">
                <input
                    type="file"
                    accept=".xlsx, .xls"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <p className="text-gray-600">
                    {fileName ? `Selected: ${fileName}` : 'Drag & drop or click to upload Excel file'}
                </p>
            </div>
        </div>
    );
};

export default ExcelUploader;
