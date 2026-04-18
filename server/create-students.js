/**
 * Create Student Users
 * All student passwords: Student@123
 * Run: node server/create-students.js
 */

const bcryptjs = require('bcryptjs');
const db = require('./config/db.config');
require('dotenv').config();

const createStudents = async () => {
  try {
    console.log('🌱 Creating student accounts...\n');

    // Hash password
    const studentPassword = await bcryptjs.hash('Student@123', 10);

    const students = [
      {
        userId: 'STU001',
        userName: 'Aman Kumar',
        fullName: 'Aman Kumar',
        dob: '2005-03-15',
        gender: 'M',
        email: 'aman.kumar@email.com',
        mobile: '9876543210',
        community: 'OBC',
        caste: 'General'
      },
      {
        userId: 'STU002',
        userName: 'Priya Singh',
        fullName: 'Priya Singh',
        dob: '2005-07-22',
        gender: 'F',
        email: 'priya.singh@email.com',
        mobile: '9988776655',
        community: 'SC/ST',
        caste: 'General'
      },
      {
        userId: 'STU003',
        userName: 'Rahul Patel',
        fullName: 'Rahul Patel',
        dob: '2004-11-10',
        gender: 'M',
        email: 'rahul.patel@email.com',
        mobile: '8765432109',
        community: 'BC',
        caste: 'General'
      },
      {
        userId: 'STU004',
        userName: 'Neha Gupta',
        fullName: 'Neha Gupta',
        dob: '2005-05-18',
        gender: 'F',
        email: 'neha.gupta@email.com',
        mobile: '8877665544',
        community: 'OC',
        caste: 'General'
      },
      {
        userId: 'STU005',
        userName: 'Arjun Verma',
        fullName: 'Arjun Verma',
        dob: '2005-02-28',
        gender: 'M',
        email: 'arjun.verma@email.com',
        mobile: '9765432109',
        community: 'OBC',
        caste: 'General'
      },
      {
        userId: 'STU006',
        userName: 'Divya Sharma',
        fullName: 'Divya Sharma',
        dob: '2005-08-12',
        gender: 'F',
        email: 'divya.sharma@email.com',
        mobile: '9654321098',
        community: 'General',
        caste: 'General'
      }
    ];

    console.log('✅ Database connected successfully\n');
    console.log('📝 Adding Students...\n');

    for (const student of students) {
      try {
        // Check if already exists
        const [check] = await db.query('SELECT * FROM user_master WHERE user_id = ?', [student.userId]);
        
        if (check.length === 0) {
          // Insert into user_master
          await db.query(
            'INSERT INTO user_master (user_id, user_name, role, password) VALUES (?, ?, ?, ?)',
            [student.userId, student.userName, 'student', studentPassword]
          );

          // Insert into student_master
          await db.query(
            `INSERT INTO student_master (user_id, student_name, dob, gender, email, mobile, community, caste, role, password) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [student.userId, student.fullName, student.dob, student.gender, student.email, student.mobile, student.community, student.caste, 'student', studentPassword]
          );

          console.log(`✅ ${student.userId} | ${student.userName}`);
        } else {
          console.log(`⏭️  ${student.userId} already exists, skipping...`);
        }
      } catch (err) {
        console.log(`❌ Error creating ${student.userId}: ${err.message}`);
      }
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✨ Student creation completed!\n');
    console.log('📋 STUDENT LOGIN CREDENTIALS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('All students password: Student@123\n');
    console.log('| User ID | Name | Email |');
    console.log('|---------|------|-------|');
    students.forEach(s => {
      console.log(`| ${s.userId} | ${s.userName} | ${s.email} |`);
    });
    console.log('\n🌐 Login at: http://localhost:5173');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
};

createStudents();
