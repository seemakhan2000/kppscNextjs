
const express = require('express');
const Profile = require('../models/Profile');
const {saveProfile, getProfileByCnic, getAllProfiles,updateStatus,deleteProfile } = require('../controllers/profileController');


const router = express.Router();

router.post('/saveProfile', saveProfile);
router.get('/:cnic', getProfileByCnic);
router.get('/', getAllProfiles);
router.put('/status/:cnic', updateStatus);
router.delete('/:cnic', deleteProfile);



router.put('/status/:cnic', async (req, res) => {
  try {
    const { cnic } = req.params;
    const { status } = req.body; 

    const profile = await Profile.findOneAndUpdate(
      { cnic },
      { status },
      { new: true }
    );

    if (!profile) return res.status(404).json({ message: 'Profile not found' });

    res.json(profile);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});






module.exports = router;
