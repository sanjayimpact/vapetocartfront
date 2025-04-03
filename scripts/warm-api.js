// scripts/warm-api.js
import axios from 'axios';

const slugs = ['disposable-vape','nic-salts','vape-kits','e-liquids','pods','accessories','nicotine-pouches']; // Add more slugs as needed
const BASE_URL = 'https://productapi-g4k9.vercel.app';

async function warmUp() {
  console.log('🟡 Starting API warm-up...');

  for (const slug of slugs) {
    try {
      const res = await axios.get(`${BASE_URL}/api/catpro/${slug}`);
   
      console.log(`✅ Warmed: /api/catpro/${slug} - ${res.status}`);
    } catch (err) {
      console.error(`❌ Failed to warm /api/catpro/${slug}`, err.message);
    }
  }
}

setTimeout(() => {
  warmUp();
}, 2000); // wait for 3 seconds to ensure dev server is ready
