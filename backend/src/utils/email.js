const nodemailer = require('nodemailer');
const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

// Email transporter configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

/**
 * Generate QR Code for ticket verification
 */
async function generateQRCode(ticketNumber) {
  const verificationUrl = `${process.env.FRONTEND_URL}/search?ticket=${ticketNumber}`;
  try {
    return await QRCode.toDataURL(verificationUrl);
  } catch (error) {
    console.error('QR Code generation error:', error);
    throw error;
  }
}

/**
 * Generate PDF ticket
 */
async function generatePDFTicket(ticket) {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks = [];
      
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Header with branding
      doc.fontSize(28)
         .fillColor('#DC2626')
         .text('Nepal Loto 6', { align: 'center' })
         .moveDown(0.5);

      doc.fontSize(16)
         .fillColor('#000000')
         .text('Official Lottery Ticket', { align: 'center' })
         .moveDown(2);

      // Ticket number (prominent)
      doc.fontSize(12)
         .fillColor('#666666')
         .text('Ticket Number:', { continued: false })
         .moveDown(0.3);
      
      doc.fontSize(20)
         .fillColor('#DC2626')
         .text(ticket.ticketNumber, { align: 'left' })
         .moveDown(1.5);

      // Ticket details
      doc.fontSize(12)
         .fillColor('#000000')
         .text(`Name: ${ticket.name}`, { align: 'left' })
         .moveDown(0.5)
         .text(`Email: ${ticket.email}`, { align: 'left' })
         .moveDown(0.5)
         .text(`Purchase Date: ${new Date(ticket.createdAt).toLocaleString()}`, { align: 'left' })
         .moveDown(1.5);

      // Selected numbers (highlighted)
      doc.fontSize(14)
         .fillColor('#DC2626')
         .text('Your Selected Numbers:', { align: 'left' })
         .moveDown(0.5);

      doc.fontSize(32)
         .fillColor('#000000')
         .text(ticket.selectedNumbers.sort((a, b) => a - b).join('  -  '), { align: 'center' })
         .moveDown(2);

      // QR Code
      const qrCode = await generateQRCode(ticket.ticketNumber);
      const qrImageBuffer = Buffer.from(qrCode.split(',')[1], 'base64');
      
      doc.fontSize(10)
         .fillColor('#666666')
         .text('Scan QR Code to verify your ticket:', { align: 'center' })
         .moveDown(0.5);
      
      doc.image(qrImageBuffer, doc.page.width / 2 - 75, doc.y, { width: 150, height: 150 })
         .moveDown(10);

      // Footer
      doc.fontSize(10)
         .fillColor('#999999')
         .text('This is an official Nepal Loto ticket. Keep it safe.', { align: 'center' })
         .moveDown(0.3)
         .text('For verification, visit: ' + process.env.FRONTEND_URL + '/search', { align: 'center' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Send ticket via email
 */
async function sendTicketEmail(ticket, pdfBuffer) {
  const mailOptions = {
    from: `"Nepal Loto 6" <${process.env.GMAIL_USER}>`,
    to: ticket.email,
    subject: `Your Nepal Loto 6 Ticket - ${ticket.ticketNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #DC2626, #991B1B); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .ticket-number { font-size: 24px; color: #DC2626; font-weight: bold; margin: 20px 0; text-align: center; }
          .numbers { font-size: 28px; text-align: center; margin: 20px 0; padding: 20px; background: white; border-radius: 10px; border: 2px solid #DC2626; }
          .info { margin: 15px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">🎫 Nepal Loto 6</h1>
            <p style="margin: 10px 0 0 0;">Your Ticket is Confirmed!</p>
          </div>
          <div class="content">
            <h2>Thank you for your purchase, ${ticket.name}!</h2>
            <p>Your ticket has been successfully generated and confirmed.</p>
            
            <div class="ticket-number">
              Ticket Number: ${ticket.ticketNumber}
            </div>
            
            <div class="numbers">
              ${ticket.selectedNumbers.sort((a, b) => a - b).join(' - ')}
            </div>
            
            <div class="info">
              <strong>Draw:</strong> Nepal Loto 6<br>
              <strong>Purchase Date:</strong> ${new Date(ticket.createdAt).toLocaleString()}<br>
              <strong>Status:</strong> PAID
            </div>
            
            <p style="margin-top: 30px;">
              <strong>📎 Your ticket PDF is attached to this email.</strong><br>
              Please keep it safe for verification.
            </p>
            
            <p>
              You can also verify your ticket online at:<br>
              <a href="${process.env.FRONTEND_URL}/search">${process.env.FRONTEND_URL}/search</a>
            </p>
            
            <div class="footer">
              <p>Good luck! 🍀</p>
              <p>Nepal Loto 6 - Official Lottery System</p>
              <p>This is an automated email. Please do not reply.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
    attachments: [
      {
        filename: `ticket_${ticket.ticketNumber}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf'
      }
    ]
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${ticket.email}`);
  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
  }
}

module.exports = {
  generateQRCode,
  generatePDFTicket,
  sendTicketEmail
};
