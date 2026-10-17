# Kaushal AI — Known Limitations & Honest Disclosures
**Responsible Engineering Transparency for Smart India Hackathon**

---

## 1. External Government API Integrations
1. **Digital India Bhashini (ULCA API)**:
   - The integration interface and request schemas are fully implemented according to the official Dhruva specification.
   - Live production transcription requires white-listed IP addresses and authorized government ministry API keys from the Ministry of Electronics and Information Technology (MeitY).
   - In prototype mode without live credentials, the system transparently reports `liveProviderConnected: false` and performs local vocational terminology normalization without claiming live government connectivity.
2. **National DigiLocker Issuer Gateway**:
   - The XML certificate payload generation and HMAC-SHA256 digital signature digest strictly adhere to National e-Governance Division (NeGD) issuer specifications.
   - Official wallet synchronization requires registered issuer status on the National DigiLocker API Directory. In this prototype, it runs in transparent Sandbox / Pilot mode.

---

## 2. Machine Learning & Hardware Constraints
1. **Edge Inference vs Cloud Multimodal**:
   - High-fidelity visual inspection of 2D bounding boxes and tool grip posture relies on Google Gemini multimodal endpoints. When running purely offline without network access, the system falls back to deterministic rule-based evaluation that flags physical evidence as requiring manual assessor visual inspection.
2. **Audio Dialect Variations**:
   - Vernacular speech recognition accuracy depends on ambient microphone quality. Candidates in noisy workshop environments are provided with an in-browser transcript editor to verify and correct their oral explanation before final submission.
3. **Hardware Biometrics & Anti-Spoofing**:
   - The prototype includes web-based liveness gesture verification and GPS geolocation. It does not interface with dedicated UIDAI RD Service biometric fingerprint scanners, which require specialized hardware drivers and UIDAI ASA/KUA gateway licenses.
