export const translations = {
  en: {
    appTitle: "Kaushal AI",
    subTitle: "Skill Assessment & Prior Learning (RPL)",
    govTag: "Skill India • NSQF Aligned",
    welcomeTitle: "Welcome. What is your trade?",
    welcomeSub: "Select your daily profession to begin your voice & photo skill certification.",
    listenPrompt: "Listen to instructions",
    viewCertificates: "View My Certificates",
    stepIndicator: "Step 1 of 3: Evidence Capture",
    step1Title: "Capture Work Evidence",
    step1Desc: "Show us what you built, fixed, or repaired today.",
    step2Title: "AI Skill Analysis",
    step3Title: "NSQF Verification",
    viewfinderTitle: "Take a photo of your completed work",
    viewfinderSub: "Make sure tools, wiring, or joints are clearly visible in daylight.",
    capturePhoto: "Open Camera / Upload Photo",
    photoCaptured: "Photo evidence captured",
    photoMissing: "No photo captured yet",
    retakePhoto: "Retake Photo",
    micIdle: "Tap to describe your work",
    micListening: "Listening... Speak naturally in your language",
    micDone: "Voice explanation recorded",
    micHint: "Example: 'I installed a 16A MCB and completed earthing continuity testing.'",
    btnBack: "Back",
    btnSubmit: "Submit Evidence",
    btnSubmitting: "Analyzing with AI...",
    successToast: "Evidence submitted successfully!",
    trades: {
      webDeveloper: {
        id: "web-developer-l5",
        title: "Web Developer",
        roleHindi: "वेब डेवलपर",
        level: "NSQF Level 5 (SSC/Q0501)",
        desc: "Responsive web apps, interactive JavaScript state, semantic accessible HTML, and unit-tested components",
        color: "teal",
        qpCode: "SSC/Q0501",
        nosList: [
          "SSC/N0501: HTML and accessibility (15%)",
          "SSC/N0502: CSS and responsive design (15%)",
          "SSC/N0503: JavaScript fundamentals (20%)",
          "SSC/N0504: Practical development (30%)",
          "SSC/N0505: Debugging and problem-solving (15%)",
          "SSC/N0506: Technical explanation (5%)"
        ],
        sampleEvidence: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80",
        voicePrompt: "Built a responsive task list component with semantic buttons, accessibility focus management, state filters, and unit test coverage."
      },
      electrician: {
        id: "electrician",
        title: "Electrician",
        roleHindi: "इलेक्ट्रीशियन",
        level: "NSQF Level 3 & 4 (ELE/Q1402)",
        desc: "3-Phase distribution panels, motor Star-Delta wiring, and 1000V Megger insulation testing",
        color: "blue",
        qpCode: "ELE/Q1402",
        nosList: [
          "ELE/N1405: 3-Phase Panel & Star-Delta Starters",
          "ELE/N1406: Motor Insulation & 1000V Megger",
          "ELE/N1407: Chemical/Plate Earthing Pit Safety"
        ],
        sampleEvidence: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&auto=format&fit=crop&q=80",
        voicePrompt: "Pehle 3-phase isolator off kiya aur lock out lagaya. Phase rotation meter se R-Y-B verify karke busbar bolts torque kiye. Motor windings ka insulation resistance 1000V Megger se check kiya jo 50 Megohm aaya. Earth pit resistance 1.8 ohm mila."
      },
      mechanic: {
        id: "mechanic",
        title: "Mechanic",
        roleHindi: "मैकेनिक",
        level: "NSQF Level 3 & 4",
        desc: "Two/Four-wheeler engine overhaul, brakes, and electricals",
        color: "emerald",
        sampleEvidence: "https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=800&auto=format&fit=crop&q=80",
        voicePrompt: "Engine ka oil change kiya aur brake pads replace karke bleeder valve tighten kiye."
      },
      plumber: {
        id: "plumber",
        title: "Plumber",
        roleHindi: "प्लंबर",
        level: "NSQF Level 3",
        desc: "Piping, sanitary fittings, CPVC joints, and leak rectifications",
        color: "sky",
        sampleEvidence: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800&auto=format&fit=crop&q=80",
        voicePrompt: "Deep seal P-trap install kiya aur solvent weld se joint leak test pass kiya."
      },
      tailor: {
        id: "tailor",
        title: "Tailor",
        roleHindi: "दर्जी",
        level: "NSQF Level 3",
        desc: "Pattern drafting, machine stitching, hem finishing & garment tailoring",
        color: "amber",
        sampleEvidence: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&auto=format&fit=crop&q=80",
        voicePrompt: "Kurti ka pattern cut kiya, interlocking stitching ki aur neckline piping finish kiya."
      }
    }
  },
  hi: {
    appTitle: "कौशल AI",
    subTitle: "पूर्व अनुभव कौशल प्रमाणन (RPL)",
    govTag: "स्किल इंडिया • NSQF मानक",
    welcomeTitle: "स्वागत है। आपका काम (व्यवसाय) क्या है?",
    welcomeSub: "अपनी पहचान और काम का चुनाव करें ताकि आवाज़ और तस्वीर से प्रमाण पत्र बन सके।",
    listenPrompt: "निर्देश सुनें",
    viewCertificates: "मेरे प्रमाण पत्र देखें",
    stepIndicator: "चरण 1 / 3: काम का सबूत",
    step1Title: "काम का सबूत दें",
    step1Desc: "आज आपने जो भी काम किया या ठीक किया, उसे दिखाएं।",
    step2Title: "AI कौशल जांच",
    step3Title: "प्रमाण पत्र सत्यापन",
    viewfinderTitle: "अपने किए गए काम की तस्वीर खींचें",
    viewfinderSub: "तार, औज़ार, या सिलाई/फिटिंग रोशनी में साफ़ दिखनी चाहिए।",
    capturePhoto: "कैमरा खोलें / फ़ोटो चुनें",
    photoCaptured: "फ़ोटो सफलता से जुड़ गई",
    photoMissing: "अभी तक फ़ोटो नहीं ली गई",
    retakePhoto: "दोबारा फ़ोटो लें",
    micIdle: "बोलकर अपने काम के बारे में बताएं",
    micListening: "सुन रहे हैं... अपनी भाषा में बोलिए",
    micDone: "आवाज़ में विवरण दर्ज हुआ",
    micHint: "उदाहरण: 'मैंने 16A MCB लगाया और अर्थिंग तार का टेस्ट पूरा किया।'",
    btnBack: "पीछे जाएं",
    btnSubmit: "सबूत जमा करें",
    btnSubmitting: "AI द्वारा जांच जारी है...",
    successToast: "सबूत सफलतापूर्वक जमा कर दिया गया!",
    trades: {
      webDeveloper: {
        id: "web-developer-l5",
        title: "वेब डेवलपर",
        roleHindi: "सॉफ़्टवेयर / वेब डेवलपर",
        level: "NSQF स्तर 5 (SSC/Q0501)",
        desc: "रिस्पॉन्सिव वेब ऍप्लिकेशन्स, जावास्क्रिप्ट स्टेट मैनेजमेंट, एक्सेसिबल HTML, और यूनिट टेस्टेड कोडिंग कार्य",
        color: "teal",
        qpCode: "SSC/Q0501",
        nosList: [
          "SSC/N0501: HTML व सुलभता (Accessibility) (15%)",
          "SSC/N0502: CSS व रिस्पॉन्सिव लेआउट (15%)",
          "SSC/N0503: जावास्क्रिप्ट सिद्धांत व स्टेट (20%)",
          "SSC/N0504: प्रायोगिक एप्लिकेशन निर्माण (30%)",
          "SSC/N0505: डिबगिंग व समस्या समाधान (15%)",
          "SSC/N0506: तकनीकी व्याख्या व वास्तुकला (5%)"
        ],
        sampleEvidence: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80",
        voicePrompt: "मैंने टास्क लिस्ट ऍप्लिकेशन का कोड बनाया जिसमें रिस्पॉन्सिव फ्लेक्सबॉक्स, इनपुट वैलिडेशन और यूनिट टेस्ट पास हुए।"
      },
      electrician: {
        id: "electrician",
        title: "इलेक्ट्रीशियन",
        roleHindi: "बिजली मिस्त्री",
        level: "NSQF स्तर 3 एवं 4 (ELE/Q1402)",
        desc: "3-फेज औद्योगिक पैनल, स्टार-डेल्टा मोटर स्टार्टर, और 1000V मेगर इंसुलेशन टेस्टिंग",
        color: "blue",
        qpCode: "ELE/Q1402",
        nosList: [
          "ELE/N1405: 3-फेज बसबार व स्टार-डेल्टा वायरिंग",
          "ELE/N1406: मेगर द्वारा मोटर वाइंडिंग टेस्ट",
          "ELE/N1407: अर्थिंग पिट व सुरक्षा ग्रिड मानक"
        ],
        sampleEvidence: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&auto=format&fit=crop&q=80",
        voicePrompt: "पहले 3-फेज मेन आइसोलेटर काटा और लॉक आउट लगाया। रोटेशन मीटर से R-Y-B चेक किया और बसबार बोल्ट टॉर्क किए। 1000V मेगर से मोटर वाइंडिंग का इंसुलेशन 50 मेगा-ओम मिला और अर्थिंग 1.8 ओम मिली।"
      },
      mechanic: {
        id: "mechanic",
        title: "मैकेनिक",
        roleHindi: "गाड़ी मिस्त्री",
        level: "NSQF स्तर 3 एवं 4",
        desc: "मोटरसाइकिल/कार इंजन रिपेयर, ब्रेक पैड्स और सर्विसिंग",
        color: "emerald",
        sampleEvidence: "https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=800&auto=format&fit=crop&q=80",
        voicePrompt: "इंजन ऑयल बदला और ब्रेक शूज़ नए डालकर लीकेज चेक किया।"
      },
      plumber: {
        id: "plumber",
        title: "प्लंबर",
        roleHindi: "नलसाज़",
        level: "NSQF स्तर 3",
        desc: "पाइप फिटिंग, बेसिन, वॉशबेसिन, सीवरेज और वाटर लीकेज रिपेयर",
        color: "sky",
        sampleEvidence: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800&auto=format&fit=crop&q=80",
        voicePrompt: "बाथरूम में P-trap लगाया और सॉल्वेंट से नया पाइप कनेक्शन जोड़ा।"
      },
      tailor: {
        id: "tailor",
        title: "दर्जी (टेलर)",
        roleHindi: "सिलाई कारीगर",
        level: "NSQF स्तर 3",
        desc: "सिलाई मशीन संचालन, कटिंग, इंटरलॉकिंग और कपड़ा फिटिंग",
        color: "amber",
        sampleEvidence: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&auto=format&fit=crop&q=80",
        voicePrompt: "कुर्ती का नाप लेकर कटिंग की और कॉलर और आस्तीन की सिलाई की।"
      }
    }
  }
};
