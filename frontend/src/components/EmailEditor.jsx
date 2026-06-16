import React, { useState } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const EmailEditor = ({ onTemplateChange }) => {
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');

    const handleBodyChange = (value) => {
        setBody(value);
        onTemplateChange({ subject, body: value });
    };

    const handleSubjectChange = (e) => {
        setSubject(e.target.value);
        onTemplateChange({ subject: e.target.value, body });
    };

    const insertPlaceholderBody = (placeholder) => {
        const newValue = body + ` {${placeholder}} `;
        setBody(newValue);
        onTemplateChange({ subject, body: newValue });
    };

    const insertPlaceholderSubject = (placeholder) => {
        setSubject(prev => prev + ` {${placeholder}} `);
        onTemplateChange({ subject: subject + ` {${placeholder}} `, body });
    };

    const fields = ['Nombre', 'Apellido 1', 'Apellido 2', 'Folio', 'Url'];

    const quillModules = {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            ['link'],
            ['clean']
        ]
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Compose Email</h2>
            <div className="mb-4">
                <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-medium text-gray-700">Subject</label>
                    <div className="space-x-1">
                        <span className="text-[10px] text-gray-500 uppercase tracking-wide">Insert Var:</span>
                        {fields.map(field => (
                            <button
                                key={`sub-${field}`}
                                onClick={() => insertPlaceholderSubject(field)}
                                className="bg-gray-100 border border-gray-300 hover:bg-gray-200 text-[10px] px-1.5 py-0.5 rounded text-gray-700 transition"
                            >
                                {field}
                            </button>
                        ))}
                    </div>
                </div>
                <input
                    type="text"
                    className="w-full border p-2 rounded"
                    value={subject}
                    onChange={handleSubjectChange}
                />
            </div>
            <div className="mb-4">
                <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-medium text-gray-700">Body</label>
                    <div className="space-x-1">
                        <span className="text-[10px] text-gray-500 uppercase tracking-wide">Insert Var:</span>
                        {fields.map(field => (
                            <button
                                key={`body-${field}`}
                                onClick={() => insertPlaceholderBody(field)}
                                className="bg-gray-100 border border-gray-300 hover:bg-gray-200 text-[10px] px-1.5 py-0.5 rounded text-gray-700 transition"
                            >
                                {field}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="bg-white">
                    <ReactQuill 
                        theme="snow"
                        value={body}
                        onChange={handleBodyChange}
                        modules={quillModules}
                        className="h-48 mb-12"
                    />
                </div>
            </div>
        </div>
    );
};

export default EmailEditor;
