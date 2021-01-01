//jshint esversion:6
require('dotenv').config()
const express=require('express')
const bodyParser=require('body-parser')
const ejs=require('ejs')
const mongoose=require('mongoose')
var encrypt = require('mongoose-encryption');

const app=express()

app.use(express.static("public"))
app.set("view engine","ejs")
app.use(bodyParser.urlencoded({extended:true}))

//db
mongoose.connect("mongodb://localhost/secrets",{useNewUrlParser: true, useUnifiedTopology: true})
//testing connection
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("connected succesfully to the db")
});

//db schema
const userSchema= mongoose.Schema({
    email:{
        type:String,
        required:true
    },
    password:{
        type:String, 
        required:true
    }
})

//mongoose encryptation
userSchema.plugin(encrypt, { secret: process.env.DB_ENCRYPTATION_KEY,encryptedFields: ['password'] });
//db model

const User=mongoose.model("User",userSchema)

//server

app.get("/",(req,res)=>{
res.render("home")
})
//login

app.get("/login",(req,res)=>{
    res.render("login")
    })

app.post("/login",(req,res)=>{
    const email=req.body.username
    const password=req.body.password
    User.findOne({email:email},(err, userFound)=>{
        if (err){
            console.log("user not found")
        }
        else{
            if(userFound){
                if(userFound.password === password)
                {
                    res.render("secrets")
                }
                else{
                    console.log("password doesn't match")
                }
            }
        }
    })
    })
//register
app.get("/register",(req,res)=>{
    res.render("register")
    })

app.post("/register",(req,res)=>{
    const email=req.body.username
    const password=req.body.password
    const user=new User({
        email:email,
        password:password
    })
    user.save((err,user)=>{
        if(err){
            console.log('Error while trying to insert user. Error: ',err)
        }
        else{
            console.log("user created succesfully",user)
        }
    })
    res.render("secrets")
    })

app.listen(process.env.PORT || 3000,()=>console.log("listening on port 3000"))