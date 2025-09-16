const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");
const uuid = require("uuid");

const generateCertificate = async (data) => {
  const { studentId, courseId, studentName, courseName, completionDate } = data;

  // Create a PDF document
  const doc = new PDFDocument({
    size: "A4",
    layout: "landscape",
  });

  // Generate unique filename
  const filename = `certificate_${studentId}_${courseId}_${uuid.v4()}.pdf`;
  const filePath = path.join(__dirname, "../public/certificates", filename);
  const publicUrl = `/certificates/${filename}`;

  // Ensure certificates directory exists
  if (!fs.existsSync(path.dirname(filePath))) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
  }

  // Pipe the PDF to a file
  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  // === APPLY THE SAME BEAUTIFUL DESIGN ===
  const width = doc.page.width;
  const height = doc.page.height;
  const centerX = width / 2;
  const centerY = height / 2;

  // Gradient background
  const gradient = doc.linearGradient(0, 0, width, height);
  gradient.stop(0, "#667eea").stop(0.5, "#764ba2").stop(1, "#f093fb");

  doc.rect(0, 0, width, height).fill(gradient);

  // Decorative borders and all other elements
  // (Copy the same design code from above...)

  // Main content
  doc
    .fontSize(48)
    .fillColor("#ffffff")
    .font("Helvetica-Bold")
    .text("CERTIFICATE", centerX - 200, 160, {
      width: 400,
      align: "center",
      characterSpacing: 8,
    });

  doc
    .fontSize(24)
    .fillColor("#f8f9fa")
    .text("OF EXCELLENCE", centerX - 150, 210, {
      width: 300,
      align: "center",
      characterSpacing: 4,
    });

  doc
    .fontSize(42)
    .fillColor("#ffffff")
    .font("Helvetica-Bold")
    .text(studentName, centerX - 300, 310, {
      width: 600,
      align: "center",
      characterSpacing: 2,
    });

  doc
    .fontSize(32)
    .fillColor("#f093fb")
    .font("Helvetica-Bold")
    .text(`"${courseName}"`, centerX - 350, 430, {
      width: 700,
      align: "center",
      characterSpacing: 1,
    });

  doc
    .fontSize(16)
    .fillColor("#dee2e6")
    .text(
      `Awarded on ${completionDate.toLocaleDateString()}`,
      centerX - 150,
      490,
      {
        width: 300,
        align: "center",
      }
    );

  // Finalize the PDF
  doc.end();

  // Wait for the stream to finish writing
  await new Promise((resolve) => stream.on("finish", resolve));

  return publicUrl;
};

module.exports = { generateCertificate };
