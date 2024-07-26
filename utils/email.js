const nodemailer = require('nodemailer');


const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER, // SMTP username
        pass: process.env.SMTP_PASS, // SMTP password
    },
});

async function sendOtpEmail(email, firstName, otp) {

    if (process.env.NODE_ENV === "development") {
        console.log(`Email SEND OTP: ${otp}, EMAIL: ${email}`);
        return
    }

    const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>OTP Verification</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                color: #333;
                background-color: #f4f4f4;
                margin: 0;
                padding: 0;
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
                background: #fff;
                padding: 20px;
                border-radius: 5px;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }
            .header {
                text-align: center;
                padding-bottom: 20px;
            }
            .header img {
                max-width: 150px;
            }
            .content {
                margin-bottom: 20px;
            }
            .content p {
                line-height: 1.5;
            }
            .otp {
                font-size: 24px;
                font-weight: bold;
                color: #007bff;
                margin: 20px 0;
                text-align: center;
            }
            .button {
                display: inline-block;
                padding: 10px 20px;
                font-size: 16px;
                font-weight: bold;
                color: #fff;
                background-color: #007bff;
                border-radius: 5px;
                text-decoration: none;
                text-align: center;
                margin: 20px 0;
            }
            .button:hover {
                background-color: #0056b3;
            }
            .footer {
                text-align: center;
                font-size: 12px;
                color: #888;
            }
            .footer a {
                color: #007bff;
                text-decoration: none;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <img src="https://res.cloudinary.com/desmvnmhr/image/upload/v1721815661/2_kizvzi.png" alt="Company Logo">
            </div>
            <div class="content">
                <h2>OTP Verification</h2>
                <p>Hi <strong>${firstName}</strong>,</p>
                <p>We received a request to verify your email address. To complete the process, please use the OTP below:</p>
                <div class="otp">${otp}</div>
                <p>To verify your email address, click the button below:</p>
                <a href="${process.env.FRONT_END_URL}/verify/${email}" class="button">Verify Now</a>
                <p>This OTP is valid for 10 minutes. If you did not request this verification, please ignore this email.</p>
            </div>
            <div class="footer">
                <p>&copy; ${new Date().getFullYear()} ${process.env.WEBSITE_NAME}. All rights reserved.</p>
                <p><a href="${process.env.FRONT_END_URL}">Visit our website</a></p>
            </div>
        </div>
    </body>
    </html>
    `;

    const mailOptions = {
        from: `"${process.env.WEBSITE_NAME}" <${process.env.SMTP_USER}>`, // sender address
        to: email,
        subject: `Welcome ${firstName}, OTP Verification.`,
        // text: `Your OTP code is ${otp}`,
        html: htmlContent,
    };

    try {
        let info = await transporter.sendMail(mailOptions);
        console.log('Message sent: %s', info.messageId);
    } catch (error) {
        console.error('Error sending OTP email:', error);
    }
}


const sendResetEmail = async (email, token) => {

    if (process.env.NODE_ENV === "development") {
        console.log(`Email SEND Token: ${token}, EMAIL: ${email}`);
        return
    }

    const resetLink = `${process.env.FRONT_END_URL}/reset-password?token=${token}&email=${email}`;

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            color: #333;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: #fff;
            padding: 20px;
            border-radius: 5px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            padding-bottom: 20px;
        }
        .content {
            margin-bottom: 20px;
        }
        .content p {
            line-height: 1.5;
        }
        .button {
            display: inline-block;
            padding: 10px 20px;
            font-size: 16px;
            font-weight: bold;
            color: #fff;
            background-color: #007bff;
            border-radius: 5px;
            text-decoration: none;
            text-align: center;
            margin: 20px 0;
        }
        .button:hover {
            background-color: #0056b3;
        }
        .footer {
            text-align: center;
            font-size: 12px;
            color: #888;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>Password Reset</h2>
        </div>
        <div class="content">
            <p>You requested a password reset</p>
            <p>Click the button below to reset your password</p>
            <a href="${resetLink}" class="button">Reset Password</a>
        </div>
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} ${process.env.WEBSITE_NAME}. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;


    const mailOptions = {
        from: `"${process.env.WEBSITE_NAME}" <${process.env.SMTP_USER}>`, // sender address
        to: email,
        subject: 'Password Reset',
        html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
};


module.exports = { sendOtpEmail, sendResetEmail }