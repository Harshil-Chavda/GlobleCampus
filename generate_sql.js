const fs = require("fs");
const {
  materials2,
  materials3,
} = require("./src/app/api/bulk-import/materials-data.js");

// Helper to escape single quotes for SQL
const safe = (str) => (str || "").replace(/'/g, "''").trim();

// Map types to allowed enum values
const mapType = (t) => {
  const m = {
    Paper: "Question Paper",
    "Paper Solution": "Question Paper",
    IMP: "Important Questions",
    Notes: "Notes",
    Assignment: "Assignment",
    "Lab Manual": "Lab Manual",
    Project: "Notes",
  };
  return m[t] || "Notes"; // Default to Notes if unknown
};

// Parse date dd/mm/yyyy to ISO
const parseDate = (d) => {
  if (!d) return "NOW()";
  const [day, month, year] = d.split("/");
  // Note: This is a simple parser, might need adjustment if date format varies
  if (!day || !month || !year) return "NOW()";
  return `'${year}-${month}-${day}'`;
};

// Combine all arrays (raw is local variable in file, let's extract it or just use materials2/3 if raw was not exported.
// Ah, 'raw' was NOT exported in the file I read. I need to read the file content as string and extract 'raw'.
// For now let's construct the script to READ the file content and eval/parse it.

const fileContent = fs.readFileSync(
  "./src/app/api/bulk-import/materials-data.js",
  "utf8",
);

// Extract 'raw' array using regex or simple eval if safe (it's local code).
// Let's use a regex to capture the array content.
// Actually, since I have the file content, I can just append `module.exports = { raw, materials2, materials3 }` to a temp file and require it.
// But 'raw' is const.
// Plan B: Regex extraction of the object list.

const extractArray = (name) => {
  const regex = new RegExp(`const ${name} = \\[([\\s\\S]*?)\\];`);
  const match = fileContent.match(regex);
  if (match && match[1]) {
    // This is risky if the content isn't valid JSON-like JS.
    // It's JS objects. `eval` is dangerous but this is a local build script.
    return eval(`[${match[1]}]`);
  }
  return [];
};

const raw = extractArray("raw");
const allMaterials = [...raw, ...materials2, ...materials3];

// Filter valid links
const validMaterials = allMaterials.filter(
  (m) => m.link && m.link.startsWith("http"),
);

console.log(`Found ${validMaterials.length} valid materials.`);

let sql = `
-- BULK IMPORT SCRIPT
-- Replace 'YOUR_USER_ID_HERE' with your actual Supabase User ID (UUID)
-- You can find this in Authentication > Users

INSERT INTO materials (
  user_id, title, description, material_type, 
  course, specialization, subject, university, language, 
  uploaded_by, file_url, status, created_at
) VALUES 
`;

const values = validMaterials.map((m) => {
  const type = mapType(m.type);
  const date = parseDate(m.date);
  const desc = safe(m.desc);
  const title = safe(m.title);
  const subject = safe(m.sub);
  const course = safe(m.course);
  const branch = safe(m.branch);
  // Where no university is specified, default to GTU as per user request
  const uni = safe(m.clg || "Gujarat Technological University");
  const lang = safe(m.leng || "English");
  const sender = safe(m.sent_by || "GlobleCampus Team");

  return `(
    'YOUR_USER_ID_HERE', 
    '${title}', 
    '${desc}', 
    '${type}', 
    '${course}', 
    '${branch}', 
    '${subject}', 
    '${uni}', 
    '${lang}', 
    '${sender}', 
    '${m.link}', 
    'pending', 
    ${date}
  )`;
});

sql += values.join(",\n") + ";";

fs.writeFileSync("bulk_import_pending.sql", sql);
console.log("SQL file generated: bulk_import_pending.sql");
