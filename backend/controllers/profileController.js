const Profile = require('../models/Profile');
const Photo = require('../models/photo');
const saveProfile = async (req, res) => {
  try {
    const { profile, education, experience } = req.body;

    if (!profile || !profile.cnic) {
      return res.status(400).json({ message: 'CNIC is required.' });
    }

    const cnic = profile.cnic;
    const existing = await Profile.findOne({ cnic });
    if (existing) {
      return res.status(400).json({ message: 'Profile with this CNIC already exists.' });
    }

    
    const newProfile = new Profile({
      cnic,
      profile,
      education: education || [],
      experience: experience || [],
       status: 'Pending'
    });

    await newProfile.save();
    res.status(201).json({ message: 'Profile saved successfully', profile: newProfile });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Profile with this CNIC already exists.' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

const getProfileByCnic = async (req, res) => {
  try {
    const { cnic } = req.params;
    if (!cnic) return res.status(400).json({ message: 'CNIC is required' });

    const profile = await Profile.findOne({ cnic });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });

    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};


const getAllProfiles = async (req, res) => {
  try {
    const profiles = await Profile.find().sort({ _id: -1 });
    res.json(profiles);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const updateStatus = async (req, res) => {
  try {
    const { cnic } = req.params;
    const { status } = req.body;

    const profile = await Profile.findOneAndUpdate({ cnic }, { status }, { new: true });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });

    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
const deleteProfile = async (req, res) => {
  try {
    const { cnic } = req.params;

    const deletedProfile = await Profile.findOneAndDelete({ cnic });
    if (!deletedProfile) return res.status(404).json({ message: 'Profile not found' });
    const photo = await Photo.findOne({ cnic });
    if (photo) {
      const filePath = path.join(__dirname, '../', photo.url);
      fs.unlink(filePath, err => { if (err) console.error(err); });
      await Photo.deleteOne({ cnic });
    }

    res.json({ message: 'Profile and photo deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { saveProfile, getAllProfiles, getProfileByCnic, updateStatus, deleteProfile };


