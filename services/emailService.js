const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const sendEmail = async (config, recipient, subject, body, attachmentPath) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: config.email,
            pass: config.password
        }
    });

    const mailOptions = {
        from: config.email,
        to: recipient.email,
        subject: subject,
        html: body,
        attachments: []
    };

    if (attachmentPath) {
        if (fs.existsSync(attachmentPath)) {
            mailOptions.attachments.push({
                filename: path.basename(attachmentPath),
                path: attachmentPath
            });
        } else {
            console.error('El archivo adjunto no existe en la ruta:', attachmentPath);
            return { success: false, error: `Archivo adjunto no encontrado en la ruta: ${attachmentPath}` };
        }
    }

    try {
        const info = await transporter.sendMail(mailOptions);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending email:', error);
        return { success: false, error: error.message };
    }
};

const verifyConnection = async (config) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: config.email,
            pass: config.password
        }
    });

    try {
        await transporter.verify();
        return { success: true };
    } catch (error) {
        console.error('SMTP Verification Error:', error);
        return { success: false, error: error.message || error.response || 'Connection failed' };
    }
};

module.exports = {
    sendEmail,
    verifyConnection
};
