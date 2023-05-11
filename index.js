const express = require('express');
const path = require('path');
const app = express();
const Job = require('./models/job');
// const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bodyParser = require('body-parser')
const multer = require('multer');
require('dotenv').config();

let port = process.env.PORT || 2001;

const username = process.env.DB_USER_NAME;
const pass = process.env.DB_PASSWORD;

mongoose.connect(`mongodb+srv://${username}:${pass}@jobsboard.f0kcy0f.mongodb.net/?retryWrites=true&w=majority`)
.then(()=>{console.log("connected db")})
.catch(err => console.log(err));

app.use(express.static(path.join(__dirname, 'public')));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({urlencoded: false}));
// app.use(express.urlencoded({ extended: false }));


// const upload = multer({
//     storage: multer.diskStorage({
//         destination: (req, file, cb)=> {cb(null, './images')},
//         filename: (req,file,cb)=>{cb(null, Date.now()+ '--' + file.originalname)}
//     })
//   });

const storage = multer.diskStorage({
    destination: (req, file, cb)=> {cb(null, './public/uploads')},
    filename: (req,file,cb)=>{cb(null, Date.now()+ '--' + file.originalname)}
})

const upload = multer({storage: storage});

app.get('/', async (req,res)=>{
//  res.sendFile(path.join(__dirname , 'LandingPage.html'));
    try {
        const Jobs = await Job.find().sort('-createdAt');
        res.render('LandingPage', { Jobs });
      } catch (error) {
        console.error(error);
        res.sendStatus(500);
      }

});


app.get('/searchFrom', (req,res)=>{

});


app.get('/postJob', (req,res)=>{
    res.sendFile(path.join(__dirname , 'newJob.html'));
});

app.post('/addJob',upload.single('photo'), async (req,res)=>{
    const {companyName, primaryRole,position, jobDescription, jobAction, jobRequirements, keywords, email, website, currency, amount, location } = req.body;
    let requirements = jobRequirements.split(',');
    for(let i=0; i< requirements.length; i++){
        requirements[i] = requirements[i].charAt(0).toUpperCase() + requirements[i].slice(1);
    }
    let action = jobAction.split(',');
    for(let i=0; i< action.length; i++){
        action[i] = action[i].charAt(0).toUpperCase() + action[i].slice(1);
    }
    let keywordsArray = keywords.split(',');
    for(let i=0; i< keywordsArray.length; i++){
        keywordsArray[i] = keywordsArray[i].charAt(0).toUpperCase() + keywordsArray[i].slice(1);
    }
    let re = req.body.remote;
    let remote;
    if(re == undefined){
        remote = '';
    }
    else{
        remote = 'Remote';
    }
    console.log(req.body);
    console.log(keywords);
    console.log(keywordsArray);
    console.log(action);
    console.log(requirements);

    
    
    try {
        // let photo = req.file ? req.file.filename : undefined;
        let job = new Job(
            {
                companyName: companyName.charAt(0).toUpperCase() + companyName.slice(1) ,
                role:primaryRole.charAt(0).toUpperCase() + primaryRole.slice(1),
                position: position.charAt(0).toUpperCase() + position.slice(1),
                description:jobDescription.charAt(0).toUpperCase() + jobDescription.slice(1),
                action: action,
                requirements: requirements,
                keywordsArray,
                email,
                website,
                currency: currency.toUpperCase() + currency.slice(1),
                amount,
                location: location.charAt(0).toUpperCase() + location.slice(1),
                remote: remote,
                photo: req.file.filename
            }
        )
        await job.save();
        res.redirect('/')

    }
    catch(error){
        console.error(error);
        res.render('error');
    }
});


app.get('/jobPreview', async (req,res)=>{
    let jobId = req.query.jobId;
    const jobs = await Job.find();
    const job = jobs.find(j => j.id === jobId);
    console.log(job);
    res.render('jobPreview', { job });
   
});
 
app.get('/applyToJob', async (req,res)=>{
    let jobId = req.query.jobId;
    const jobs = await Job.find();
  const job = jobs.find(j => j.id === jobId);
  res.render('applyJob', {job});
})

app.get('/searchJob', async (req,res)=>{
    const query = req.query;
    console.log(req.query)
const titleQuery = query.title ? { $or: [
  { companyName: { $regex: query.title, $options: 'i' } },
  { role: { $regex: query.title, $options: 'i' } },
  { keywordsArray: {$regex: query.title, $options: 'i'}},
  { position: {$regex: query.title, $options: 'i'}}
]} : {};

const locationQuery = query.location ? { $or: [{location: { $regex: query.location, $options: 'i' }}, { remote: { $regex: query.location, $options: 'i' }} ] } : {};

const Jobs = await Job.find({ $and: [titleQuery, locationQuery] });
res.render('LandingPage', { Jobs });

})


app.listen(port, ()=>{
    console.log(`listening on port ${port}`);
})