// Script to create test buyer user for messaging feature
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import BuyerProfile from './models/BuyerProfile.js';

dotenv.config();

const createTestBuyer = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://jagaveeravishnut:qwertyuiop@harvesthub.m09io3e.mongodb.net/?appName=HarvestHub';
    await mongoose.connect(MONGODB_URI);
    console.log(' Connected to MongoDB');

    const existingBuyer = await User.findOne({ email: 'buyer@example.com' });
    
    if (existingBuyer) {
      console.log(' Test buyer already exists');
      console.log('   User ID:', existingBuyer._id);
      console.log('   Email:', existingBuyer.email);
      console.log('   Role:', existingBuyer.role);
    } else {
      const buyer = new User({
        name: 'Test Buyer',
        email: 'buyer@example.com',
        phone: '+919876543210',
        password: 'password123',
        role: 'buyer'
      });
      await buyer.save();
      console.log(' Test buyer created');
      console.log('   User ID:', buyer._id);
      console.log('   Email:', buyer.email);

      const existingProfile = await BuyerProfile.findOne({ userId: buyer._id });
      
      if (!existingProfile) {
        const buyerProfile = await BuyerProfile.create({
          userId: buyer._id,
          companyName: 'Test Company',
          businessType: 'Wholesaler',
          address: 'Test Address',
          totalOrders: 0
        });
        console.log(' Buyer profile created:', buyerProfile._id);
      }
    }

    await mongoose.disconnect();
    console.log('\n Setup complete! You can now use the messaging feature.');
    console.log('   Login credentials:');
    console.log('   Email: buyer@example.com');
    console.log('   Password: password123');
    
  } catch (error) {
    console.error(' Error:', error.message);
    process.exit(1);
  }
};

createTestBuyer();
