const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const fs = require("fs");

const connectDB = require('./config/db');
const photoRoutes = require('./routes/photoRoutes');
const profileRoutes = require('./routes/profileRoutes')
const adminRoutes = require('./routes/adminRoutes');
const dashboardRoutes = require("./routes/dashboardRoutes");
const advertisementRoutes = require('./routes/advertisnmetRoute');
const contactRoutes = require("./routes/contactRoutes");
const scheduleRoutes = require("./routes/ScheduleRoutes");
dotenv.config();
connectDB();

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/uploads/ads', express.static(path.join(__dirname, 'public/ads')));
app.use('/ads/pdfs', express.static(path.join(__dirname, 'public/ads/pdfs')));
app.use('/ads/images', express.static(path.join(__dirname, 'public/ads/images')));


app.use('/api', require('./routes/userRoutes'));
app.use("/api/profile", profileRoutes);
app.use("/api/adminroute" ,adminRoutes )
app.use("/api/photo", photoRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use('/api/ads', advertisementRoutes);
app.use('/api/ads', advertisementRoutes); 
app.use("/api/contact", contactRoutes);
app.use("/api/schedules", scheduleRoutes); 

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(` Server running on port ${PORT}`));
