const db = require('../config/db.config');

const Application = {
  findByStudentId: async (studentId) => {
    const [rows] = await db.query('SELECT * FROM mark_details WHERE student_id = ?', [studentId]);
    return rows[0];
  },

  upsertStep5: async (studentId, d) => {
    const existing = await Application.findByStudentId(studentId);
    if (existing) {
      await db.query(
        `UPDATE mark_details SET
          hsc_register_no=?, hsc_exam_type=?, hsc_major_stream=?,
          hsc_subject1=?, hsc_subject1_obtained_mark=?, hsc_subject1_max_mark=?,
          hsc_subject2=?, hsc_subject2_obtained_mark=?, hsc_subject2_max_mark=?,
          hsc_subject3=?, hsc_subject3_obtained_mark=?, hsc_subject3_max_mark=?,
          hsc_subject4=?, hsc_subject4_obtained_mark=?, hsc_subject4_max_mark=?,
          hsc_subject5=?, hsc_subject5_obtained_mark=?, hsc_subject5_max_mark=?,
          hsc_subject6=?, hsc_subject6_obtained_mark=?, hsc_subject6_max_mark=?,
          hsc_total_mark=?, hsc_total_obtained_mark=?, hsc_percentage=?, hsc_cutoff=?
        WHERE student_id=?`,
        [
          d.hscRegisterNo || null, d.hscExamType || null, d.hscMajorStream || null,
          d.sub1Name || 'English', d.sub1Obtained || null, d.sub1Max || '100',
          d.sub2Name || 'Maths', d.sub2Obtained || null, d.sub2Max || '100',
          d.sub3Name || 'Physics', d.sub3Obtained || null, d.sub3Max || '100',
          d.sub4Name || 'Chemistry', d.sub4Obtained || null, d.sub4Max || '100',
          d.sub5Name || null, d.sub5Obtained || null, d.sub5Max || null,
          d.sub6Name || null, d.sub6Obtained || null, d.sub6Max || null,
          d.totalMax || null, d.totalObtained || null, d.percentage || null, d.cutoff || null,
          studentId,
        ]
      );
    } else {
      await db.query(
        `INSERT INTO mark_details (student_id,
          hsc_register_no, hsc_exam_type, hsc_major_stream,
          hsc_subject1, hsc_subject1_obtained_mark, hsc_subject1_max_mark,
          hsc_subject2, hsc_subject2_obtained_mark, hsc_subject2_max_mark,
          hsc_subject3, hsc_subject3_obtained_mark, hsc_subject3_max_mark,
          hsc_subject4, hsc_subject4_obtained_mark, hsc_subject4_max_mark,
          hsc_subject5, hsc_subject5_obtained_mark, hsc_subject5_max_mark,
          hsc_subject6, hsc_subject6_obtained_mark, hsc_subject6_max_mark,
          hsc_total_mark, hsc_total_obtained_mark, hsc_percentage, hsc_cutoff)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          studentId,
          d.hscRegisterNo || null, d.hscExamType || null, d.hscMajorStream || null,
          d.sub1Name || 'English', d.sub1Obtained || null, d.sub1Max || '100',
          d.sub2Name || 'Maths', d.sub2Obtained || null, d.sub2Max || '100',
          d.sub3Name || 'Physics', d.sub3Obtained || null, d.sub3Max || '100',
          d.sub4Name || 'Chemistry', d.sub4Obtained || null, d.sub4Max || '100',
          d.sub5Name || null, d.sub5Obtained || null, d.sub5Max || null,
          d.sub6Name || null, d.sub6Obtained || null, d.sub6Max || null,
          d.totalMax || null, d.totalObtained || null, d.percentage || null, d.cutoff || null,
        ]
      );
    }
  },

  upsertStep6: async (studentId, d) => {
    const existing = await Application.findByStudentId(studentId);
    if (existing) {
      await db.query(
        `UPDATE mark_details SET
          sslc=?, sslc_register_no=?, sslc_marksheet_no=?,
          sslc_subject1=?, sslc_subject1_obtained_mark=?, sslc_subject1_max_mark=?,
          sslc_subject2=?, sslc_subject2_obtained_mark=?, sslc_subject2_max_mark=?,
          sslc_subject3=?, sslc_subject3_obtained_mark=?, sslc_subject3_max_mark=?,
          sslc_subject4=?, sslc_subject4_obtained_mark=?, sslc_subject4_max_mark=?,
          sslc_subject5=?, sslc_subject5_obtained_mark=?, sslc_subject5_max_mark=?,
          sslc_total_mark=?, sslc_total_obtained_mark=?, sslc_percentage=?,
          hsc=?, hsc_register_no=?
        WHERE student_id=?`,
        [
          d.sslc || 'yes', d.sslcRegisterNo || null, d.sslcMarksheetNo || null,
          d.sslcSub1 || 'Tamil', d.sslcSub1Obt || null, d.sslcSub1Max || '100',
          d.sslcSub2 || 'English', d.sslcSub2Obt || null, d.sslcSub2Max || '100',
          d.sslcSub3 || 'Maths', d.sslcSub3Obt || null, d.sslcSub3Max || '100',
          d.sslcSub4 || 'Science', d.sslcSub4Obt || null, d.sslcSub4Max || '100',
          d.sslcSub5 || 'Social', d.sslcSub5Obt || null, d.sslcSub5Max || '100',
          d.sslcTotalMax || null, d.sslcTotalObt || null, d.sslcPercentage || null,
          d.hsc || 'yes', d.hscRegisterNo || null,
          studentId,
        ]
      );
    } else {
      await db.query(
        `INSERT INTO mark_details (student_id,
          sslc, sslc_register_no, sslc_marksheet_no,
          sslc_subject1, sslc_subject1_obtained_mark, sslc_subject1_max_mark,
          sslc_subject2, sslc_subject2_obtained_mark, sslc_subject2_max_mark,
          sslc_subject3, sslc_subject3_obtained_mark, sslc_subject3_max_mark,
          sslc_subject4, sslc_subject4_obtained_mark, sslc_subject4_max_mark,
          sslc_subject5, sslc_subject5_obtained_mark, sslc_subject5_max_mark,
          sslc_total_mark, sslc_total_obtained_mark, sslc_percentage, hsc)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          studentId,
          d.sslc || 'yes', d.sslcRegisterNo || null, d.sslcMarksheetNo || null,
          d.sslcSub1 || 'Tamil', d.sslcSub1Obt || null, d.sslcSub1Max || '100',
          d.sslcSub2 || 'English', d.sslcSub2Obt || null, d.sslcSub2Max || '100',
          d.sslcSub3 || 'Maths', d.sslcSub3Obt || null, d.sslcSub3Max || '100',
          d.sslcSub4 || 'Science', d.sslcSub4Obt || null, d.sslcSub4Max || '100',
          d.sslcSub5 || 'Social', d.sslcSub5Obt || null, d.sslcSub5Max || '100',
          d.sslcTotalMax || null, d.sslcTotalObt || null, d.sslcPercentage || null,
          d.hsc || 'yes',
        ]
      );
    }
  },
};

module.exports = Application;
