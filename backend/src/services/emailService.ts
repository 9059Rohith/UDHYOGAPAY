import nodemailer from 'nodemailer';

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

interface WorkerCredentialsEmailData {
  personalEmail: string;
  name: string;
  workEmail: string;
  password: string;
  profession: string;
}

export const sendWorkerCredentialsEmail = async (data: WorkerCredentialsEmailData) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"Udhyoga Pay" <${process.env.EMAIL_USER}>`,
      to: data.personalEmail,
      subject: '🎉 Welcome to Udhyoga Pay - Your Account is Approved!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .content {
              background: #f9f9f9;
              padding: 30px;
              border: 1px solid #e0e0e0;
            }
            .credentials-box {
              background: white;
              border: 2px solid #667eea;
              border-radius: 8px;
              padding: 20px;
              margin: 20px 0;
            }
            .credential-item {
              margin: 15px 0;
              padding: 10px;
              background: #f0f0f0;
              border-radius: 5px;
            }
            .credential-label {
              font-weight: bold;
              color: #667eea;
              font-size: 14px;
            }
            .credential-value {
              font-size: 16px;
              color: #333;
              font-family: monospace;
              background: white;
              padding: 8px;
              border-radius: 4px;
              margin-top: 5px;
              word-break: break-all;
            }
            .button {
              display: inline-block;
              background: #667eea;
              color: white;
              padding: 15px 30px;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
              font-weight: bold;
            }
            .footer {
              background: #333;
              color: white;
              padding: 20px;
              text-align: center;
              border-radius: 0 0 10px 10px;
              font-size: 14px;
            }
            .warning {
              background: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 15px;
              margin: 20px 0;
            }
            .steps {
              background: white;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
            }
            .step {
              margin: 10px 0;
              padding-left: 30px;
              position: relative;
            }
            .step::before {
              content: "✓";
              position: absolute;
              left: 0;
              background: #28a745;
              color: white;
              width: 20px;
              height: 20px;
              border-radius: 50%;
              text-align: center;
              line-height: 20px;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🎉 Congratulations ${data.name}!</h1>
            <p>Your worker application has been approved</p>
          </div>
          
          <div class="content">
            <p>Dear ${data.name},</p>
            
            <p>We are excited to inform you that your application for the position of <strong>${data.profession}</strong> has been approved!</p>
            
            <div class="credentials-box">
              <h3 style="margin-top: 0; color: #667eea;">📧 Your Login Credentials</h3>
              
              <div class="credential-item">
                <div class="credential-label">Work Email:</div>
                <div class="credential-value">${data.workEmail}</div>
              </div>
              
              <div class="credential-item">
                <div class="credential-label">Password:</div>
                <div class="credential-value">${data.password}</div>
              </div>
            </div>
            
            <div class="warning">
              <strong>⚠️ Important:</strong> Please keep these credentials safe and do not share them with anyone. We recommend changing your password after your first login.
            </div>
            
            <div class="steps">
              <h3 style="margin-top: 0;">📋 Next Steps:</h3>
              <div class="step">Visit the Udhyoga Pay login page</div>
              <div class="step">Click on "Worker" login option</div>
              <div class="step">Enter your work email and password</div>
              <div class="step">Complete your profile setup</div>
              <div class="step">Start accepting bookings and earning!</div>
            </div>
            
            <center>
              <a href="${process.env.FRONTEND_URL}/login" class="button">Login to Udhyoga Pay</a>
            </center>
            
            <p style="margin-top: 30px;">If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
            
            <p>Best regards,<br>
            <strong>The Udhyoga Pay Team</strong></p>
          </div>
          
          <div class="footer">
            <p>© 2026 Udhyoga Pay. All rights reserved.</p>
            <p>Made with ❤️ in India</p>
            <p style="font-size: 12px; margin-top: 10px;">
              If you didn't apply for this position, please ignore this email or contact us immediately.
            </p>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error('❌ Email sending failed:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

export const sendApplicationRejectionEmail = async (
  personalEmail: string,
  name: string,
  reason: string
) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"Udhyoga Pay" <${process.env.EMAIL_USER}>`,
      to: personalEmail,
      subject: 'Update on Your Udhyoga Pay Application',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: #f44336;
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .content {
              background: #f9f9f9;
              padding: 30px;
              border: 1px solid #e0e0e0;
            }
            .footer {
              background: #333;
              color: white;
              padding: 20px;
              text-align: center;
              border-radius: 0 0 10px 10px;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Application Update</h1>
          </div>
          
          <div class="content">
            <p>Dear ${name},</p>
            
            <p>Thank you for your interest in joining Udhyoga Pay. After careful review of your application, we regret to inform you that we are unable to approve your application at this time.</p>
            
            <p><strong>Reason:</strong> ${reason}</p>
            
            <p>We encourage you to reapply in the future once you meet our requirements.</p>
            
            <p>Best regards,<br>
            <strong>The Udhyoga Pay Team</strong></p>
          </div>
          
          <div class="footer">
            <p>© 2026 Udhyoga Pay. All rights reserved.</p>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Rejection email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error('❌ Email sending failed:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

interface PasswordResetEmailData {
  email: string;
  name: string;
  resetUrl: string;
  role: string;
}

export const sendPasswordResetEmail = async (data: PasswordResetEmailData) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"Udhyoga Pay" <${process.env.EMAIL_USER}>`,
      to: data.email,
      subject: '🔐 Password Reset Request - Udhyoga Pay',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .content {
              background: #f9f9f9;
              padding: 30px;
              border: 1px solid #e0e0e0;
            }
            .reset-box {
              background: white;
              border: 2px solid #667eea;
              border-radius: 8px;
              padding: 20px;
              margin: 20px 0;
              text-align: center;
            }
            .button {
              display: inline-block;
              background: #667eea;
              color: white;
              padding: 15px 30px;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
              font-weight: bold;
            }
            .warning {
              background: #fff3cd;
              border: 1px solid #ffc107;
              border-radius: 5px;
              padding: 15px;
              margin: 15px 0;
            }
            .footer {
              background: #333;
              color: white;
              padding: 20px;
              text-align: center;
              border-radius: 0 0 10px 10px;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🔐 Password Reset Request</h1>
          </div>
          
          <div class="content">
            <h2>Hello ${data.name},</h2>
            
            <p>We received a request to reset the password for your <strong>${data.role}</strong> account on Udhyoga Pay.</p>
            
            <div class="reset-box">
              <p>Click the button below to reset your password:</p>
              <a href="${data.resetUrl}" class="button">Reset Password</a>
              <p style="margin-top: 15px; font-size: 12px; color: #666;">
                Or copy and paste this link in your browser:<br>
                <span style="word-break: break-all;">${data.resetUrl}</span>
              </p>
            </div>
            
            <div class="warning">
              <strong>⚠️ Important:</strong>
              <ul style="margin: 5px 0; padding-left: 20px;">
                <li>This link will expire in <strong>10 minutes</strong></li>
                <li>If you didn't request this reset, please ignore this email</li>
                <li>Your password will remain unchanged</li>
              </ul>
            </div>
            
            <p>If you're having trouble with the button above, copy and paste the URL below into your web browser:</p>
            <p style="word-break: break-all; background: #f0f0f0; padding: 10px; border-radius: 5px; font-size: 12px;">
              ${data.resetUrl}
            </p>
          </div>
          
          <div class="footer">
            <p>© 2026 Udhyoga Pay. All rights reserved.</p>
            <p>This is an automated email. Please do not reply.</p>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Password reset email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error('❌ Email sending failed:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};
