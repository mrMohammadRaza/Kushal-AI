const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const { db, logAuditEvent } = require('../data/database');

const REPORTS_DIR = path.join(__dirname, '..', '..', 'uploads', 'reports');
if (!fs.existsSync(REPORTS_DIR)) {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
}

/**
 * Generates an official, tamper-evident RPL Assessment Report with QR Verification.
 */
async function generateAssessmentReport(assessmentId, assessorUser) {
  const assessment = db.prepare(`
    SELECT a.*, c.full_name as candidate_name, c.aadhaar_last4, c.phone, c.district, c.state,
           o.trade as trade_title, o.sector, o.qp_code, o.nsqf_level
    FROM assessment_cases a
    JOIN candidate_profiles c ON a.candidate_id = c.id
    JOIN occupations o ON a.trade_id = o.id
    WHERE a.id = ?
  `).get(assessmentId);

  if (!assessment) {
    throw new Error(`Assessment ${assessmentId} not found.`);
  }

  const competencies = db.prepare(`
    SELECT * FROM competency_assessments WHERE assessment_id = ? ORDER BY nos_code, pc_code
  `).all(assessmentId);

  const evidenceRecords = db.prepare(`
    SELECT * FROM evidence_records WHERE assessment_id = ?
  `).all(assessmentId);

  const reportId = `REP-${Date.now().toString().slice(-6)}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
  const reportHash = crypto.createHash('sha256')
    .update(`${reportId}|${assessment.id}|${assessment.candidate_id}|${assessment.overall_score}|${assessment.signed_off_at}`)
    .digest('hex');

  const baseUrl = process.env.PUBLIC_APP_URL || 'http://localhost:5000';
  const qrVerificationUrl = `${baseUrl}/api/reports/verify/${reportHash}`;

  // Generate QR Code data URL
  const qrCodeDataUrl = await QRCode.toDataURL(qrVerificationUrl, {
    errorCorrectionLevel: 'M',
    margin: 1,
    width: 140
  });

  const pdfFilename = `Report-${assessmentId}-${reportId}.pdf`;
  const pdfFilePath = path.join(REPORTS_DIR, pdfFilename);

  // Build PDF Document
  await new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    const stream = fs.createWriteStream(pdfFilePath);
    doc.pipe(stream);

    // Header Band
    doc.rect(0, 0, 595.28, 70).fill('#0f172a');
    doc.fillColor('#ffffff').fontSize(18).font('Helvetica-Bold')
       .text('KAUSHAL AI — RPL SKILL ASSESSMENT REPORT', 40, 20);
    doc.fontSize(10).font('Helvetica')
       .text('Assisted Recognition of Prior Learning (SIH Problem Statement: SIH26242)', 40, 42);

    // Subheader / Disclaimer
    doc.fillColor('#475569').fontSize(8).font('Helvetica-Oblique')
       .text('This is an authorized human-assessor evaluation report, not an independently generated qualification.', 40, 78);

    // Candidate & Assessment Meta Table
    doc.rect(40, 95, 515, 100).strokeColor('#cbd5e1').stroke();
    
    doc.fillColor('#1e293b').fontSize(9).font('Helvetica-Bold')
       .text('CANDIDATE INFORMATION', 50, 105);
    doc.font('Helvetica').fontSize(9).fillColor('#334155')
       .text(`Name: ${assessment.candidate_name}`, 50, 122)
       .text(`Candidate ID: ${assessment.candidate_id}`, 50, 137)
       .text(`District / State: ${assessment.district || 'Unspecified'}, ${assessment.state || ''}`.replace(/, $/, ''), 50, 152)
       .text(`Aadhaar (Last 4): ****-****-${assessment.aadhaar_last4 || 'XXXX'}`, 50, 167);

    doc.fillColor('#1e293b').fontSize(9).font('Helvetica-Bold')
       .text('OCCUPATION & STANDARD', 300, 105);
    doc.font('Helvetica').fontSize(9).fillColor('#334155')
       .text(`Trade: ${assessment.trade_title}`, 300, 122)
       .text(`QP Code: ${assessment.qp_code}`, 300, 137)
       .text(`NSQF Level: ${assessment.nsqf_level}`, 300, 152)
       .text(`Assessment Date: ${assessment.signed_off_at ? assessment.signed_off_at.split('T')[0] : new Date().toISOString().split('T')[0]}`, 300, 167);

    // QR Code for verification
    const qrImageBuffer = Buffer.from(qrCodeDataUrl.split(',')[1], 'base64');
    doc.image(qrImageBuffer, 460, 100, { width: 85, height: 85 });
    doc.fontSize(7).fillColor('#64748b').text('Scan to Verify Authenticity', 450, 185);

    // Competency Evaluation Section
    doc.moveDown(6);
    doc.fillColor('#0f172a').fontSize(12).font('Helvetica-Bold')
       .text('COMPETENCY & EVIDENCE EVALUATION MATRIX', 40, 210);

    let yPos = 230;
    // Table Header
    doc.rect(40, yPos, 515, 20).fill('#f1f5f9');
    doc.fillColor('#0f172a').fontSize(8).font('Helvetica-Bold')
       .text('NOS CODE', 45, yPos + 6)
       .text('UNIT / CRITERION DESCRIPTION', 115, yPos + 6)
       .text('EVIDENCE STATUS', 370, yPos + 6)
       .text('ASSESSOR SCORE', 475, yPos + 6);
    yPos += 22;

    if (competencies.length > 0) {
      competencies.slice(0, 10).forEach((comp) => {
        doc.rect(40, yPos, 515, 24).strokeColor('#e2e8f0').stroke();
        const scoreDisplay = comp.assessor_score !== null && comp.assessor_score !== undefined
          ? `${comp.assessor_score}%`
          : (comp.ai_score !== null && comp.ai_score !== undefined ? `${comp.ai_score}% (AI)` : 'Unscored');

        doc.fillColor('#334155').fontSize(8).font('Helvetica')
           .text(comp.nos_code || 'NOS', 45, yPos + 7)
           .text((comp.criteria_text || comp.pc_code || '').slice(0, 50), 115, yPos + 7)
           .text((comp.evidence_status || 'not_assessed').replace(/_/g, ' '), 370, yPos + 7)
           .text(scoreDisplay, 485, yPos + 7);
        yPos += 24;
      });
    } else {
      doc.rect(40, yPos, 515, 24).strokeColor('#e2e8f0').stroke();
      doc.fillColor('#64748b').fontSize(8).font('Helvetica-Oblique')
         .text('—', 45, yPos + 7)
         .text('No granular competency criteria recorded for this assessment case.', 115, yPos + 7)
         .text('not assessed', 370, yPos + 7)
         .text('N/A', 485, yPos + 7);
      yPos += 24;
    }

    // Evidence Audit Section
    yPos += 15;
    doc.fillColor('#0f172a').fontSize(11).font('Helvetica-Bold')
       .text('SUBMITTED EVIDENCE PROVENANCE & HASHES', 40, yPos);
    yPos += 18;

    if (evidenceRecords.length > 0) {
      evidenceRecords.forEach((ev) => {
        doc.fontSize(8).font('Helvetica').fillColor('#475569')
           .text(`• [${ev.evidence_type.toUpperCase()}] ${ev.original_filename} (SHA-256: ${ev.sha256_hash.slice(0, 24)}...) — ${Math.round(ev.file_size / 1024)} KB`, 45, yPos);
        yPos += 14;
      });
    } else {
      doc.fontSize(8).font('Helvetica-Oblique').fillColor('#64748b')
         .text('• No physical or media evidence files were submitted for this assessment.', 45, yPos);
      yPos += 14;
    }

    // Assessor Sign-Off & Verdict Section
    yPos += 15;
    doc.rect(40, yPos, 515, 80).fill('#f8fafc').strokeColor('#cbd5e1').stroke();
    doc.fillColor('#0f172a').fontSize(10).font('Helvetica-Bold')
       .text('LEAD ASSESSOR SIGN-OFF & FINAL VERDICT', 50, yPos + 10);
    
    const formattedScore = assessment.overall_score !== null && assessment.overall_score !== undefined
      ? `${assessment.overall_score}%`
      : 'Unscored / Under Review';

    doc.fontSize(9).font('Helvetica').fillColor('#1e293b')
       .text(`Verdict: ${(assessment.status || 'DRAFT').toUpperCase()}`, 50, yPos + 26)
       .text(`Overall Verified Score: ${formattedScore}`, 50, yPos + 40)
       .text(`Assessor Remarks: "${assessment.assessor_notes || 'Competencies evaluated against NSQF criteria.'}"`, 50, yPos + 54);

    doc.fillColor('#0f172a').fontSize(9).font('Helvetica-Bold')
       .text(`Certified Assessor: ${assessorUser?.full_name || 'Assessor Assigned'}`, 300, yPos + 26)
       .text(`Sign-Off Digest: ${reportHash.slice(0, 16).toUpperCase()}`, 300, yPos + 40)
       .text(`Verification URL: /api/reports/verify/${reportHash.slice(0, 12)}...`, 300, yPos + 54);

    // Footer
    doc.fontSize(7).fillColor('#94a3b8')
       .text(`Report ID: ${reportId} • Verification Hash: ${reportHash} • Generated on ${new Date().toUTCString()}`, 40, 780, { align: 'center' });

    doc.end();
    stream.on('finish', resolve);
    stream.on('error', reject);
  });

  // Store Report Record in Database
  const insertReport = db.prepare(`
    INSERT INTO reports (id, assessment_id, report_version, report_hash, qr_verification_url, pdf_path, released_by)
    VALUES (?, ?, 1, ?, ?, ?, ?)
  `);

  insertReport.run(reportId, assessmentId, reportHash, qrVerificationUrl, `/uploads/reports/${pdfFilename}`, assessorUser?.id || null);

  logAuditEvent({
    entityType: 'report',
    entityId: reportId,
    userId: assessorUser?.id,
    userRole: assessorUser?.role || 'assessor',
    action: 'ASSESSMENT_REPORT_RELEASED',
    details: { assessmentId, reportHash, qrVerificationUrl }
  });

  return {
    reportId,
    reportHash,
    qrVerificationUrl,
    pdfUrl: `/uploads/reports/${pdfFilename}`,
    releasedAt: new Date().toISOString()
  };
}

module.exports = {
  generateAssessmentReport,
  REPORTS_DIR
};
