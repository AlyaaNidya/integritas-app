import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { role, answers } = body;
    
    // Hubungkan ke Google AI Studio
    const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Anda adalah sistem AI Penilai HR. Evaluasi jawaban wawancara kandidat untuk posisi "${role}".
    
    Berikut adalah transkrip jawaban mereka berdasarkan aspek:
    ${JSON.stringify(answers, null, 2)}
    
    Berdasarkan jawaban tersebut, berikan nilai (angka integer antara 50 hingga 100) untuk 9 aspek ini: adaptability, creativity, curiosity, eq, initiative, resilience, integrity, motivation, resolution.
    
    OUTPUT HARUS BERUPA OBJEK JSON VALID TANPA MARKDOWN ATAU TEKS TAMBAHAN.
    Contoh output yang benar:
    {"adaptability": 85, "creativity": 70, "curiosity": 80, "eq": 85, "initiative": 90, "resilience": 80, "integrity": 95, "motivation": 85, "resolution": 75}`;

    const result = await model.generateContent(prompt);
    let textResult = result.response.text().trim();
    
    // Membersihkan format markdown bawaan AI
    textResult = textResult.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const scores = JSON.parse(textResult);
    return res.status(200).json(scores);
  } catch (error) {
    console.error("AI Analysis Error:", error);
    return res.status(500).json({ error: "Gagal menganalisis skor kandidat" });
  }
}