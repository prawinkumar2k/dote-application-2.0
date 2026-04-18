const db = require('./config/db.config');

(async () => {
  try {
    const collegeId = '204';
    const searchPattern = `%"${collegeId}"%`;
    const [rows] = await db.query('SELECT user_id, college_choices FROM student_master WHERE college_choices LIKE ?', [searchPattern]);
    console.log(`Query for ${collegeId} found:`, rows.length, 'rows');
    console.log(rows);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
