const db = require('../config/db.config');

const getDashboardStats = async (req, res) => {
  try {
    // Total colleges (institutions)
    const [[{ totalColleges }]] = await db.query(
      'SELECT COUNT(*) AS totalColleges FROM institution_master'
    );

    // Total applications (students)
    const [[{ totalApplications }]] = await db.query(
      'SELECT COUNT(*) AS totalApplications FROM student_master'
    );

    // Total users (admins / system users)
    const [[{ totalUsers }]] = await db.query(
      'SELECT COUNT(*) AS totalUsers FROM user_master'
    );

    // Recent colleges (latest 3)
    const [recentColleges] = await db.query(
      'SELECT * FROM institution_master ORDER BY created_at DESC LIMIT 3'
    );

    res.status(200).json({
      success: true,
      stats: {
        totalColleges,
        totalApplications,
        totalUsers,
      },
      recentColleges,
    });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    res.status(500).json({ message: 'Failed to fetch dashboard stats' });
  }
};

const getAllColleges = async (req, res) => {
  try {
    const [colleges] = await db.query('SELECT * FROM institution_master ORDER BY created_at DESC');
    res.status(200).json({ success: true, colleges });
  } catch (err) {
    console.error('Fetch colleges error:', err);
    res.status(500).json({ message: 'Failed to fetch colleges data' });
  }
};

module.exports = { getDashboardStats, getAllColleges };
