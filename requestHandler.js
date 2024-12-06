
import adminSchema from "./models/admin.model.js"
import studentSchema from "./models/student.model.js"

import bcrypt from 'bcrypt'
import pkg from 'jsonwebtoken'
import nodemailer from 'nodemailer'





const transporter = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    secure: false, // Use `true` for port 465, `false` for all other ports
    auth: {
      user: "3bf1ace8b5aa81",
      pass: "23d9ae6b829afb",
    },
  });

const {sign} = pkg








export async function adminRegister(req,res) {

    const {name,username,number,email,password,cpassword}=req.body

    if(!(username&&password&&cpassword&&email))
        return res.status(404).send("fields are empty")

    if(password!==cpassword)
        return res.status(404).send("password not matched")

bcrypt.hash(password,10).then(async(hpassword)=>{
    adminSchema.create({name,username,number,password:hpassword,email,otp:""}).then(()=>{
        return res.status(201).send({msg:"successfully created"})

    })
    .catch((error)=>{
  return res.status(400).send({error:error})
    })
}).catch((error)=>{
    res.status(400).send({error:error})
})
    
}




export async function adminLogin(req,res){
    try {
        const {email, password}=req.body;
        const user=await adminSchema.findOne({email})
        if(user == null)return res.status(404).send({msg:"user not found"})
            const id = user._id
        const success= await bcrypt.compare(password,user.password);
        if(success!==true) return res.status(400).send({msg:"password not matched"})
            const token= await sign ({id,email},process.env.JWT_KEY,{expiresIn:"24h"})
        return res.status(200).send(token)
    } catch (error) {
        res.status(400).send({error:error})
    }
}











export async function Home(req,res){
    const {id,username}=req.user
    console.log(req.user);
    res.status(200).send({username})
}






export async function studentforget(req, res) {
    const { email } = req.body;
    console.log(email);

    try {
        const data = await studentSchema.findOne({ email: email });
        if (!data) {
            return res.status(400).send({ msg: "User not found" });
        }

        const otp = Math.floor(100000 + Math.random() * 900000);
        console.log(otp);

        data.otp = otp;
        await data.save();

        const info = await transporter.sendMail({
            from: 'peterspidy5@gmail.com', // sender address
            to: data.email, // list of receivers
            subject: "OTP Verification", // Subject line
            text: `Your OTP is ${otp}`, // plain text body
            html: `<b>${otp}</b>`, // HTML body
        });

        console.log("Message sent: %s", info.messageId);

        res.status(200).send({ msg: "OTP sent successfully" });
    } catch (error) {
        console.error("Error in studentforget function:", error);
        res.status(500).send({ msg: "An error occurred while processing your request" });
    }
}





export async function verifyOtp(req, res) {
    const { email, otp } = req.body;

    const data = await studentSchema.findOne({ email: email });
    if (!data) {
        return res.status(400).send({ msg: "User not found" });
    }

    if (data.otp === otp) {
        await data.save();

        return res.status(200).send({ msg: "OTP verified successfully" });
    } else {
        return res.status(400).send({ msg: "Invalid OTP" });
    }
}









export async function addstudent(req,res){
    console.log(req.body);
    const {student:{name,blood,stdid,password,email,div,number,otp},photo}=req.body;
    await studentSchema.create({name,blood,password,email,stdid,div,number,otp,photo})
    .then(()=>{res.status(201).send({message:"successfully added a staff"})})
    
    .catch((error)=>{res.status(400).send(error)})
}



export async function getstudent(req,res){
    console.log(req.user);
    const data= await studentSchema.find();
    try {
        res.status(200).send(data)

    } catch (error) {
        res.status(500).send(error)

    }
}

export async function getonestudent(req,res) {
    try {
        const {id}=req.params;
        console.log(id);
        const data = await studentSchema.findOne({_id:id})
        res.status(200).send(data)
    } catch (error) {
        res.status(400).send(error)
    }
}


export async function deletestudent(req,res){
    const {id}=req.params;
    const data= await studentSchema.deleteOne({_id:id});
    try {
        res.status(200).send({message:"successfully deleted the staff"})

    } catch (error) {
        res.status(400).send({error})

    }
}

export async function editstudent(req,res){
    const {id}=req.params;
    const data= await studentSchema.findOne({_id:id});
    try {
        res.status(200).send({data})

    } catch (error) {
        res.status(400).send({error})

    }
}


export async function updatestudent(req,res){
    const {id}=req.params;
    const {...data}=req.body
    await studentSchema.updateOne ({_id:id},{$set:{...data}});
    try {
        res.status(201).send({message:"successfully updated "})

    } catch (error) {
        res.status(400).send({error:error})

    }
}
