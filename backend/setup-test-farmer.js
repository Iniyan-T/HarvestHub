// Script to create test farmer user for messaging feature
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import FarmerProfile from './models/FarmerProfile.js';

dotenv.config();

const createTestFarmer = async () => {
  try {
    // Connect to MongoDB - using same URI as server.js
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://jagaveeravishnut:qwertyuiop@harvesthub.m09io3e.mongodb.net/?appName=HarvestHub';
    await mongoose.connect(MONGODB_URI);
    console.log('📡 Connected to MongoDB');

    // Check if test farmer already exists
    const existingFarmer = await User.findOne({ email: 'farmer@example.com' });
    
    if (existingFarmer) {
      console.log('✅ Test farmer already exists');
      console.log('   User ID:', existingFarmer._id);
      console.log('   Email:', existingFarmer.email);
      console.log('   Role:', existingFarmer.role);
    } else {
      // Create test farmer
      const farmer = new User({
        name: 'Test Farmer',
        email: 'farmer@example.com',
        phone: '+919876543211',
        password: 'password123',
        role: 'farmer'
      });
      await farmer.save();
      console.log('✅ Test farmer created');
      console.log('   User ID:', farmer._id);
      console.log('   Email:', farmer.email);

      // Check if farmer profile exists
      const existingProfile = await FarmerProfile.findOne({ userId: farmer._id });
      
      if (!existingProfile) {
        const farmerProfile = await FarmerProfile.create({
          userId: farmer._id,
          farmName: 'Test Farm',
          farmSize: 10,
          cropsProduced: ['Wheat', 'Rice'],
          yearsOfExperience: 5,
          location: 'Test Location'
        });
        console.log('✅ Farmer profile created:', farmerProfile._id);
      }
    }

    // Disconnect
    await mongoose.disconnect();
    console.log('\n✅ Setup complete! You can now use the messaging feature.');
    console.log('   Login credentials:');
    console.log('   Email: farmer@example.com');
    console.log('   Password: password123');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

createTestFarmer();
