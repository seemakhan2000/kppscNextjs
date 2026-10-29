const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
    cnic: { type: String, required: true, unique: true }, 
    profile: { type: Object },
    education: { type: Array, default: [] },
    experience: { type: Array, default: [] },
    status: { type: String, default: 'Pending' } ,
}, { timestamps: true });

module.exports = mongoose.model('Profile', profileSchema);
