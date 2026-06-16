const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { parseExcel } = require('../services/excelService');
const { sendEmail, verifyConnection } = require('../services/emailService');

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// Ensure uploads directory exists
const fs = require('fs');
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

// Verify SMTP Credentials
router.post('/verify-smtp', async (req, res) => {
    const config = req.body;
    const result = await verifyConnection(config);
    if (result.success) {
        res.json({ success: true, message: 'Connection verified successfully' });
    } else {
        res.status(400).json({ success: false, message: result.error });
    }
});

// Upload and Parse Excel
router.post('/upload-excel', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    try {
        const data = parseExcel(req.file.path);
        // Clean up file after parsing? Maybe keep it if needed later. 
        // For now, let's keep it simple and return the data.
        res.json({ success: true, data: data, filePath: req.file.path });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error parsing Excel file', error: error.message });
    }
});

// Download Template
router.get('/download-template', (req, res) => {
    const templatePath = path.join(__dirname, '../test_data.xlsx');
    if (fs.existsSync(templatePath)) {
        res.download(templatePath, 'test_data.xlsx');
    } else {
        res.status(404).json({ success: false, message: 'Template file not found' });
    }
});

// Verify Attachments
router.post('/verify-attachments', async (req, res) => {
    try {
        const { recipients } = req.body;
        if (!recipients || !Array.isArray(recipients)) {
            return res.json({ success: true, totalPaths: 0, foundCount: 0, missingCount: 0 });
        }

        let foundCount = 0;
        let missingCount = 0;
        let totalPaths = 0;

        for (const recipient of recipients) {
            let attachmentPath = null;
            for (const key in recipient) {
                if (key.trim().toLowerCase() === 'ruta del archivo' || key.trim().toLowerCase() === 'ruta') {
                    attachmentPath = recipient[key];
                    break;
                }
            }

            if (attachmentPath) {
                totalPaths++;
                attachmentPath = attachmentPath.toString().trim().replace(/^["']+|["']+$/g, '');
                if (fs.existsSync(attachmentPath)) {
                    foundCount++;
                } else {
                    missingCount++;
                }
            }
        }

        res.json({ success: true, totalPaths, foundCount, missingCount });
    } catch (error) {
        console.error('Error verifying attachments:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Send Batch Emails
router.post('/send-batch', async (req, res) => {
    try {
        const { config, template, recipients, sendWithAttachments } = req.body;
        // recipients is an array of objects from the excel

        if (!recipients || !Array.isArray(recipients)) {
            return res.status(400).json({ success: false, message: 'No recipients provided' });
        }

        const results = [];

        for (const recipient of recipients) {
            // Replace placeholders in body and subject
            let body = template.body || '';
            let subject = template.subject || '';
            // Improved replacement (case-insensitive, trims spaces, safe for special characters)
            for (const key in recipient) {
                const escapedKey = key.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const regex = new RegExp(`\\{\\s*${escapedKey}\\s*\\}`, 'gi');
                body = body.replace(regex, () => recipient[key] || '');
                subject = subject.replace(regex, () => recipient[key] || '');
            }

            // Determine attachment path dynamically (case-insensitive and ignoring spaces)
            let attachmentPath = null;

            // Only attach if sendWithAttachments is true or undefined (for backwards compatibility if frontend doesn't send it)
            if (sendWithAttachments !== false) {
                for (const key in recipient) {
                    if (key.trim().toLowerCase() === 'ruta del archivo' || key.trim().toLowerCase() === 'ruta') {
                        attachmentPath = recipient[key];
                        break;
                    }
                }

                if (attachmentPath) {
                    // Trim whitespace and remove surrounding quotes (e.g., from Windows copy-path)
                    attachmentPath = attachmentPath.toString().trim().replace(/^["']+|["']+$/g, '');
                }
            }

            const emailVal = Object.keys(recipient).find(k => k.trim().toLowerCase() === 'email') ? recipient[Object.keys(recipient).find(k => k.trim().toLowerCase() === 'email')] : recipient['Email'];
            const result = await sendEmail(config, { email: emailVal }, subject, body, attachmentPath);

            // Use exact email case to push to results array, handling dynamic Email column as well
            const emailKey = Object.keys(recipient).find(k => k.trim().toLowerCase() === 'email') || 'Email';
            results.push({ email: recipient[emailKey], status: result.success ? 'Sent' : 'Failed', error: result.error });
        }

        res.json({ success: true, results: results });
    } catch (error) {
        console.error('Error sending batch:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
