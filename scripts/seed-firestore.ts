/**
 * Resepedia - Standalone Cloud Firestore Seeder
 *
 * Menanamkan 20 Resep Autentik Nusantara ke Google Cloud Firestore lengkap
 * dengan slug SEO-friendly, ingredientNames (untuk filter bahan & Gemini Vision),
 * searchKeywords, variasi, nutrisi, dan instruksi langkah-demi-langkah.
 *
 * Jalankan dengan: npx tsx scripts/seed-firestore.ts
 */

import dotenv from 'dotenv';
import path from 'path';

dotenv.config();
dotenv.config({ path: path.join(process.cwd(), '.env.local'), override: true });

import { adminDb } from '../src/lib/firebase/admin';
import { RecipeDocument } from '../src/types/recipe.types';

function createSlug(title: string, idSuffix: string): string {
  const base = (title || 'resep')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  return `${base}-${idSuffix}`;
}

function generateKeywords(
  title: string,
  region: string,
  ingredients: Array<{ name: string }> = []
): string[] {
  const text = `${title} ${region} ${ingredients.map((i) => i.name).join(' ')}`
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 2);
  return Array.from(new Set(text));
}

export const SEED_RECIPES: Array<
  Omit<RecipeDocument, 'id' | 'slug' | 'ingredientNames' | 'searchKeywords' | 'createdAt' | 'authorId'> & {
    customId: string;
    authorId?: string | null;
  }
