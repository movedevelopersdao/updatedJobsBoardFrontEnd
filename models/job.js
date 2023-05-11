const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true
  },

  position: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  action: {
    type: [String],
    required: true
  },
  requirements: {
    type: [String],
    required: true
  },
  keywordsArray: {
    type: [String],
    required: true
  },

  email: {
    type: String,
    required: true,
    
  },
  website: {
    type: String,
    required: true
  },
  currency: {
    type: String,
  },
  
  range: {
    type: String,
    
  },

  location: {
    type: String,
    
  },
  remote: {
    type: String,
    
  },
  
  
  photo: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('Job', jobSchema);