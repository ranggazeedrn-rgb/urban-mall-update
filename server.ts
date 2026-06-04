import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import { STORES, PRODUCTS } from "./src/data";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(express.json());

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Gemini AI Chat Assistant
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, history } = req.body;
      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "Gemini API configuration is missing." })
      }
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

      const contents = [];
      if (history && Array.isArray(history)) {
        for (const turn of history) {
          contents.push({
            role: turn.role === "user" ? "user" : "model",
            parts: [{ text: turn.text }]
          });
        }
      }
      contents.push({
        role: "user",
        parts: [{ text: message }]
      });

      const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: contents,
        config: {
          maxOutputTokens: 1000,
          systemInstruction: `You are 'Urban Concierge', the elite AI Personal Assistant for 'Urban Mall' located in Jakarta, Indonesia.
Your role of service is to guide customers, recommend exclusive experiences, list specific shops, showcase matched products, and direct them beautifully around our mall.
Keep your answers class-focused, helpful, polite, and elegant. Always sound upscale, refined, and classy.

Here is some accurate mall data to guide your advice:
Active Shops:
${STORES.map((s) => `- ${s.name} (${s.category} on Level 1-2): ${s.description}`).join("\n")}

Featured Products for Purchase:
${PRODUCTS.map((p) => `- ${p.name} ($${p.price} from ${STORES.find(s => s.id === p.storeId)?.name || 'Mall Store'}): ${p.description}`).join("\n")}

Luxury Events in Progress:
- Friday VIP Runway: Curated streetwear lookbooks and private showings at Vogue Essentials.
- Weekend Innovation Hub: Hands-on electronics demonstrations at Tech Haven.
- Sunday Cafe Artisanal: Premium beans and brewing workshops at Gourmet Street.

Be precise, structure recommendations in beautiful lists, and format with Markdown. Welcome the client with supreme style.`
        }
      });

      const text = response.text || "I apologize, but I am processing other inquiries. Please ask again.";
      res.json({ text });
    } catch (err: any) {
      console.error("Gemini API Error:", err);
      res.status(500).json({ error: err.message || "An unexpected error occurred." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
