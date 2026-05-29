import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  // Hanya izinkan request POST
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { role, aspect } = body;
    
    // Hubungkan ke Google AI Studio
    const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Anda adalah seorang HR Professional dan Psikolog. Buat 1 pertanyaan wawancara kerja tingkat lanjut untuk posisi "${role}" guna menilai aspek psikologis "${aspect}" mereka. Pertanyaan harus situasional (behavioral event interview). Jawab dengan pertanyaannya saja, tanpa teks pengantar apapun.`;

    const result = await model.generateContent(prompt);
    const question = result.response.text().trim();

    return res.status(200).json({ question });
  } catch (error) {
    console.error("AI Question Error:", error);
    return res.status(500).json({ error: "Gagal membuat pertanyaan AI" });
  }
}