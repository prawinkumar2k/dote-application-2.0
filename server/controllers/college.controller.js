const db = require('../config/db.config');

const getDashboardStats = async (req, res) => {
  try {
    const collegeId = req.user.id;
    // Removing strict quotes to handle any JSON stringification eccentricities in DB (e.g. spaces or ints vs strings)
    const searchPattern = `%${collegeId}%`;
    
    // We fetch the real applications from student_master pointing to this college
    const [[{ totalApplications }]] = await db.query(
      'SELECT COUNT(*) AS totalApplications FROM student_master WHERE college_choices LIKE ?', 
      [searchPattern]
    );

    const [recentApplications] = await db.query(
      'SELECT * FROM student_master WHERE college_choices LIKE ? ORDER BY created_at DESC LIMIT 5', 
      [searchPattern]
    );

    // Dynamically querying the newly added application_status column
    const [[{ approved }]] = await db.query(
      'SELECT COUNT(*) AS approved FROM student_master WHERE college_choices LIKE ? AND application_status = ?', 
      [searchPattern, 'Approved']
    );
    const [[{ pendingReview }]] = await db.query(
      'SELECT COUNT(*) AS pendingReview FROM student_master WHERE college_choices LIKE ? AND application_status = ?', 
      [searchPattern, 'Pending']
    );
    const [[{ rejected }]] = await db.query(
      'SELECT COUNT(*) AS rejected FROM student_master WHERE college_choices LIKE ? AND application_status = ?', 
      [searchPattern, 'Rejected']
    );

    res.status(200).json({
      success: true,
      stats: {
        totalApplications,
        pendingReview,
        approved,
        rejected,
      },
      recentApplications,
    });
  } catch (err) {
    console.error('College dashboard stats error:', err);
    res.status(500).json({ message: 'Failed to fetch dashboard stats' });
  }
};

const getAllApplications = async (req, res) => {
  try {
    const collegeId = req.user.id;
    const searchPattern = `%${collegeId}%`;
    
    const [applications] = await db.query(
      'SELECT * FROM student_master WHERE college_choices LIKE ? ORDER BY created_at DESC', 
      [searchPattern]
    );
    res.status(200).json({ success: true, applications });
  } catch (err) {
    console.error('Fetch applications error:', err);
    res.status(500).json({ message: 'Failed to fetch applications' });
  }
};

const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['Approved', 'Pending', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    // Update the record internally; this relies on the newly injected application_status DB column hook!
    await db.query(
      'UPDATE student_master SET application_status = ? WHERE id = ?', 
      [status, id]
    );
    
    res.status(200).json({ success: true, message: `Application ${status} successfully` });
  } catch (err) {
    console.error('Update status error:', err);
    res.status(500).json({ message: 'Failed to update application status' });
  }
};

module.exports = { getDashboardStats, getAllApplications, updateApplicationStatus };
