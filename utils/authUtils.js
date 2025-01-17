const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");

const validateEmail = ({key}) => {
    const  isEmail = 
      
      (
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      ,key);
      return isEmail;
  };






const varifiedUser = ({name,email,username,password})=>{
return new Promise((res,rej)=>{
if(!name){
rej("name field is empty");
}


if(!email){
    
        rej("email field is empty");
    }
if(!username){
      
            rej("username field is empty");
        }
if(!password){
          
                rej("password field is empty");
            
            }
if(password.length<3 || password.length>50){
   
        rej("password must be between 3 and 50 characters")
}
if(!validateEmail({key:email})){
    rej("email format is not valid");
   }
res();
})
}



const loginValidation=({loginID,password})=>{
    if(!loginID || !password){
        return new Promise((res,rej)=>{
            rej("please fill out all the fields");
        })
    }
    if(typeof loginID !=='string'){
        return new Promise((res,rej)=>{
            rej("email type is not text");
        })
    }
    if(typeof password !=="string"){
        return new Promise((res,rej)=>{
            rej("password is not type text");
        })
    }
    
}
//jwt email varification
const generateToken=(email)=>{
    const token =jwt.sign(email,process.env.SECRET_KEY);
    console.log(token);
    return token;
}
//send mail to user

const sendVerificationMail=(email,token)=>{
  
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port:465,
        secure:true,
        service:"gmail",
        auth:{
            user:"sadianaaz110@gmail.com",
            pass:"isak mcul azio yftt",
        }
    })

const mailOptions={
    from:"sadianaaz110@gmail.com",
    to:email,
    subject:"verify your email",
    html:`<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <title>Todo App</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  
    <style type="text/css">
      a[x-apple-data-detectors] {color: inherit !important;}
    </style>
  
  </head>
  <body style="margin: 0; padding: 0;">
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td style="padding: 20px 0 30px 0;">
  
  <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="border-collapse: collapse; border: 1px solid #cccccc;">
    <tr>
      <td align="center" bgcolor="#defcf9" style="padding: 40px 0 30px 0;">
        <img src="https://www.jotform.com/blog/wp-content/uploads/2020/01/email-marketing-intro-02-700x544.png" alt="logo" width="300" height="230" style="display: block;" />
      </td>
    </tr>
    <tr>
      <td bgcolor="#ffffff" style="padding: 40px 30px 40px 30px;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;">
          <tr>
            <td style="color: #00adb5; font-family: Arial, sans-serif;">
              <h3 style="font-size: 24px; margin: 0; margin-bottom:6px; text-align:center; font-family: Montserrat, sans-serif;">Hey</h3>
              <h3 style="font-size: 24px; margin: 0; text-align:center; "color: #00adb5;  font-family: Montserrat, sans-serif;">Activate your Email</h3>
            </td>
          </tr>
          <tr>
            <td style="color: #153643; font-family: Arial, sans-serif; font-size: 16px; line-height: 24px; padding: 20px 0 30px 0;">
            <a href="http://localhost:8000/verify/${token}" style=" border: none;
            background-color: #ef7e5c;
    color: white;
    padding: 15px 32px;
    text-align: center;
  
    text-decoration: none;
    display: inline-block;
    font-size: 16px;
    margin: 4px 175px;
    cursor: pointer;
    border-radius:5px;">Activate Account</a>
            </td>
  
        </table>
      </td>
    </tr>
    <tr>
      <td bgcolor="#ef7e5c" style="padding: 30px 30px;">
          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;">
          <tr>
            <td style="color: #ffffff; font-family: Arial, sans-serif; font-size: 14px;">
              <p style="margin: 0;">&reg; Someone, somewhere 2021<br/>
             <a href="" style="color: #ffffff;">Subscribe</a> to us!</p>
            </td>
            </tr>
        </table>
      </td>
    </tr>
    </table>
  
        </td>
      </tr>
    </table>
  </body>`,
  };
transporter.sendMail(mailOptions, function(err,info){
    if(err){
        console.log(err);
    }else{
        console.log(`Email has been sent successfully:${email} ` + info.response);
    }
});  console.log("mail has been sent")
}
module.exports = {varifiedUser,loginValidation,validateEmail,generateToken,sendVerificationMail};