// import nodemailer from "nodemailer";

// export const generateOTP = () => {
//     return Math.floor(1000 + Math.random() * 9000);
// }

// export const mailSender = async (Otp)=>{
//     let transporter = nodemailer.createTransport({
//         host: 'smtp.gmail.com', // Your SMTP host
//         port: 587,
//         secure: false, // true for 465, false for other ports
//         auth: {
//             user: 'rafikpmty@gmail.com', // Your email address
//             pass: 'gxbwbnicdhrdkcsi' // Your email password
//         }
//     });


//     let mailOptions = {
//         from: '"Rafi" <rafikp@gmail.com>', // Sender address
//         to: req.session.email, // List of recipients
//         subject: 'Hello ✔', // Subject line
//         text: 'Hello world?', // Plain text body
//         html: `<b>Your OTP is : ${Otp}</b>` // HTML body
//     };

//     return { transporter, mailOptions };
// }