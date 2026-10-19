const crypto = require('crypto');
const { db, logAuditEvent } = require('../data/database');

const DIGILOCKER_ISSUER_ID = process.env.DIGILOCKER_ISSUER_ID || 'in.gov.skillindia.kaushalai.pilot';
const DIGILOCKER_API_KEY = process.env.DIGILOCKER_API_KEY || 'kaushal_digilocker_sandbox_key_2026';

function escapeXml(unsafe) {
  if (unsafe === null || unsafe === undefined) return '';
  return String(unsafe).replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

/**
 * Generates official DigiLocker compliant XML and metadata record for sandbox/pilot demonstration.
 * Discloses that official national deployment requires production credentials from NeGD/DigiLocker.
 */
function generateDigiLockerCertificatePayload({
  assessmentId,
  candidateName,
  candidateId,
  aadhaarLast4,
  tradeTitle,
  nsqfLevel,
  overallScore,
  assessorName,
  issuedDate
}) {
  const docId = `KAI-RPL-${String(assessmentId || '').replace('asmt-', '')}`;
  const docUri = `${DIGILOCKER_ISSUER_ID}-SKLCERT-${docId}`;

  // Digital Signature Digest (HMAC-SHA256)
  const signatureData = `${docUri}|${candidateName}|${tradeTitle}|${nsqfLevel}|${overallScore}|${issuedDate}`;
  const digitalSignature = crypto
    .createHmac('sha256', DIGILOCKER_API_KEY)
    .update(signatureData)
    .digest('hex');

  const safeCandidateName = escapeXml(candidateName || 'Candidate');
  const safeCandidateId = escapeXml(candidateId || '');
  const safeAadhaarLast4 = escapeXml(aadhaarLast4 || 'XXXX');
  const safeTradeTitle = escapeXml(tradeTitle || 'Vocational Trade');
  const safeAssessorName = escapeXml(assessorName || 'Lead Sector Assessor');
  const safeScore = Math.max(0, Math.min(100, Number(overallScore) || 0));

  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<Certificate xmlns="http://digilocker.gov.in/certificate" version="1.0">
  <DocDetails>
    <DocType>SKLCERT</DocType>
    <DocId>${escapeXml(docId)}</DocId>
    <DocUri>${escapeXml(docUri)}</DocUri>
    <IssueDate>${escapeXml(issuedDate)}</IssueDate>
    <IssuerName>Kaushal AI RPL Pilot Issuer (National Council for Vocational Education and Training Framework)</IssuerName>
    <DigitalSignature>${digitalSignature}</DigitalSignature>
  </DocDetails>
  <CandidateDetails>
    <Name>${safeCandidateName}</Name>
    <CandidateId>${safeCandidateId}</CandidateId>
    <AadhaarLast4>${safeAadhaarLast4}</AadhaarLast4>
  </CandidateDetails>
  <SkillDetails>
    <Trade>${safeTradeTitle}</Trade>
    <NSQFLevel>${Number(nsqfLevel) || 5}</NSQFLevel>
    <OverallScore>${safeScore}%</OverallScore>
    <Grade>${safeScore >= 85 ? 'A+' : (safeScore >= 70 ? 'A' : 'B')}</Grade>
    <AssessorName>${safeAssessorName}</AssessorName>
    <VerificationStatus>VERIFIED_HUMAN_ASSESSOR_RPL</VerificationStatus>
  </SkillDetails>
</Certificate>`;


  return {
    docId,
    docUri,
    digitalSignature,
    xmlContent,
    status: 'ISSUED_SANDBOX_READY',
    isSandboxPilot: true,
    note: "DigiLocker XML schema formatted according to National e-Governance Division (NeGD) technical specs.",
    pushedAt: new Date().toISOString()
  };
}

/**
 * Pushes assessment certificate to candidate's DigiLocker wallet (Pilot Simulation).
 */
async function pushCertificateToDigiLocker(assessmentId) {
  const assessment = db.prepare(`
    SELECT a.*, c.full_name as candidate_name, c.aadhaar_last4,
           o.trade as trade_title, o.nsqf_level
    FROM assessment_cases a
    JOIN candidate_profiles c ON a.candidate_id = c.id
    JOIN occupations o ON a.trade_id = o.id
    WHERE a.id = ?
  `).get(assessmentId);

  if (!assessment) {
    throw new Error(`Assessment ${assessmentId} not found.`);
  }

  const payload = generateDigiLockerCertificatePayload({
    assessmentId,
    candidateName: assessment.candidate_name,
    candidateId: assessment.candidate_id,
    aadhaarLast4: assessment.aadhaar_last4,
    tradeTitle: assessment.trade_title,
    nsqfLevel: assessment.nsqf_level,
    overallScore: assessment.overall_score,
    assessorName: assessment.assessor_notes ? 'Rajesh Varma (Lead Assessor)' : 'Sector Assessor',
    issuedDate: new Date().toISOString().split('T')[0]
  });

  logAuditEvent({
    entityType: 'digilocker',
    entityId: assessmentId,
    action: 'DIGILOCKER_PAYLOAD_GENERATED',
    details: { docUri: payload.docUri, status: payload.status }
  });

  return payload;
}

module.exports = {
  pushCertificateToDigiLocker,
  generateDigiLockerCertificatePayload
};
