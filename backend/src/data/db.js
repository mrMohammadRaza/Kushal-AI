const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, '..', '..', 'data', 'store.json');

// Initial default candidates representing informal workers seeking RPL
const DEFAULT_CANDIDATES = [
  {
    id: "cand-101",
    name: "Ramesh Kumar Sharma",
    age: 32,
    gender: "Male",
    phone: "+91 98765 43210",
    aadhaarLast4: "4589",
    state: "Uttar Pradesh",
    district: "Varanasi",
    tradeId: "electrician-l3",
    informalExperienceYears: 6,
    educationLevel: "Class 8 Pass",
    currentOccupation: "Local House Electrician (Self-Employed)",
    profilePhoto: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop&q=80",
    enrolledDate: "2026-03-15"
  },
  {
    id: "cand-102",
    name: "Mohammad Aslam Ansari",
    age: 28,
    gender: "Male",
    phone: "+91 98111 22334",
    aadhaarLast4: "7812",
    state: "Bihar",
    district: "Patna",
    tradeId: "electrician-l4",
    informalExperienceYears: 8,
    educationLevel: "Class 10 Pass",
    currentOccupation: "Sub-station helper & Industrial Panel wirer",
    profilePhoto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
    enrolledDate: "2026-03-20"
  },
  {
    id: "cand-103",
    name: "Sunita Devi",
    age: 34,
    gender: "Female",
    phone: "+91 99223 88410",
    aadhaarLast4: "1923",
    state: "Rajasthan",
    district: "Jaipur",
    tradeId: "solar-l4",
    informalExperienceYears: 4,
    educationLevel: "Class 10 Pass",
    currentOccupation: "Rooftop Solar installer & maintenance technician",
    profilePhoto: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80",
    enrolledDate: "2026-03-22"
  },
  {
    id: "cand-104",
    name: "Gurpreet Singh",
    age: 39,
    gender: "Male",
    phone: "+91 97654 32190",
    aadhaarLast4: "9041",
    state: "Punjab",
    district: "Ludhiana",
    tradeId: "automotive-l4",
    informalExperienceYears: 12,
    educationLevel: "Class 9 Pass",
    currentOccupation: "Independent Garage Master Mechanic",
    profilePhoto: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
    enrolledDate: "2026-04-01"
  },
  {
    id: "cand-105",
    name: "Dinesh Babu",
    age: 26,
    gender: "Male",
    phone: "+91 91234 56789",
    aadhaarLast4: "6632",
    state: "Madhya Pradesh",
    district: "Bhopal",
    tradeId: "plumbing-l3",
    informalExperienceYears: 5,
    educationLevel: "Class 8 Pass",
    currentOccupation: "Domestic Pipe Fitter & Sanitary Technician",
    profilePhoto: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80",
    enrolledDate: "2026-04-05"
  }
];

function initDb() {
  try {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      const initialData = {
        candidates: DEFAULT_CANDIDATES,
        assessments: []
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
    }
  } catch (err) {
    console.error("Error initializing DB file:", err);
  }
}

function readDb() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      initDb();
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.warn("Falling back to in-memory DB due to read error:", err.message);
    return { candidates: DEFAULT_CANDIDATES, assessments: [] };
  }
}

function writeDb(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error("Error writing DB:", err);
    return false;
  }
}

initDb();

module.exports = {
  readDb,
  writeDb
};
