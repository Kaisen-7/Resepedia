/**
 * Resepedia — Kitab Rempah & Almanak Substitusi Bumbu Nusantara
 * Basis data terkurasi 100% deterministik, bebas biaya API, dan bekerja instan offline.
 */

import { SpiceAlmanacEntry } from '@/types/recipe.types';

export const SPICE_ALMANAC: SpiceAlmanacEntry[] = [
  {
    id: 'kemiri',
    name: 'Kemiri',
    regionalName: 'Muncang (Sunda), Aleh (Aceh)',
    aliases: ['kemiri', 'candlenut', 'muncang', 'buah keras'],
    category: 'Bumbu Kering',
    flavorProfile: 'Gurih berminyak, nutty pekat, sedikit manis setelah disangrai.',
    culinaryRole: 'Pengental alami kuah gulai, rawon, dan soto, serta perekat rasa rempah pada bumbu halus.',
    substitutes: [
      {
        name: 'Kacang Mede (Cashew) Sangrai',
        ratio: '1 butir kemiri = 1 butir kacang mede',
        notes: 'Alternatif terbaik karena memiliki kadar minyak dan tekstur gurih creamy yang paling identik.',
      },
      {
        name: 'Kacang Macadamia / Almond Panggang',
        ratio: '1 butir kemiri = 1 butir macadamia / 2 butir almond kupas',
        notes: 'Sangat cocok untuk masakan berkuah santan saat di luar negeri.',
      },
    ],
    storageTip: 'Sangrai sebentar sebelum disimpan di toples kedap udara agar tidak apek dan tahan hingga 6 bulan.',
  },
  {
    id: 'kluwek',
    name: 'Kluwek / Kepayang',
    regionalName: 'Pangi (Toraja/Minahasa), Picung (Sunda)',
    aliases: ['kluwek', 'keluwek', 'kluwak', 'pangi', 'picung', 'kepayang'],
    category: 'Bumbu Kering',
    flavorProfile: 'Gurih earthy, sedikit pahit-asam umami yang khas dan mendalam.',
    culinaryRole: 'Pemberi warna hitam legam alami dan cita rasa khas Rawon Jawa Timur serta Sup Konro Makassar.',
    substitutes: [
      {
        name: 'Kecap Manis Pekat + Bubuk Kopi Hitam Murni (Seujung Sendok)',
        ratio: '1 sdt per 2 kluwek',
        notes: 'Hanya mereplikasi rona gelap kecokelatan dan sedikit semburat pahit earthy, bukan rasa aslinya.',
      },
      {
        name: 'Tinta Cumi + Sedikit Asam Jawa',
        ratio: '1/2 sdt tinta per mangkuk',
        notes: 'Untuk mendapatkan warna gelap pekat dan rasa gurih alami pada masakan daging.',
      },
    ],
    storageTip: 'Pilih yang saat diguncang berbunyi dan daging buah di dalamnya berwarna hitam pekat tidak berbau tengik.',
  },
  {
    id: 'lengkuas',
    name: 'Lengkuas / Laos',
    regionalName: 'Laja (Sunda), Lengkueh (Minang)',
    aliases: ['lengkuas', 'laos', 'laja', 'galangal'],
    category: 'Rimpang',
    flavorProfile: 'Pedas segar getir, wangi sitrus pinus tajam, tidak sepedas jahe.',
    culinaryRole: 'Penghilang aroma amis daging, bumbu dasar rendang, sayur asem, gulai, dan ayam goreng lengkuas.',
    substitutes: [
      {
        name: 'Jahe Segar + Parutan Kulit Jeruk Purut',
        ratio: '1 cm lengkuas = 1 cm jahe + sejumput kulit jeruk purut',
        notes: 'Membantu meniru aroma pinus sitrus khas rimpang laos.',
      },
      {
        name: 'Bubuk Lengkuas Kering (Galangal Powder)',
        ratio: '1 cm lengkuas segar = 1/2 sdt bubuk lengkuas',
        notes: 'Larutkan dalam sedikit air hangat sebelum ditumis.',
      },
    ],
    storageTip: 'Bungkus dengan kertas koran atau tisu kering, simpan di laci bawah kulkas hingga 3 minggu.',
  },
  {
    id: 'kencur',
    name: 'Kencur',
    regionalName: 'Cikur (Sunda), Ceuko (Aceh)',
    aliases: ['kencur', 'cikur', 'kaempferia galanga', 'aromatic ginger'],
    category: 'Rimpang',
    flavorProfile: 'Wangi herbal hangat menusuk yang sangat khas, segar pedas aromatik.',
    culinaryRole: 'Bumbu utama Seblak, Sambal Pecel, Urap Sayur, dan Rempeyek.',
    substitutes: [
      {
        name: 'Jahe Muda + Sedikit Batang Serai Bagian Putih Halus',
        ratio: '1 cm kencur = 1/2 cm jahe + 1/2 sdt serai cincang',
        notes: 'Memberikan kehangatan segar meski tidak memiliki aroma cikur yang spesifik.',
      },
    ],
    storageTip: 'Simpan di suhu ruang dengan sirkulasi udara baik, hindari kantong plastik tertutup agar tidak cepat bertunas.',
  },
  {
    id: 'kunyit',
    name: 'Kunyit',
    regionalName: 'Koneng (Sunda), Kunir (Jawa)',
    aliases: ['kunyit', 'kunir', 'koneng', 'turmeric'],
    category: 'Rimpang',
    flavorProfile: 'Hangat bersahaja (earthy), sedikit pahit getir dengan aroma musky khas.',
    culinaryRole: 'Pewarna kuning alami nasi tumpeng, bumbu kari/opor, serta pengawet dan antibakteri alami masakan.',
    substitutes: [
      {
        name: 'Kunyit Bubuk Murni',
        ratio: '2 cm kunyit segar = 1/2 sdt kunyit bubuk',
        notes: 'Sangat praktis dan memiliki daya warna kuning yang konsisten.',
      },
      {
        name: 'Saffron (Kuma-kuma)',
        ratio: 'Beberapa helai saffron',
        notes: 'Pewarna kuning mewah alternatif jika memasak di luar negeri.',
      },
    ],
    storageTip: 'Kupas dan bekukan dalam freezer, atau rendam dalam toples berisi air bersih yang diganti berkala.',
  },
  {
    id: 'jahe',
    name: 'Jahe',
    regionalName: 'Lia (Flores), Sipodeh (Minang)',
    aliases: ['jahe', 'ginger', 'jahe merah', 'jahe gajah'],
    category: 'Rimpang',
    flavorProfile: 'Pedas menggigit, hangat menghangatkan dada, manis sitrus lembut.',
    culinaryRole: 'Pelezat kuah soto, bumbu ungkep ayam, ikan bakar, dan minuman tradisional wedang.',
    substitutes: [
      {
        name: 'Jahe Bubuk (Ground Ginger)',
        ratio: '1 ruas jahe segar (3 cm) = 1/2 sdt jahe bubuk',
        notes: 'Tambahkan di awal proses penumisan agar aromanya menyatu sempurna.',
      },
    ],
    storageTip: 'Keringkan kulitnya, lalu simpan dalam wadah berventilasi pada suhu sejuk.',
  },
  {
    id: 'daun-jeruk',
    name: 'Daun Jeruk Purut',
    regionalName: 'Daun Limau (Minang)',
    aliases: ['daun jeruk', 'daun jeruk purut', 'kaffir lime leaves', 'makrut lime'],
    category: 'Daun & Batang',
    flavorProfile: 'Segar sitrus tajam, membangkitkan selera makan, sangat harum.',
    culinaryRole: 'Menghilangkan bau amis pada masakan daging dan santan, bumbu sambal matah, dan rendang.',
    substitutes: [
      {
        name: 'Parutan Kulit Jeruk Nipis / Lemon (Zest)',
        ratio: '2 lembar daun jeruk = 1/2 sdt parutan kulit jeruk hijau',
        notes: 'Gunakan hanya bagian kulit hijau luarnya (jangan kena bagian putih yang pahit).',
      },
    ],
    storageTip: 'Buang tulang daunnya, masukkan ke dalam plastik klip, lalu bekukan di freezer hingga 6 bulan.',
  },
  {
    id: 'daun-salam',
    name: 'Daun Salam',
    regionalName: 'Indonesian Bay Leaf, Daun Meseyi',
    aliases: ['daun salam', 'indonesian bay leaf', 'salam'],
    category: 'Daun & Batang',
    flavorProfile: 'Herbal kayu lembut, memberi aroma rempah matang saat direbus bersama kuah.',
    culinaryRole: 'Penyeimbang aroma sayur lodeh, opor, rendang, dan nasi uduk.',
    substitutes: [
      {
        name: 'European Bay Leaf (Daun Laurel Barat)',
        ratio: '2 lembar daun salam = 1 lembar bay leaf barat',
        notes: 'Bay leaf barat aromanya lebih tajam/menthol, gunakan sedikit saja.',
      },
    ],
    storageTip: 'Daun salam kering tetap beraroma harum jika disimpan dalam wadah rapat terhindar dari sinar matahari langsung.',
  },
  {
    id: 'serai',
    name: 'Serai / Sereh',
    regionalName: 'Sorai (Minang), Sere (Jawa)',
    aliases: ['serai', 'sereh', 'lemongrass'],
    category: 'Daun & Batang',
    flavorProfile: 'Aroma lemon sitrus herba yang bersih dan menyegarkan.',
    culinaryRole: 'Digerus atau dimemarkan untuk kuah soto, tongseng, bumbu bali, dan sambal rica-rica.',
    substitutes: [
      {
        name: 'Perasan Lemon/Jeruk Nipis + Sedikit Daun Jeruk',
        ratio: '1 batang serai = 1/2 sdt air jeruk nipis + 1 lembar daun jeruk',
        notes: 'Menghadirkan profil segar lemon-herba pada kuah.',
      },
    ],
    storageTip: 'Potong daun atasnya, bungkus batangnya dengan kertas lembap dan simpan di laci sayur kulkas.',
  },
  {
    id: 'asam-kandis',
    name: 'Asam Kandis',
    regionalName: 'Garcinia xanthochymus',
    aliases: ['asam kandis', 'kandis'],
    category: 'Buah & Asam',
    flavorProfile: 'Asam segar pekat tanpa merusak warna kuah, tidak membuat kuah menjadi keruh.',
    culinaryRole: 'Bumbu wajib Rendang Padang otentik, Gulai Ikan Mas, dan Asam Padeh.',
    substitutes: [
      {
        name: 'Asam Gelugur atau Asam Jawa Kental',
        ratio: '1 keping asam kandis = 1/2 sdt asam jawa yang dilarutkan',
        notes: 'Asam jawa membuat kuah sedikit lebih manis, tambahkan bertahap.',
      },
      {
        name: 'Belimbing Wuluh / Tomat Hijau Iris',
        ratio: '1 keping asam kandis = 2 buah belimbing wuluh',
        notes: 'Cocok untuk masakan seafood dan sup pedas asam.',
      },
    ],
    storageTip: 'Simpan di toples kaca kering; asam kandis yang bagus berwarna hitam kecokelatan kering berkilap.',
  },
  {
    id: 'terasi',
    name: 'Terasi / Belacan',
    regionalName: 'Belacan (Melayu/Sumatra), Petis (beda varian)',
    aliases: ['terasi', 'belacan', 'shrimp paste', 'terasi udang'],
    category: 'Pelengkap',
    flavorProfile: 'Umami fermentasi udang yang pekat, asin gurih beraroma laut kuat.',
    culinaryRole: 'Jiwa dari Sambal Terasi, Tumis Kangkung, Nasi Goreng Kampung, dan Sayur Asem.',
    substitutes: [
      {
        name: 'Kecap Ikan Fermentasi (Fish Sauce) Berkualitas',
        ratio: '1 sdt terasi = 1 sdm kecap ikan kental',
        notes: 'Memberikan tendangan umami seafood fermentasi yang sangat mirip.',
      },
      {
        name: 'Pasta Miso Jepang + Sejumput Ebi Kering Halus',
        ratio: '1 sdt terasi = 1 sdt red miso + 1/2 sdt ebi bubuk',
        notes: 'Pilihan luar biasa untuk masakan rumahan jika kehabisan terasi.',
      },
    ],
    storageTip: 'Bakar atau sangrai terlebih dahulu, lalu masukkan ke toples kaca kedap udara agar aromanya tidak menyebar ke kulkas.',
  },
  {
    id: 'santan',
    name: 'Santan Kelapa',
    regionalName: 'Parih (Toraja), Santen (Jawa)',
    aliases: ['santan', 'santan kental', 'santan encer', 'coconut milk', 'kelapa parut'],
    category: 'Pelengkap',
    flavorProfile: 'Manis gurih lembut, berlemak krim alami, lembut di lidah.',
    culinaryRole: 'Basis kuah rendang, gulai, opor, soto betawi, dan aneka kue basah nusantara.',
    substitutes: [
      {
        name: 'Susu Evaporasi Tawar (Evaporated Milk)',
        ratio: '1:1 pengganti santan encer/sedang',
        notes: 'Sangat umum dipakai pada Soto Betawi modern dan Kari karena creamy tanpa mudah pecah minyak.',
      },
      {
        name: 'Krimer Nabati Bubuk + Sedikit Minyak Kelapa Murni',
        ratio: '3 sdm krimer bubuk + 200 ml air hangat',
        notes: 'Alternatif rendah kolesterol dan praktis untuk stok darurat.',
      },
    ],
    storageTip: 'Santan peras segar harus langsung direbus sampai mendidih lalu dibekukan jika tidak langsung dipakai hari itu.',
  },
  {
    id: 'andaliman',
    name: 'Andaliman / Merica Batak',
    regionalName: 'Tuba (Karo), Sichuan Pepper Batak',
    aliases: ['andaliman', 'itir-itir', 'batak pepper'],
    category: 'Bumbu Kering',
    flavorProfile: 'Pedas menggigit dengan sensasi kebas getir (numbing) sitrus lemon di lidah.',
    culinaryRole: 'Bumbu wajib hidangan khas Danau Toba seperti Arsik Ikan Mas, Saksang, dan Sambal Tuk-tuk.',
    substitutes: [
      {
        name: 'Sichuan Pepper Cina + Sedikit Parutan Kulit Jeruk Nipis',
        ratio: '1:1',
        notes: 'Keluarga botani yang sama (Zanthoxylum) dengan efek kebas lidah yang sangat serupa.',
      },
    ],
    storageTip: 'Keringkan dengan cara diangin-anginkan lalu simpan di tempat kering kedap udara.',
  },
  {
    id: 'bunga-lawang',
    name: 'Bunga Lawang / Pekak',
    regionalName: 'Star Anise',
    aliases: ['bunga lawang', 'pekak', 'star anise'],
    category: 'Bumbu Kering',
    flavorProfile: 'Manis rempah hangat, semburat adas licorice harum mendalam.',
    culinaryRole: 'Bumbu gulai aceh, kuah sop kambing, rendang, dan semur.',
    substitutes: [
      {
        name: 'Biji Adas Manis (Fennel Seeds) Halus',
        ratio: '1 buah bunga lawang = 1/2 sdt biji adas halus',
        notes: 'Memberikan karakter rasa manis herbal yang mendekati.',
      },
    ],
    storageTip: 'Simpan kelopak utuh dalam wadah kedap udara; jangan ditumbuk sebelum siap digunakan.',
  },
  {
    id: 'ketumbar',
    name: 'Ketumbar',
    regionalName: 'Coriander Seeds',
    aliases: ['ketumbar', 'coriander', 'ketumbar sangrai'],
    category: 'Bumbu Kering',
    flavorProfile: 'Wangi kayu sitrus hangat, gurih ringan saat disangrai.',
    culinaryRole: 'Bumbu marinasi tempe goreng, ayam goreng kalasan, bacem, dan aneka soto nusantara.',
    substitutes: [
      {
        name: 'Ketumbar Bubuk',
        ratio: '1 sdt ketumbar butiran = 3/4 sdt ketumbar bubuk',
        notes: 'Pilih bubuk yang warnanya cokelat keemasan cerah.',
      },
      {
        name: 'Jinten Halus + Sedikit Parutan Lemon (Kondisi Darurat)',
        ratio: '1 sdt ketumbar = 1/3 sdt jinten halus',
        notes: 'Jinten aromanya lebih kuat, gunakan dalam porsi kecil.',
      },
    ],
    storageTip: 'Selalu sangrai kering sebentar di wajan sebelum dihaluskan agar minyak aromatiknya keluar maksimal.',
  },
  {
    id: 'asam-jawa',
    name: 'Asam Jawa',
    regionalName: 'Tamarind, Celagi (Bali)',
    aliases: ['asam jawa', 'tamarind', 'celagi', 'air asam'],
    category: 'Buah & Asam',
    flavorProfile: 'Asam manis legit, mengentalkan kuah dengan warna kecokelatan hangat.',
    culinaryRole: 'Bumbu Sayur Asem, Tahu Tempe Bacem, Bumbu Rujak, dan marinasi penghilang amis ikan.',
    substitutes: [
      {
        name: 'Air Perasan Jeruk Nipis / Lemon + Sejumput Gula Merah',
        ratio: '1 sdm air asam jawa = 1 sdm air nipis + 1/2 sdt gula merah serut',
        notes: 'Keseimbangan rasa asam manisnya cukup mendekati untuk masakan sup dan saus.',
      },
    ],
    storageTip: 'Padatkan asam jawa di wadah tertutup, tambahkan sedikit garam di permukaannya agar awet berbulan-bulan.',
  },
  {
    id: 'belimbing-wuluh',
    name: 'Belimbing Sayur / Wuluh',
    regionalName: 'Averrhoa bilimbi',
    aliases: ['belimbing wuluh', 'belimbing sayur', 'belimbing buluh'],
    category: 'Buah & Asam',
    flavorProfile: 'Asam segar menusuk dengan kadar air tinggi dan sensasi renyah.',
    culinaryRole: 'Bumbu asam segar Garang Asem, Pindang Kudus, Ikan Asam Pedas, dan Sambal Belimbing.',
    substitutes: [
      {
        name: 'Tomat Hijau Segar Iris',
        ratio: '2 buah belimbing wuluh = 1 buah tomat hijau sedang',
        notes: 'Memberikan keasaman segar dan tekstur renyah yang hampir mirip di dalam kuah sup.',
      },
      {
        name: 'Air Perasan Jeruk Nipis',
        ratio: '2 buah belimbing wuluh = 1 sdt air jeruk nipis di akhir masakan',
        notes: 'Masukkan sesaat sebelum api dimatikan agar rasa segarnya tidak pudar.',
      },
    ],
    storageTip: 'Simpan belimbing wuluh tanpa dicuci di laci sayur kulkas agar tidak cepat lembek.',
  },
  {
    id: 'daun-kunyit',
    name: 'Daun Kunyit',
    regionalName: 'Turmeric Leaf',
    aliases: ['daun kunyit', 'turmeric leaves'],
    category: 'Daun & Batang',
    flavorProfile: 'Aromatik herbal hangat yang harum khas Melayu-Minangkabau.',
    culinaryRole: 'Wajib ada pada Gulai Kepala Ikan Kakap, Rendang, Kalio, dan Masakan Padang autentik.',
    substitutes: [
      {
        name: 'Kombinasi Daun Salam + Daun Jeruk + Sedikit Kunyit Parut',
        ratio: '1 lembar daun kunyit = 1 daun salam + 2 daun jeruk + seiris kunyit',
        notes: 'Membantu meniru kompleksitas aroma rempah Minang.',
      },
    ],
    storageTip: 'Ikat simpul daunnya dan bekukan dalam wadah kedap udara.',
  },
  {
    id: 'kecombrang',
    name: 'Kecombrang / Honje',
    regionalName: 'Kincung (Medan), Sambuang (Minang), Honje (Sunda)',
    aliases: ['kecombrang', 'honje', 'kincung', 'torch ginger flower'],
    category: 'Daun & Batang',
    flavorProfile: 'Floral sitrus unik, pedas segar eksotis, wangi seperti bunga liar.',
    culinaryRole: 'Bahan Sambal Matah Kecombrang, Arsik Batak, Nasi Megono Pekalongan, dan Sayur Asam Sunda.',
    substitutes: [
      {
        name: 'Kulit Jeruk Purut Halus + Batang Serai Muda Iris Tipis',
        ratio: '1/2 kuntum kecombrang = 1 batang serai muda + 1/4 sdt parutan kulit jeruk',
        notes: 'Memberi sensasi segar aromatik floral yang mendekati.',
      },
    ],
    storageTip: 'Bungkus kelopak bunganya rapat-rapat dengan kertas dan simpan di kulkas maksimal 5 hari.',
  },
  {
    id: 'gula-merah',
    name: 'Gula Merah / Gula Aren',
    regionalName: 'Gula Jawa, Palm Sugar',
    aliases: ['gula merah', 'gula aren', 'gula kelapa', 'gula jawa', 'palm sugar'],
    category: 'Pelengkap',
    flavorProfile: 'Manis karamel hangat legam, beraroma asap lembut nira alami.',
    culinaryRole: 'Pemberi warna cokelat gelap dan penyeimbang bumbu gurih pedas pada Rendang, Semur, Bacem, dan Gudeg.',
    substitutes: [
      {
        name: 'Dark Brown Sugar (Gula Semut Cokelat)',
        ratio: '1:1',
        notes: 'Mengandung molase yang memberi aroma karamel dan warna gelap serupa.',
      },
    ],
    storageTip: 'Simpan di wadah rapat kering agar tidak mencair (berair) karena kelembapan udara.',
  },
];

/**
 * Mencari entri bumbu berdasarkan nama atau kata kunci bahan
 */
export function findSpiceByIngredientName(ingredientName: string): SpiceAlmanacEntry | null {
  const clean = ingredientName.toLowerCase().trim();
  for (const spice of SPICE_ALMANAC) {
    if (spice.aliases.some((alias) => clean.includes(alias) || alias.includes(clean))) {
      return spice;
    }
  }
  return null;
}

/**
 * Filter daftar bumbu berdasarkan query pencarian dan kategori
 */
export function searchSpices(
  query: string,
  categoryFilter: string = 'All'
): SpiceAlmanacEntry[] {
  const q = query.toLowerCase().trim();
  return SPICE_ALMANAC.filter((spice) => {
    const matchesCategory =
      categoryFilter === 'All' || spice.category === categoryFilter;
    if (!matchesCategory) return false;

    if (!q) return true;
    return (
      spice.name.toLowerCase().includes(q) ||
      (spice.regionalName && spice.regionalName.toLowerCase().includes(q)) ||
      spice.aliases.some((a) => a.includes(q)) ||
      spice.flavorProfile.toLowerCase().includes(q) ||
      spice.substitutes.some((s) => s.name.toLowerCase().includes(q))
    );
  });
}
