import mongoose from 'mongoose';
import { config } from '../config';
import { User } from '../models/User';
import { Order } from '../models/Order';

async function inspectDatabase() {
  try {
    console.log('Connecting to database:', config.mongodbUri.replace(/:([^:@]+)@/, ':****@'));
    await mongoose.connect(config.mongodbUri);

    console.log('\n=========================================');
    console.log('📋 REGISTERED USERS IN DATABASE');
    console.log('=========================================');

    const users = await User.find().select('-passwordHash -resetPasswordTokenHash');
    if (users.length === 0) {
      console.log('No users registered yet. Try registering via the "Sign in" button on the website!');
    } else {
      users.forEach((u, i) => {
        console.log(`\n[User #${i + 1}]`);
        console.log(`  ID:            ${u._id}`);
        console.log(`  Name:          ${u.name}`);
        console.log(`  Email:         ${u.email}`);
        console.log(`  Role:          ${u.role} ${u.role === 'admin' ? '👑 (Admin)' : ''}`);
        console.log(`  Email Verified: ${u.emailVerified}`);
        console.log(`  Phone:         ${u.phone || 'Not provided'}`);
        console.log(`  Google Login:  ${u.googleId ? 'Yes' : 'No'}`);
        console.log(`  Addresses:     ${u.savedAddresses?.length || 0} saved`);
        console.log(`  Registered At: ${u.createdAt}`);
      });
    }

    console.log('\n=========================================');
    console.log('📦 TOTAL ORDERS IN DATABASE');
    console.log('=========================================');
    const orderCount = await Order.countDocuments();
    console.log(`Total Orders: ${orderCount}`);

    await mongoose.disconnect();
    console.log('\n✅ Inspection complete.');
  } catch (error) {
    console.error('❌ Could not connect or inspect database:', error);
  }
}

inspectDatabase();
