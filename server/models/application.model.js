const db = require('../config/db.config');

const Application = {
  findByStudentId: async (studentId) => {
    const [rows] = await db.query('SELECT * FROM mark_details WHERE student_id = ?', [studentId]);
    return rows[0];
  },

  upsertMarks: async (studentId, data) => {
    const validQualifiers = ['sslc', 'hsc', 'iti', 'voc'];
    
    // Strict filter: Key must be a flag (e.g., 'hsc') or start with a prefix (e.g., 'hsc_')
    const entries = Object.entries(data).filter(([key]) => {
      const lowerKey = key.toLowerCase();
      const isFlag = validQualifiers.includes(lowerKey);
      const hasPrefix = validQualifiers.some(q => lowerKey.startsWith(`${q}_`));
      return (isFlag || hasPrefix) && key !== 'student_id';
    });

    if (entries.length === 0) {
      console.warn(`No valid mark details found for student ${studentId}. Data:`, data);
      return;
    }

    const keys = ['student_id', ...entries.map(e => e[0])];
    const values = [studentId, ...entries.map(e => e[1])];

    const placeholders = keys.map(() => '?').join(', ');
    const updates = entries.map(([key]) => `${key} = VALUES(${key})`).join(', ');

    const query = `
      INSERT INTO mark_details (${keys.join(', ')})
      VALUES (${placeholders})
      ON DUPLICATE KEY UPDATE ${updates}
    `;

    await db.execute(query, values);
  },

  upsertStep5: async (studentId, data) => {
    await Application.upsertMarks(studentId, data);
  },

  upsertStep6: async (studentId, data) => {
    await Application.upsertMarks(studentId, data);
  },
};

module.exports = Application;
