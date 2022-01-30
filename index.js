const express = require("express")
const bodyParser = require("body-parser")
const cors = require("cors")
const mongoose = require("mongoose")
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
const User = require("./model/User")
const app = express();
require('dotenv').config()
app.use(cors())
app.use(bodyParser.json())
mongoose.connect(process.env.MONGODB)
.then(res=>{
    console.log("connection successsfull")
})
.catch(err=>{
    console.log(err)
})
app.post("/signup",async (req,res)=>{
    if(!req.body.email || !req.body.password || !req.body.name ){
        res.status(400).json({msg:"data missing"})
    }else{
        const presentUser = await User.find({email:req.body.email})
        console.log(presentUser)
        var hash = bcrypt.hashSync(req.body.password, 10);
        if(presentUser.length===0){
            const user = new User ({
                email:req.body.email,
                password:hash,
                name:req.body.name,
            })
           let responseOfUser = await user.save()
           console.log(responseOfUser)
           let token = jwt.sign({ user: req.body.email,_id:responseOfUser._id }, process.env.TOKENSECRET);
           res.status(201).json({msg:"user saved successfully",token})
        }else{
            res.status(400).json({msg:"user already exist"})
        }
    }
})

app.post("/login",async (req,res)=>{
    if(!req.body.email || !req.body.password){
        res.status(400).json({msg:"data missing"})
    }else{
        const presentUser = await User.findOne({email:req.body.email})
        if(!presentUser){
            res.status(400).json({msg:"User doesn't exists"})
        }else{
            bcrypt.compare(req.body.password, presentUser.password, function(err, response) {
                if(response){
                    let token = jwt.sign({user:req.body.email,_id:presentUser._id},process.env.TOKENSECRET)
                    res.status(200).json({msg:"success",token})
                }else{
                    res.status(400).json({msg:"incorrect password"})
                }
            });
            
        }
    }
})

app.listen(3002,(req,res)=>{
    console.log("server started on 3002");
})