> = [
  {
    customId: 'resep-rendang-sapi',
    title: 'Authentic Beef Rendang',
    description: 'Nikmati cita rasa kaya rempah dan daging sapi empuk khas Minangkabau yang dimasak perlahan dalam kuah santan gurih pekat beraroma khas.',
    image: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?q=80&w=800&auto=format&fit=crop',
    prepTime: '30 Mins',
    cookTime: '4 Hours',
    difficulty: 'Hard',
    calories: '450 kcal',
    category: 'Main Course',
    region: 'Sumatra',
    spicy: true,
    servings: '4 Servings',
    youtubeUrl: 'https://www.youtube.com/embed/Xq4-yG7vO88',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-cooking-fresh-vegetables-in-a-pan-4315-large.mp4',
    nutrition: { protein: '28g', fat: '32g', carbs: '12g' },
    variations: [
      { title: 'Level Pedas Ekstra', description: 'Tambahkan 10 buah cabai rawit merah pada bumbu halus untuk sensasi pedas khas Padang.' },
      { title: 'Rendang Ayam', description: 'Ganti daging sapi dengan paha ayam, kurangi waktu memasak menjadi 1.5 jam agar daging tetap lembut.' },
      { title: 'Saran Penyajian', description: 'Sangat nikmat disajikan bersama nasi putih hangat dan gulai daun singkong.' }
    ],
    ingredients: [
      { name: 'Daging Sapi (Gandik/Sengkel)', detail: '1 kg, potong dadu', role: 'Protein utama yang menyerap seluruh bumbu rempah saat dimasak perlahan.' },
      { name: 'Santan Kelapa Kental', detail: '1.5 Liter', role: 'Memberikan rasa gurih creamy dan minyak alami khas rendang hitam.' },
      { name: 'Serai', detail: '3 batang, memarkan', role: 'Melepaskan aroma herbal segar yang mengimbangi kekayaan daging.' },
      { name: 'Daun Kunyit', detail: '2 lembar, ikat simpul', role: 'Aroma khas Minang yang tidak tergantikan.' },
      { name: 'Bawang Merah & Putih', detail: '12 butir & 6 siung', role: 'Fondasi bumbu halus aromatik.' },
      { name: 'Cabai Merah Keriting', detail: '150 gram', role: 'Memberikan warna merah alami dan tingkat kepedasan seimbang.' }
    ],
    instructions: [
      { title: 'Haluskan Bumbu', text: 'Haluskan bawang merah, bawang putih, jahe, lengkuas, dan cabai merah dengan sedikit santan hingga benar-benar lembut.' },
      { title: 'Tumis Rempah & Masak Santan', text: 'Masukkan santan ke dalam wajan tebal bersama bumbu halus, serai, daun kunyit, dan daun jeruk. Aduk terus dengan api sedang agar santan tidak pecah.' },
      { title: 'Masukkan Daging & Masak Perlahan', text: 'Setelah santan mulai berminyak, masukkan potongan daging sapi. Kecilkan api ke tingkat minimal. Masak perlahan selama 3-4 jam sambil diaduk sesekali hingga kuah mengering dan berwarna cokelat kehitaman.' }
    ],
    rating: 4.9,
    ratingCount: 142,
    authorName: 'Resepedia Official',
    isDefault: true
  },
  {
    customId: 'resep-gado-gado',
    title: 'Fresh Gado-Gado Betawi',
    description: 'Salad sayuran segar khas Indonesia berpadu dengan siraman saus kacang legit gurih, tahu tempe goreng renyah, dan kerupuk emping.',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=800&auto=format&fit=crop',
    prepTime: '20 Mins',
    cookTime: '10 Mins',
    difficulty: 'Easy',
    calories: '320 kcal',
    category: 'Appetizer',
    region: 'Jawa',
    spicy: false,
    servings: '2 Servings',
    youtubeUrl: 'https://www.youtube.com/embed/MpsJByJ59o8',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-serving-food-on-a-plate-at-a-buffet-4309-large.mp4',
    nutrition: { protein: '14g', fat: '18g', carbs: '26g' },
    variations: [
      { title: 'Versi Vegan', description: 'Gunakan kecap manis dan garam tanpa terasi udang dalam saus kacang.' },
      { title: 'Ekstra Renyah', description: 'Tambahkan kerupuk udang dan emping melinjo sesaat sebelum disantap.' }
    ],
    ingredients: [
      { name: 'Sayuran Rebus (Kangkung, Tauge, Kacang Panjang)', detail: '250 gram', role: 'Sumber serat segar yang direbus setengah matang agar tetap renyah.' },
      { name: 'Tahu & Tempe Goreng', detail: '200 gram, potong dadu', role: 'Protein nabati pelengkap kaya rasa gurih.' },
      { name: 'Kacang Tanah Sangrai', detail: '200 gram, giling halus', role: 'Fondasi bumbu saus kacang legit yang gurih.' },
      { name: 'Gula Merah & Asam Jawa', detail: '50 gram & 1 sdm air asam', role: 'Memberikan rasa manis legit dan asam segar seimbang.' },
      { name: 'Telur Rebus', detail: '2 butir, belah dua', role: 'Topping sumber protein hewani klasik.' }
    ],
    instructions: [
      { title: 'Rebus Sayuran', text: 'Rebus masing-masing jenis sayuran secara terpisah dalam air mendidih selama 1-2 menit. Tiriskan dan rendam di air es agar warnanya tetap hijau cerah.' },
      { title: 'Ulek Saus Kacang', text: 'Ulek cabai, bawang putih, gula merah, dan garam. Masukkan kacang giling, air asam jawa, dan air hangat secukupnya hingga kekentalan pas.' },
      { title: 'Tata dan Sajikan', text: 'Tata sayuran, tahu, tempe, dan potongan telur rebus di piring. Siram dengan kuah kacang melimpah dan taburi bawang goreng serta emping.' }
    ],
    rating: 4.7,
    ratingCount: 98,
    authorName: 'Resepedia Official',
    isDefault: true
  },
  {
    customId: 'resep-sate-ayam-madura',
    title: 'Sate Ayam Madura Autentik',
    description: 'Tusukan daging ayam empuk juicy yang dipanggang di atas arang, berbalut saus kacang manis gurih khas Madura dan kecap kental manis.',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=800&auto=format&fit=crop',
    prepTime: '45 Mins',
    cookTime: '15 Mins',
    difficulty: 'Medium',
    calories: '380 kcal',
    category: 'Main Course',
    region: 'Jawa',
    spicy: true,
    servings: '4 Servings',
    youtubeUrl: 'https://www.youtube.com/embed/U7hA6N6X00k',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-putting-raw-meat-on-a-hot-grill-4304-large.mp4',
    nutrition: { protein: '24g', fat: '16g', carbs: '18g' },
    variations: [
      { title: 'Sate Daging Kambing', description: 'Gunakan potongan paha kambing muda dengan marinasi ketumbar dan kecap manis ekstra.' },
      { title: 'Penyajian Tradisional', description: 'Sajikan dengan lontong hangat dan irisan bawang merah segar.' }
    ],
    ingredients: [
      { name: 'Daging Paha Ayam Fillet', detail: '500 gram, potong dadu', role: 'Bagian paha menjaga tekstur tetap juicy dan tidak kering saat dipanggang.' },
      { name: 'Kecap Manis Kental', detail: '5 sdm', role: 'Karamelisasi manis gurih khas panggangan Nusantara.' },
      { name: 'Bumbu Kacang Halus', detail: '250 gram', role: 'Saus pelapis daging dan celupan utama.' },
      { name: 'Jeruk Limau', detail: '2 buah', role: 'Memberikan semburat aroma citrus segar pada saus kacang.' }
    ],
    instructions: [
      { title: 'Marinasi Ayam', text: 'Campurkan potongan ayam dengan 2 sdm kecap manis, 1 sdm bumbu kacang, dan sedikit minyak. Diamkan selama 30 menit.' },
      { title: 'Tusuk Daging', text: 'Tusukkan 4-5 potong daging ayam ke setiap tusuk sate bambu yang sudah direndam air sebelumnya.' },
      { title: 'Bakar & Balur', text: 'Panggang sate di atas bara api arang. Saat setengah matang, celupkan ke dalam bumbu olesan lalu bakar kembali hingga matang kecokelatan beraroma asap harum.' }
    ],
    rating: 4.8,
    ratingCount: 165,
    authorName: 'Resepedia Official',
    isDefault: true
  },
  {
    customId: 'resep-sate-lilit-bali',
    title: 'Sate Lilit Ikan Khas Bali',
    description: 'Sate cincang ikan tenggiri yang dibumbui Base Gede Bali berlimpah serai, dililitkan pada batang serai segar lalu dipanggang harum.',
    image: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?q=80&w=800&auto=format&fit=crop',
    prepTime: '30 Mins',
    cookTime: '20 Mins',
    difficulty: 'Medium',
    calories: '290 kcal',
    category: 'Appetizer',
    region: 'Bali',
    spicy: true,
    servings: '4 Servings',
    youtubeUrl: 'https://www.youtube.com/embed/5K9I_R6x7O0',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-chef-cutting-vegetables-on-a-wooden-board-4301-large.mp4',
    nutrition: { protein: '24g', fat: '12g', carbs: '8g' },
    variations: [
      { title: 'Sate Lilit Ayam', description: 'Bisa diganti daging ayam cincang dengan tambahan sedikit lemak kulit untuk rasa lebih gurih.' }
    ],
    ingredients: [
      { name: 'Daging Ikan Tenggiri Giling', detail: '500 gram', role: 'Tekstur daging kenyal yang mengikat bumbu rempah dengan baik.' },
      { name: 'Kelapa Parut Setengah Tua', detail: '100 gram', role: 'Memberikan tekstur gurih dan kelembutan pada adonan sate.' },
      { name: 'Batang Serai', detail: '12 batang, bersihkan', role: 'Tusukan alami yang melepaskan aroma wangi saat terkena bara panas.' },
      { name: 'Base Gede (Bumbu Bali)', detail: '3 sdm, tumis matang', role: 'Paduan bawang, kunyit, kencur, jahe, lengkuas, dan cabai rawit.' }
    ],
    instructions: [
      { title: 'Uleni Adonan', text: 'Campurkan ikan giling, kelapa parut, santan kental, dan tumisan bumbu Base Gede sampai kalis dan lengket.' },
      { title: 'Lilitkan pada Serai', text: 'Ambil sekepal kecil adonan, tempelkan dan lilitkan rapat di sekeliling ujung batang serai.' },
      { title: 'Panggang', text: 'Panggang di atas grill pan atau bara arang sambil dibalik-balik hingga matang merata dan berwarna keemasan.' }
    ],
    rating: 4.7,
    ratingCount: 74,
    authorName: 'Resepedia Official',
    isDefault: true
  },
  {
    customId: 'resep-papeda-ikan-kuah-kuning',
    title: 'Papeda & Ikan Kuah Kuning Papua',
    description: 'Bubur sagu kenyal lembut khas Papua dan Maluku yang dinikmati bersama kuah ikan kakap kuning asam segar beraroma daun kemangi.',
    image: 'https://images.unsplash.com/photo-1596791550796-03612803fe9e?q=80&w=800&auto=format&fit=crop',
    prepTime: '15 Mins',
    cookTime: '25 Mins',
    difficulty: 'Medium',
    calories: '320 kcal',
    category: 'Main Course',
    region: 'Papua',
    spicy: true,
    servings: '2 Servings',
    youtubeUrl: 'https://www.youtube.com/embed/fA-m_4zP0B0',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-stirring-a-stew-in-a-pot-4306-large.mp4',
    nutrition: { protein: '20g', fat: '6g', carbs: '45g' },
    variations: [
      { title: 'Ikan Tongkol atau Baronang', description: 'Dapat menggunakan jenis ikan laut segar lainnya yang berdaging padat.' }
    ],
    ingredients: [
      { name: 'Tepung Sagu Asli', detail: '250 gram', role: 'Bahan dasar utama penghasil tekstur kenyal transparan khas Papeda.' },
      { name: 'Ikan Kakap Merah / Tongkol', detail: '500 gram, bersihkan', role: 'Daging ikan laut gurih segar tanpa bau amis.' },
      { name: 'Kunyit & Jahe', detail: '3 cm & 2 cm, bakar haluskan', role: 'Memberikan warna kuning cerah dan kehangatan kuah.' },
      { name: 'Jeruk Nipis & Daun Kemangi', detail: '2 buah & 1 ikat', role: 'Sentuhan rasa asam menyegarkan dan aroma herbal khas.' }
    ],
    instructions: [
      { title: 'Buat Kuah Kuning', text: 'Tumis bumbu kuning hingga harum, masukkan air secukupnya. Masukkan potongan ikan, masak dengan api sedang sampai matang. Beri air jeruk nipis dan daun kemangi sesaat sebelum api dimatikan.' },
      { title: 'Buat Papeda', text: 'Larutkan tepung sagu dengan sedikit air dingin. Siramkan air panas mendidih secara perlahan sambil terus diaduk cepat hingga adonan berubah bening dan kental.' },
      { title: 'Penyajian Tradisional', text: 'Gulung papeda menggunakan sumpit bambu (gata-gata), pindahkan ke mangkuk, dan siram dengan kuah kuning beserta ikan hangat.' }
    ],
    rating: 4.6,
    ratingCount: 52,
    authorName: 'Resepedia Official',
    isDefault: true
  },
  {
    customId: 'resep-sop-konro-makassar',
    title: 'Sop Konro Asli Makassar',
    description: 'Sup iga sapi berdaging tebal khas Sulawesi Selatan dengan kuah hitam pekat bumbu kluwek yang kaya rempah pala dan cengkeh.',
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?q=80&w=800&auto=format&fit=crop',
    prepTime: '40 Mins',
    cookTime: '3 Hours',
    difficulty: 'Hard',
    calories: '550 kcal',
    category: 'Main Course',
    region: 'Sulawesi',
    spicy: true,
    servings: '4 Servings',
    youtubeUrl: 'https://www.youtube.com/embed/fP9_L_OqH8Q',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-frying-food-in-a-pan-4307-large.mp4',
    nutrition: { protein: '35g', fat: '38g', carbs: '15g' },
    variations: [
      { title: 'Konro Bakar', description: 'Angkat iga yang sudah empuk direbus, balur dengan bumbu kacang kecap lalu bakar di atas bara api.' }
    ],
    ingredients: [
      { name: 'Iga Sapi Segar', detail: '1 kg, potong ruas', role: 'Daging iga bertulang gurih yang empuk lembut setelah perebusan lama.' },
      { name: 'Buah Kluwek Matang', detail: '5 butir, ambil isinya', role: 'Menghasilkan kuah berwarna gelap dan aroma gurih nutty yang khas.' },
      { name: 'Ketumbar & Jintan Sangrai', detail: '1 sdm & 1/2 sdt', role: 'Fondasi rempah hangat khas Makassar.' },
      { name: 'Kayu Manis & Cengkeh', detail: '3 cm & 4 butir', role: 'Memberikan wangi rempah aromatik manis.' }
    ],
    instructions: [
      { title: 'Rebus Iga', text: 'Rebus iga sapi dalam air mendidih selama 15 menit, buang air kotoran pertama. Rebus kembali dengan air baru sampai setengah empuk.' },
      { title: 'Tumis Bumbu Kluwek', text: 'Haluskan isi kluwek bersama bawang, cabai, ketumbar, dan jintan. Tumis bersama kayu manis dan cengkeh hingga matang tanak.' },
      { title: 'Satukan & Ungkep', text: 'Tuang bumbu tumis ke dalam panci rebusan iga. Bumbui garam, gula, dan kaldu sapi. Masak dengan api kecil hingga daging iga benar-benar empuk lepas dari tulang.' }
    ],
    rating: 4.8,
    ratingCount: 89,
    authorName: 'Resepedia Official',
    isDefault: true
  },
  {
    customId: 'resep-soto-banjar',
    title: 'Soto Banjar Kuah Susu Gurih',
    description: 'Soto ayam khas Kalimantan Selatan berkuah gurih beraroma kapulaga, cengkeh, dan kayu manis, berpadu dengan kelezatan susu evaporasi.',
    image: 'https://images.unsplash.com/photo-1548946526-f69e2424cfac?q=80&w=800&auto=format&fit=crop',
    prepTime: '30 Mins',
    cookTime: '1 Hour',
    difficulty: 'Medium',
    calories: '340 kcal',
    category: 'Main Course',
    region: 'Kalimantan',
    spicy: false,
    servings: '4 Servings',
    youtubeUrl: 'https://www.youtube.com/embed/z4uX-Bnt-X0',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-chef-cutting-vegetables-on-a-wooden-board-4301-large.mp4',
    nutrition: { protein: '22g', fat: '14g', carbs: '30g' },
    variations: [
      { title: 'Perkedel Singkong', description: 'Sajikan dengan perkedel singkong goreng renyah sebagai pengganti perkedel kentang.' }
    ],
    ingredients: [
      { name: 'Ayam Kampung Utuh', detail: '1 ekor, potong 4', role: 'Kaldu ayam kampung menghasilkan rasa kuah yang lebih gurih alami.' },
      { name: 'Kapulaga, Cengkeh, Kayu Manis', detail: '3 btr, 4 btr, 4 cm', role: 'Aroma rempah manis khas Timur Tengah yang membedakan Soto Banjar.' },
      { name: 'Susu Evaporasi', detail: '100 ml', role: 'Memberikan sentuhan kuah sedikit keruh gurih tanpa rasa enek santan.' },
      { name: 'Soun & Telur Bebek Rebus', detail: '100 gram & 2 butir', role: 'Isian mangkuk yang lembut mengenyangkan.' }
    ],
    instructions: [
      { title: 'Rebus Kaldu Ayam', text: 'Rebus ayam kampung bersama rempah utuh (cengkeh, kapulaga, kayu manis) hingga ayam empuk. Angkat ayam, tiriskan, dan suwir-suwir.' },
      { title: 'Tumis Bumbu Halus', text: 'Tumis bumbu halus bawang merah, putih, dan pala hingga harum. Masukkan ke dalam kuah kaldu yang mendidih.' },
      { title: 'Penyempurnaan Kuah', text: 'Tuang susu evaporasi ke dalam kuah, aduk rata. Koreksi rasa dengan garam dan merica putih.' },
      { title: 'Penyajian', text: 'Tata ketupat/lontong, soun, suwiran ayam, perkedel kentang, dan irisan telur bebek di mangkuk. Siram kuah mendidih dan beri perasan jeruk limau.' }
    ],
    rating: 4.6,
    ratingCount: 110,
    authorName: 'Resepedia Official',
    isDefault: true
  },
  {
    customId: 'resep-mie-aceh-special',
    title: 'Mie Aceh Kuah Kari Spesial',
    description: 'Mi kuning tebal dengan potongan daging sapi dan udang dalam siraman kuah kari kental rempah pedas khas Serambi Mekkah.',
    image: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?q=80&w=800&auto=format&fit=crop',
    prepTime: '25 Mins',
    cookTime: '15 Mins',
    difficulty: 'Medium',
    calories: '480 kcal',
    category: 'Main Course',
    region: 'Sumatra',
    spicy: true,
    servings: '2 Servings',
    youtubeUrl: 'https://www.youtube.com/embed/U3B9_H6xKxw',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-frying-food-in-a-pan-4307-large.mp4',
    nutrition: { protein: '26g', fat: '22g', carbs: '48g' },
    variations: [
      { title: 'Mie Aceh Goreng Kering', description: 'Kurangi kaldu dan masak hingga bumbu kari terserap pekat ke dalam helai mie.' },
      { title: 'Seafood Komplit', description: 'Gunakan kombinasi udang windu segar, cumi, dan kepiting soka.' }
    ],
    ingredients: [
      { name: 'Mie Kuning Basah Tebal (Mie Hokkien)', detail: '400 gram', role: 'Helai mi kenyal dan tebal yang kokoh menahan kuah kari berat.' },
      { name: 'Daging Sapi / Udang', detail: '200 gram, iris tipis', role: 'Protein gurih pelengkap kelezatan mie.' },
      { name: 'Bumbu Kari Aceh (Jintan, Adas, Bunga Lawang, Cabai Kering)', detail: '3 sdm', role: 'Rempah bumbu kari khas yang hangat pedas menggigit.' },
      { name: 'Tauge Segar & Daun Bawang', detail: '100 gram', role: 'Memberikan kerenyahan tekstur di setiap suapan.' }
    ],
    instructions: [
      { title: 'Tumis Bumbu Rempah', text: 'Tumis irisan bawang merah dan bumbu kari Aceh halus hingga harum dan berminyak.' },
      { title: 'Masak Daging & Sayur', text: 'Masukkan irisan daging sapi dan udang, aduk hingga berubah warna. Tuang kaldu sapi secukupnya.' },
      { title: 'Masukkan Mie', text: 'Masukkan mie kuning, tauge, kecap manis, dan sedikit cuka. Masak dengan api besar hingga bumbu meresap dan kuah mengental.' }
    ],
    rating: 4.8,
    ratingCount: 130,
    authorName: 'Resepedia Official',
    isDefault: true
  },
  {
    customId: 'resep-es-cendol-dawet',
    title: 'Es Cendol Dawet Gula Aren',
    description: 'Minuman penutup manis segar berisikan butiran cendol pandan kenyal, santan kelapa gurih creamy, dan lelehan sirup gula aren murni.',
    image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?q=80&w=800&auto=format&fit=crop',
    prepTime: '15 Mins',
    cookTime: '10 Mins',
    difficulty: 'Easy',
    calories: '210 kcal',
    category: 'Dessert',
    region: 'Jawa',
    spicy: false,
    servings: '2 Servings',
    youtubeUrl: null,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-pouring-milk-into-a-glass-of-ice-4318-large.mp4',
    nutrition: { protein: '2g', fat: '12g', carbs: '35g' },
    variations: [
      { title: 'Topping Nangka', description: 'Tambahkan irisan buah nangka matang manis untuk aroma wangi tropis yang khas.' }
    ],
    ingredients: [
      { name: 'Tepung Beras & Ekstrak Suji Pandan', detail: '100 gram & 50 ml', role: 'Pewarna hijau alami dan aroma pandan wangi pada butiran cendol.' },
      { name: 'Gula Aren Asli', detail: '150 gram, lelehkan', role: 'Karamel manis gurih dengan aroma asap khas gula kelapa aren.' },
      { name: 'Santan Kelapa Matang', detail: '400 ml, rebus dengan pandan', role: 'Kuah gurih kaya yang menyeimbangkan rasa manis aren.' },
      { name: 'Es Serut', detail: 'Secukupnya', role: 'Menyegarkan dahaga di hari terik.' }
    ],
    instructions: [
      { title: 'Buat Cendol', text: 'Masak tepung beras, tepung hunkwe, dan air pandan hingga meletup-letup kental. Cetak di atas baskom berisi air es.' },
      { title: 'Rebus Kinca Gula Aren', text: 'Didihkan gula aren cincang dengan air dan daun pandan hingga larut mengental. Dinginkan.' },
      { title: 'Sajikan', text: 'Tuang sirup gula aren ke dasar gelas saji, beri butiran cendol, es serut, dan siram santan di atasnya.' }
    ],
    rating: 4.7,
    ratingCount: 155,
    authorName: 'Resepedia Official',
    isDefault: true
  },
  {
    customId: 'resep-es-teh-tarik',
    title: 'Es Teh Tarik Melayu Busabusa',
    description: 'Minuman teh susu klasik yang ditarik berulang kali hingga menghasilkan lapisan busa lembut kental dengan cita rasa manis creamy.',
    image: 'https://images.unsplash.com/photo-1544787210-221272718afc?q=80&w=800&auto=format&fit=crop',
    prepTime: '5 Mins',
    cookTime: '5 Mins',
    difficulty: 'Easy',
    calories: '150 kcal',
    category: 'Drink',
    region: 'Sumatra',
    spicy: false,
    servings: '1 Serving',
    youtubeUrl: null,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-pouring-tea-into-a-cup-4316-large.mp4',
    nutrition: { protein: '3g', fat: '5g', carbs: '22g' },
    variations: [
      { title: 'Hangat atau Dingin', description: 'Dapat dinikmati hangat saat cuaca dingin atau dengan es batu saat terik.' }
    ],
    ingredients: [
      { name: 'Teh Hitam Pekat', detail: '2 kantung / 2 sdm', role: 'Rasa teh sepet pekat yang menembus rasa manis susu.' },
      { name: 'Susu Kental Manis', detail: '3 sdm', role: 'Pemberi rasa manis dan tekstur kental.' },
      { name: 'Susu Evaporasi', detail: '2 sdm', role: 'Menambah kelembutan rasa creamy tanpa terlalu manis.' }
    ],
    instructions: [
      { title: 'Seduh Teh', text: 'Seduh teh hitam dalam 150ml air mendidih hingga benar-benar pekat dan wangi.' },
      { title: 'Campurkan Susu', text: 'Campurkan seduhan teh dengan kental manis dan susu evaporasi. Aduk rata.' },
      { title: 'Tarik Teh', text: 'Tuang teh bergantian antara dua cangkir dari ketinggian beberapa kali hingga busa tebal terbentuk. Sajikan dingin dengan es batu.' }
    ],
    rating: 4.6,
    ratingCount: 210,
    authorName: 'Resepedia Official',
    isDefault: true
  },
  {
    customId: 'resep-nasi-goreng-kampung',
    title: 'Nasi Goreng Kampung',
    description: 'Nasi goreng tradisional desa dengan bumbu ulek terasi bakar, bawang merah, cabai rawit pedas, dan aroma smokey wajan wangi.',
    image: 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?q=80&w=800&auto=format&fit=crop',
    prepTime: '10 Mins',
    cookTime: '10 Mins',
    difficulty: 'Easy',
    calories: '410 kcal',
    category: 'Main Course',
    region: 'Jawa',
    spicy: true,
    servings: '2 Servings',
    youtubeUrl: 'https://www.youtube.com/embed/8o4k3D0y55k',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-cooking-fresh-vegetables-in-a-pan-4315-large.mp4',
    nutrition: { protein: '12g', fat: '18g', carbs: '52g' },
    variations: [
      { title: 'Topping Teri Medan', description: 'Goreng renyah teri medan dan taburkan di atas nasi goreng panas.' }
    ],
    ingredients: [
      { name: 'Nasi Putih Dingin (Sisa Kemarin)', detail: '2 piring', role: 'Tekstur nasi kering agar butiran terpisah sempurna dan tidak lembek.' },
      { name: 'Bawang Merah & Putih', detail: '5 butir & 3 siung', role: 'Bumbu ulek dasar.' },
      { name: 'Cabai Rawit Merah', detail: '5 buah', role: 'Sensasi pedas menggugah selera.' },
      { name: 'Terasi Bakar', detail: '1/2 sdt', role: 'Kunci aroma umami gurih tradisional.' },
      { name: 'Telur Ayam', detail: '2 butir', role: 'Diacak di wajan atau digoreng ceplok setengah matang.' }
    ],
    instructions: [
      { title: 'Tumis Bumbu Ulek', text: 'Panaskan minyak, tumis bumbu ulek bawang merah, putih, cabai, dan terasi hingga harum tanak.' },
      { title: 'Orak-Arik Telur', text: 'Sisihkan bumbu di tepi wajan, ceplok telur dan orak-arik hingga berbutir matang.' },
      { title: 'Goreng Nasi', text: 'Masukkan nasi dingin. Bumbui garam, merica, dan sedikit kecap asin. Aduk cepat dengan api besar hingga aroma smoky terbentuk.' }
    ],
    rating: 4.8,
    ratingCount: 180,
    authorName: 'Resepedia Official',
    isDefault: true
  },
  {
    customId: 'resep-ayam-betutu-bali',
    title: 'Ayam Betutu Khas Gilimanuk',
    description: 'Ayam kampung utuh yang dimarinasi bumbu base genep lengkap, dibungkus daun pisang dan dipanggang pelan hingga dagingnya empuk terlepas dari tulang.',
    image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?q=80&w=800&auto=format&fit=crop',
    prepTime: '30 Mins',
    cookTime: '2 Hours',
    difficulty: 'Hard',
    calories: '490 kcal',
    category: 'Main Course',
    region: 'Bali',
    spicy: true,
    servings: '4 Servings',
    youtubeUrl: 'https://www.youtube.com/embed/qg9bNf5Wn14',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-cooking-fresh-vegetables-in-a-pan-4315-large.mp4',
    nutrition: { protein: '34g', fat: '28g', carbs: '10g' },
    variations: [
      { title: 'Bebek Betutu', description: 'Gunakan bebek muda dengan waktu ungkep 3 jam agar bau amis hilang dan daging sangat empuk.' }
    ],
    ingredients: [
      { name: 'Ayam Kampung Utuh', detail: '1 ekor, bersihkan', role: 'Daging ayam kaya kaldu yang lezat dimasak bumbu rempah melimpah.' },
      { name: 'Base Genep (Bawang, Kunyit, Kencur, Jahe, Lengkuas, Terasi, Kemiri)', detail: '150 gram bumbu ulek kasar', role: 'Rempah Bali super aromatik.' },
      { name: 'Daun Singkong Rebus', detail: '100 gram', role: 'Dimasukkan ke dalam rongga perut ayam untuk menyerap sari kaldu.' },
      { name: 'Minyak Kelapa Asli', detail: '3 sdm', role: 'Aroma wangi minyak tandusan Bali.' }
    ],
    instructions: [
      { title: 'Tumis Bumbu Base Genep', text: 'Tumis bumbu rempah rajang bersama minyak kelapa sampai harum matang.' },
      { title: 'Balur & Isi Ayam', text: 'Lumuri bumbu ke seluruh permukaan dan sela-sela kulit ayam. Masukkan daun singkong ke dalam rongga perut.' },
      { title: 'Bungkus & Kukus Panggang', text: 'Bungkus rapat dengan daun pisang dan aluminium foil. Kukus selama 1.5 jam, lalu panggang dalam oven atau arang selama 30 menit hingga harum.' }
    ],
    rating: 4.9,
    ratingCount: 112,
    authorName: 'Resepedia Official',
    isDefault: true
  },
  {
    customId: 'resep-soto-ayam-lamongan',
    title: 'Soto Ayam Lamongan Tabur Koya',
    description: 'Soto ayam kuning gurih khas Jawa Timur dengan suwiran ayam renyah, soun, tauge, dan taburan bubuk koya gurih melimpah.',
    image: 'https://images.unsplash.com/photo-1608897013039-887f21d8c804?q=80&w=800&auto=format&fit=crop',
    prepTime: '25 Mins',
    cookTime: '45 Mins',
    difficulty: 'Medium',
    calories: '310 kcal',
    category: 'Main Course',
    region: 'Jawa',
    spicy: false,
    servings: '4 Servings',
    youtubeUrl: 'https://www.youtube.com/embed/E-9pZqHhK8k',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-serving-food-on-a-plate-at-a-buffet-4309-large.mp4',
    nutrition: { protein: '22g', fat: '14g', carbs: '28g' },
    variations: [
      { title: 'Koya Udang Spesial', description: 'Campurkan kerupuk udang goreng kualitas super dengan bawang putih goreng lalu haluskan.' }
    ],
    ingredients: [
      { name: 'Daging Dada & Paha Ayam', detail: '500 gram', role: 'Direbus menghasilkan kaldu bening gurih lalu digoreng dan disuwir.' },
      { name: 'Kunyit Bakar & Bawang', detail: '4 cm kunyit, 6 bawang merah, 4 putih', role: 'Memberi warna kuah kuning keemasan yang menggoda.' },
      { name: 'Bubuk Koya Gurih', detail: '50 gram (Kerupuk udang + bawang putih goreng)', role: 'Kunci kekentalan dan kegurihan khas Soto Lamongan.' },
      { name: 'Soun & Kol Iris', detail: '100 gram', role: 'Isian mangkuk soto yang menyegarkan.' }
    ],
    instructions: [
      { title: 'Rebus Ayam', text: 'Rebus ayam bersama daun jeruk, serai, dan daun salam hingga matang. Tiriskan ayam, goreng sebentar, lalu suwir.' },
      { title: 'Masak Kuah Kuning', text: 'Tumis bumbu halus kunyit hingga harum matang. Masukkan ke dalam air kaldu rebusan ayam. Bumbui garam, gula, dan merica.' },
      { title: 'Penyajian Lengkap', text: 'Tata soun, kol iris, suwiran ayam, dan irisan seledri di mangkuk. Siram kuah kuning mendidih, lalu taburkan bubuk koya melimpah.' }
    ],
    rating: 4.8,
    ratingCount: 145,
    authorName: 'Resepedia Official',
    isDefault: true
  },
  {
    customId: 'resep-pempek-palembang',
    title: 'Pempek Palembang & Cuko Kental',
    description: 'Pempek kapal selam dan lenjer renyah berbahan ikan tenggiri segar disajikan dengan cuko pedas manis asam kental khas Palembang.',
    image: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?q=80&w=800&auto=format&fit=crop',
    prepTime: '40 Mins',
    cookTime: '30 Mins',
    difficulty: 'Hard',
    calories: '380 kcal',
    category: 'Appetizer',
    region: 'Sumatra',
    spicy: true,
    servings: '4 Servings',
    youtubeUrl: 'https://www.youtube.com/embed/kRj53_p1o9Y',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-frying-food-in-a-pan-4307-large.mp4',
    nutrition: { protein: '18g', fat: '10g', carbs: '54g' },
    variations: [
      { title: 'Pempek Kulit Crispy', description: 'Gunakan campuran kulit ikan tenggiri giling dan daun bawang untuk pempek renyah gurih.' }
    ],
    ingredients: [
      { name: 'Daging Ikan Tenggiri Segar Giling', detail: '500 gram dingin', role: 'Menentukan kekenyalan dan rasa manis ikan asli pempek.' },
      { name: 'Tepung Tapioka / Sagu Tani', detail: '400 gram', role: 'Pengikat adonan agar kenyal pas dan tidak alot.' },
      { name: 'Gula Batok Hitam Linggau', detail: '250 gram', role: 'Kunci kuah cuko hitam pekat, wangi legit tanpa rasa getir.' },
      { name: 'Cabai Rawit Hijau & Bawang Putih', detail: '50 gram & 8 siung', role: 'Pedas menyengat dan aroma khas cuko.' },
      { name: 'Asam Jawa & Cuka Makan', detail: '2 sdm', role: 'Memberi rasa asam segar seimbang.' }
    ],
    instructions: [
      { title: 'Uleni Adonan Pempek', text: 'Campurkan ikan giling dengan air es dingin dan garam hingga kental kenyal. Masukkan tepung sagu sedikit demi sedikit dengan gerakan memotong perlahan agar tidak alot.' },
      { title: 'Bentuk & Rebus', text: 'Bentuk adonan menjadi lonjong (lenjer) atau isi telur utuh (kapal selam). Rebus dalam air mendidih hingga mengapung matang.' },
      { title: 'Buat Cuko', text: 'Didihkan air bersama gula batok dan asam jawa. Masukkan ulekan halus bawang putih dan cabai rawit. Masak hingga mendidih dan menyusut kental, saring.' },
      { title: 'Goreng & Sajikan', text: 'Goreng pempek hingga kulitnya keemasan renyah. Potong-potong dan siram dengan cuko kental beserta potongan timun segar.' }
    ],
    rating: 4.9,
    ratingCount: 168,
    authorName: 'Resepedia Official',
    isDefault: true
  },
  {
    customId: 'resep-bakso-sapi-klasik',
    title: 'Bakso Sapi Kuah Sumsum Klasik',
    description: 'Butiran bakso sapi kenyal gurih alami tanpa pengawet yang disajikan dalam kuah kaldu tulang sumsum gurih panas dengan mi dan caisim.',
    image: 'https://images.unsplash.com/photo-1548946526-f69e2424cfac?q=80&w=800&auto=format&fit=crop',
    prepTime: '30 Mins',
    cookTime: '1 Hour',
    difficulty: 'Medium',
    calories: '420 kcal',
    category: 'Main Course',
    region: 'Jawa',
    spicy: false,
    servings: '4 Servings',
    youtubeUrl: 'https://www.youtube.com/embed/k6aI1eWdZ00',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-stirring-a-stew-in-a-pot-4306-large.mp4',
    nutrition: { protein: '28g', fat: '20g', carbs: '32g' },
    variations: [
      { title: 'Bakso Urat Granat', description: 'Campurkan cincangan urat sapi dan potongan cabai rawit merah di dalam bulatan bakso.' }
    ],
    ingredients: [
      { name: 'Daging Sapi Segar Bagian Paha', detail: '500 gram, potong dingin', role: 'Daging sapi segar menghasilkan kekenyalan alami bakso.' },
      { name: 'Es Batu Hancur', detail: '150 gram', role: 'Menjaga suhu adonan tetap dingin saat digiling agar protein tidak rusak.' },
      { name: 'Tepung Tapioka', detail: '100 gram', role: 'Pengenyal adonan bakso.' },
      { name: 'Tulang Sumsum Sapi', detail: '500 gram (untuk kuah)', role: 'Menghasilkan kaldu gurih pekat berlemak nikmat.' }
    ],
    instructions: [
      { title: 'Giling Halus Daging', text: 'Giling daging sapi bersama es batu, bawang putih goreng, garam, dan merica dalam food processor hingga halus lengket.' },
      { title: 'Bentuk Bulatan Bakso', text: 'Remas adonan di tangan hingga keluar bulatan di antara ibu jari dan telunjuk. Sendokkan ke dalam air panas (bukan mendidih pergolakan) hingga mengapung.' },
      { title: 'Rebus Kuah Kaldu', text: 'Rebus tulang sumsum sapi dengan bawang putih geprek, daun bawang, dan lada hingga keluar kaldu gurihnya. Sajikan bakso dengan kuah panas.' }
    ],
    rating: 4.8,
    ratingCount: 195,
    authorName: 'Resepedia Official',
    isDefault: true
  },
  {
    customId: 'resep-martabak-manis',
    title: 'Martabak Manis Bangka Bersarang',
    description: 'Kue martabak tebal dengan pori-pori bersarang sempurna, olesan mentega Wijsman melimpah, parutan keju cheddar, dan cokelat meses lezat.',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=800&auto=format&fit=crop',
    prepTime: '20 Mins',
    cookTime: '15 Mins',
    difficulty: 'Medium',
    calories: '490 kcal',
    category: 'Dessert',
    region: 'Jawa',
    spicy: false,
    servings: '6 Servings',
    youtubeUrl: 'https://www.youtube.com/embed/Pj13iHhWz9I',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-pouring-milk-into-a-glass-of-ice-4318-large.mp4',
    nutrition: { protein: '8g', fat: '22g', carbs: '64g' },
    variations: [
      { title: 'Martabak Pandan Jagung Keju', description: 'Tambahkan pasta pandan asli ke dalam adonan dan topping pipilan jagung manis susu.' }
    ],
    ingredients: [
      { name: 'Tepung Terigu Protein Sedang', detail: '250 gram', role: 'Menghasilkan struktur kue martabak yang empuk bersarang.' },
      { name: 'Ragi Instan & Baking Soda', detail: '1/2 sdt & 1/2 sdt', role: 'Agen pengembang untuk membentuk pori-pori sarang lebah.' },
      { name: 'Gula Pasir & Telur Ayam', detail: '3 sdm & 1 butir', role: 'Memberi rasa manis dan tekstur lembut.' },
      { name: 'Mentega Wijsman & Keju Cheddar', detail: 'Secukupnya', role: 'Topping klasik wangi gurih mewah.' }
    ],
    instructions: [
      { title: 'Kocok & Diamkan Adonan', text: 'Kocok terigu, gula, ragi, telur, dan air hingga berbuih licin. Tutup dan diamkan selama 1 jam agar ragi bekerja.' },
      { title: 'Panggang di Wajan Tebal', text: 'Larutkan baking soda dengan sedikit air, aduk ke adonan. Tuang ke wajan tebal panas beralas api kecil. Taburi gula saat sarang mulai terbuka, tutup hingga matang.' },
      { title: 'Oles Mentega & Beri Topping', text: 'Angkat martabak, olesi mentega selagi panas. Beri parutan keju, meses, dan susu kental manis. Lipat dan potong potong.' }
    ],
    rating: 4.9,
    ratingCount: 220,
    authorName: 'Resepedia Official',
    isDefault: true
  },
  {
    customId: 'resep-ayam-goreng-lengkuas',
    title: 'Ayam Goreng Lengkuas Serundeng Gurih',
    description: 'Ayam ungkep rempah kuning yang digoreng garing keemasan dengan taburan serundeng lengkuas parut renyah yang melimpah ruah.',
    image: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?q=80&w=800&auto=format&fit=crop',
    prepTime: '20 Mins',
    cookTime: '40 Mins',
    difficulty: 'Easy',
    calories: '380 kcal',
    category: 'Main Course',
    region: 'Jawa',
    spicy: false,
    servings: '4 Servings',
    youtubeUrl: 'https://www.youtube.com/embed/5aY1GZ818-w',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-frying-food-in-a-pan-4307-large.mp4',
    nutrition: { protein: '28g', fat: '24g', carbs: '12g' },
    variations: [
      { title: 'Sambal Terasi Lalap', description: 'Sajikan dengan lalapan daun kemangi, ketimun, dan sambal terasi dadak pedas.' }
    ],
    ingredients: [
      { name: 'Daging Ayam Bagian Paha/Dada', detail: '1 kg, potong 8 bagian', role: 'Protein utama empuk berbalut rempah.' },
      { name: 'Lengkuas Muda Parut Halus', detail: '200 gram', role: 'Kunci taburan serundeng garing renyah keemasan.' },
      { name: 'Kunyit, Jahe, Bawang Merah, Putih', detail: 'Bumbu ulek halus', role: 'Bumbu ungkep wangi gurih meresap.' },
      { name: 'Serai & Daun Salam', detail: '2 batang & 4 lembar', role: 'Aromatik rempah segar saat proses ungkep.' }
    ],
    instructions: [
      { title: 'Ungkep Ayam', text: 'Campurkan ayam, parutan lengkuas, bumbu halus, daun salam, serai, dan sedikit air. Masak dengan api sedang hingga air menyusut dan ayam matang empuk.' },
      { title: 'Goreng Ayam', text: 'Pisahkan ayam dari ampas lengkuas. Goreng ayam dalam minyak panas hingga berwarna cokelat keemasan, angkat.' },
      { title: 'Goreng Serundeng Lengkuas', text: 'Goreng ampas parutan lengkuas hingga renyah keemasan. Tiriskan dan taburkan di atas ayam goreng hangat.' }
    ],
    rating: 4.8,
    ratingCount: 135,
    authorName: 'Resepedia Official',
    isDefault: true
  },
  {
    customId: 'resep-es-teler-klasik',
    title: 'Es Teler Sultan Buah Komplit',
    description: 'Minuman es campur legendaris berisikan serutan alpukat mentega creamy, kelapa muda segar, irisan nangka wangi dalam kuah santan susu legit.',
    image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?q=80&w=800&auto=format&fit=crop',
    prepTime: '15 Mins',
    cookTime: '0 Mins',
    difficulty: 'Easy',
    calories: '260 kcal',
    category: 'Dessert',
    region: 'Jawa',
    spicy: false,
    servings: '2 Servings',
    youtubeUrl: 'https://www.youtube.com/embed/p1o1c-4t52M',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-pouring-milk-into-a-glass-of-ice-4318-large.mp4',
    nutrition: { protein: '3g', fat: '12g', carbs: '38g' },
    variations: [
      { title: 'Es Teler Durian', description: 'Tambahkan 1-2 butir daging durian montong manis legit di atas es teler.' }
    ],
    ingredients: [
      { name: 'Alpukat Mentega Matang', detail: '1 buah, keruk dagingnya', role: 'Sensasi rasa creamy alami yang lumer di lidah.' },
      { name: 'Kelapa Muda Keruk', detail: '1 butir beserta sedikit airnya', role: 'Kesegaran alami air kelapa muda.' },
      { name: 'Buah Nangka Masak', detail: '5 butir, buang biji iris memanjang', role: 'Wangi harum manis buah tropis Indonesia.' },
      { name: 'Susu Kental Manis & Sirup Gula', detail: 'Secukupnya', role: 'Pemanis creamy pengikat seluruh komponen buah.' }
    ],
    instructions: [
      { title: 'Tata Buah-Buahan', text: 'Susun kerukan alpukat, kelapa muda, dan irisan nangka ke dalam mangkuk saji.' },
      { title: 'Beri Es Serut', text: 'Beri es batu serut secukupnya hingga menggunung menutupi buah.' },
      { title: 'Siram Kuah Manis', text: 'Tuangkan susu kental manis dan sirup gula secara merata. Sajikan dingin segera.' }
    ],
    rating: 4.8,
    ratingCount: 172,
    authorName: 'Resepedia Official',
    isDefault: true
  },
  {
    customId: 'resep-sambal-goreng-kentang-ati',
    title: 'Sambal Goreng Kentang Ati Sapi',
    description: 'Potongan dadu kentang goreng dan hati sapi empuk berbalut kuah sambal balado santan kental yang gurih pedas manis khas hajatan Jawa.',
    image: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?q=80&w=800&auto=format&fit=crop',
    prepTime: '25 Mins',
    cookTime: '25 Mins',
    difficulty: 'Medium',
    calories: '290 kcal',
    category: 'Appetizer',
    region: 'Jawa',
    spicy: true,
    servings: '4 Servings',
    youtubeUrl: 'https://www.youtube.com/embed/5k4y5j-vW00',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-cooking-fresh-vegetables-in-a-pan-4315-large.mp4',
    nutrition: { protein: '16g', fat: '18g', carbs: '20g' },
    variations: [
      { title: 'Tambah Petai Wangi', description: 'Masukkan potongan petai segar saat kuah sambal mulai mengering.' }
    ],
    ingredients: [
      { name: 'Kentang Segar', detail: '500 gram, potong dadu kecil', role: 'Digoreng garing setengah matang agar bentuknya kokoh.' },
      { name: 'Hati Sapi Segar', detail: '250 gram, rebus dan potong dadu', role: 'Sumber zat besi kaya rasa gurih.' },
      { name: 'Cabai Merah Keriting & Besar', detail: '12 buah, haluskan', role: 'Warna merah pekat dan rasa pedas mantap.' },
      { name: 'Santan Kental Kelapa', detail: '100 ml', role: 'Rasa gurih mengikat bumbu sambal.' }
    ],
    instructions: [
      { title: 'Goreng Bahan Utama', text: 'Goreng kentang dadu hingga berkulit keemasan, tiriskan. Rebus hati sapi dengan jahe, potong dadu, lalu goreng sebentar.' },
      { title: 'Tumis Bumbu Sambal', text: 'Tumis bumbu halus cabai, bawang merah, bawang putih, lengkuas, dan daun salam hingga berminyak wangi.' },
      { title: 'Masak dengan Santan', text: 'Tuang santan, beri garam dan gula merah. Masukkan hati sapi dan kentang goreng. Aduk perlahan hingga kuah mengering dan meresap rata.' }
    ],
    rating: 4.7,
    ratingCount: 88,
    authorName: 'Resepedia Official',
    isDefault: true
  },
  {
    customId: 'resep-ayam-taliwang-lombok',
    title: 'Ayam Taliwang Bakar Khas Lombok',
    description: 'Ayam bakar khas pulau Lombok dengan olesan bumbu cabai rawit pedas menyengat, terasi bakar harum, dan aroma smoky khas panggangan arang.',
    image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?q=80&w=800&auto=format&fit=crop',
    prepTime: '25 Mins',
    cookTime: '40 Mins',
    difficulty: 'Medium',
    calories: '410 kcal',
    category: 'Main Course',
    region: 'Bali',
    spicy: true,
    servings: '4 Servings',
    youtubeUrl: 'https://www.youtube.com/embed/59J6u1uWp-w',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-putting-raw-meat-on-a-hot-grill-4304-large.mp4',
    nutrition: { protein: '32g', fat: '22g', carbs: '8g' },
    variations: [
      { title: 'Taliwang Goreng', description: 'Setelah diungkep dengan bumbu, ayam digoreng dalam minyak panas melimpah.' }
    ],
    ingredients: [
      { name: 'Ayam Kampung Muda', detail: '1 ekor, belah dada tidak putus (bekakak)', role: 'Ayam muda memiliki daging super lembut yang cepat menyerap bumbu.' },
      { name: 'Cabai Rawit & Merah Keriting', detail: '15 buah & 8 buah', role: 'Tingkat kepedasan khas Lombok yang nendang.' },
      { name: 'Terasi Bakar Khas Lombok', detail: '1 sdt', role: 'Aroma udang fermentasi autentik yang harum kuat.' },
      { name: 'Jeruk Limau', detail: '2 buah', role: 'Perasan asam segar di akhir pemanggangan.' }
    ],
    instructions: [
      { title: 'Ungkep Bumbu Taliwang', text: 'Tumis bumbu halus cabai, bawang, kencur, dan terasi hingga harum. Masukkan ayam dan sedikit air, masak sampai ayam empuk dan bumbu menyusut.' },
      { title: 'Panggang di Atas Arang', text: 'Bakar ayam di atas bara arang sambil terus dibaluri sisa bumbu tumisan taliwang hingga kedua sisinya agak gosong harum.' },
      { title: 'Sajikan dengan Sambal Beberuk', text: 'Beri perasan air jeruk limau di atas ayam bakar panas. Nikmati bersama plecing kangkung atau sambal beberuk terong.' }
    ],
    rating: 4.8,
    ratingCount: 140,
    authorName: 'Resepedia Official',
    isDefault: true
  }
];

