const bcrypt = require('bcryptjs');
const db = require('./config/db.config');
const User = require('./models/user.model');

const createAdmin = async () => {
  try {
    const userId = 'admin_dote';
    const password = 'Admin@12345'; // You should change this
    const userName = 'Portal Admin';
    const role = 'admin';

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const insertedId = await User.create({
      user_id: userId,
      user_name: userName,
      role: role,
      password: hashedPassword
    });

    console.log(`✅ Admin created successfully with ID: ${insertedId}`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error creating admin:', err);
    process.exit(1);
  }
};

createAdmin();
