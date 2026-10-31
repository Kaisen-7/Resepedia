/**
 * Client-Side Image Compressor
 *
 * Mengompresi file foto resep menjadi WebP/JPEG ringan (~40KB - 80KB)
 * secara langsung di browser menggunakan HTML5 Canvas.
 *
 * Solusi 100% GRATIS untuk Firebase Spark Plan (tanpa Cloud Storage & tanpa kartu kredit).
 * Hasil kompresi Base64 Data URL dapat langsung disimpan ke dokumen Cloud Firestore
 * (karena batas ukuran dokumen Firestore adalah 1 MB).
 */

export async function compressImageToDataUrl(
  file: File,
  maxWidth = 900,
  maxHeight = 675,
  quality = 0.75
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Pertahankan aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Gagal mendapatkan 2D canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Coba kompres ke WebP terlebih dahulu (rasio kompresi terbaik)
        try {
          const webpData = canvas.toDataURL('image/webp', quality);
          if (webpData.startsWith('data:image/webp')) {
            resolve(webpData);
            return;
          }
        } catch {
          // Fallback ke JPEG jika browser tidak mendukung export WebP
        }

        const jpegData = canvas.toDataURL('image/jpeg', quality);
        resolve(jpegData);
      };

      img.onerror = (err) => reject(err);
      img.src = readerEvent.target?.result as string;
    };

    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}