async function seedFirestore() {
  console.log('🔥 Memulai proses penanaman 20 Resep Autentik Nusantara ke Cloud Firestore...');

  let inserted = 0;
  let updated = 0;

  for (const recipeData of SEED_RECIPES) {
    const { customId, ...data } = recipeData;
    const docRef = adminDb.collection('recipes').doc(customId);
    const existing = await docRef.get();

    const shortId = customId.replace('resep-', '').substring(0, 6);
    const slug = createSlug(data.title, shortId);
    const ingredientNames = data.ingredients.map((i) => i.name.toLowerCase().trim());
    const searchKeywords = generateKeywords(data.title, data.region, data.ingredients);

    const docPayload: RecipeDocument = {
      id: customId,
      slug,
      ...data,
      authorId: data.authorId || null,
      ingredientNames,
      searchKeywords,
      createdAt: existing.exists && existing.data()?.createdAt ? existing.data()?.createdAt : Date.now(),
    };

    await docRef.set(docPayload, { merge: true });

    if (existing.exists) {
      updated++;
      console.log(`  ↻ [Updated] ${data.title} (${slug})`);
    } else {
      inserted++;
      console.log(`  + [Inserted] ${data.title} (${slug})`);
    }
  }

  console.log(`\n🎉 SELESAI! Total resep: ${SEED_RECIPES.length} (${inserted} baru, ${updated} diperbarui).`);
  console.log('Seluruh resep kini tersimpan di Cloud Firestore dengan indeks dan slug terstandarisasi.');
}

seedFirestore().catch((err) => {
  console.error('❌ Gagal melakukan seeding Firestore:', err);
  process.exit(1);
});
