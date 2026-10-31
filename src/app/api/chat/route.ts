import { GoogleGenAI } from '@google/genai';
import { NextRequest } from 'next/server';

const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'resepedia-ai',
        },
      },
    })
  : null;

export async function POST(req: NextRequest) {
  try {
    if (!ai) {
      return new Response(
        JSON.stringify({
          error:
            'Kunci API Gemini belum dikonfigurasi di server. Silakan tambahkan GEMINI_API_KEY pada berkas .env Anda.',
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { messages, message, currentRecipeContext } = await req.json();

    // Support both format: single message or array of messages
    const chatContents = messages || (message ? [{ role: 'user', text: message }] : []);

    const contextPrompt = currentRecipeContext
      ? `\n[KONTEKS RESEP AKTIF]\nSaat ini pengguna sedang melihat resep: "${currentRecipeContext.title}" dari daerah ${currentRecipeContext.region || 'Nusantara'}.\nDeskripsi: ${currentRecipeContext.description || ''}\nBahan-bahannya: ${JSON.stringify(
          currentRecipeContext.ingredients || []
        )}.\nInstruksi: ${JSON.stringify(
          (currentRecipeContext.instructions || []).map((i: any) => i.text)
        )}.\nJika pengguna bertanya tentang resep ini, prioritaskan menjawab seputar bumbu pengganti, tips teknik, dan lauk pendamping yang cocok.`
      : '';

    const systemInstruction = `Kamu adalah Chef Resepedia AI, koki ahli dan ensiklopedis masakan Nusantara serta dunia.
Tujuanmu adalah membantu pengguna memasak dengan ramah, informatif, dan praktis.

ATURAN FORMATTING:
1. Gunakan format Markdown yang bersih dan terstruktur.
2. Jika memberikan resep masakan, SELALU gunakan format ini:
   - ## [Nama Resep]
   - **Deskripsi Singkat**: (1-2 kalimat menggugah selera)
   - ### Bahan-Bahan
     - (Gunakan bullet point beserta takaran jelas)
   - ### Cara Memasak
     - (Gunakan penomoran 1, 2, 3 berurutan)
   - ### Tips Chef & Substitusi Bumbu
3. Cetak tebal (**bold**) pada bahan utama dan teknik penting.
4. Gaya bicaramu hangat, menyemangati, dan penuh cinta pada budaya kuliner lokal.
5. Jika ditanya hal di luar kuliner/makanan, arahkan kembali dengan sopan ke topik masakan.${contextPrompt}`;

    // Convert format to contents required by Google Gen AI SDK
    const formattedContents = chatContents.map((m: any) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.text || '' }],
    }));

    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-2.5-flash',
      contents: formattedContents.length > 0 ? formattedContents.slice(-10) : [{ role: 'user', parts: [{ text: 'Halo Chef Resepedia!' }] }],
      config: {
        systemInstruction,
      },
    });

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of responseStream) {
            if (chunk.text) {
              controller.enqueue(new TextEncoder().encode(chunk.text));
            }
          }
        } catch (err: any) {
          console.error('Error during streaming Gemini:', err);
          controller.enqueue(
            new TextEncoder().encode(`\n[Terjadi kesalahan koneksi saat menerima respons AI: ${err.message}]`)
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
      },
    });
  } catch (error: any) {
    console.error('API Chat Route Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Gagal memproses pesan ke Chef AI.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
