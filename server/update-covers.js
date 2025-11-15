const pool = require('./config/db');

const covers = {
  "Abbey Road": "https://upload.wikimedia.org/wikipedia/en/4/42/Beatles_-_Abbey_Road.jpg",
  "The Dark Side of the Moon": "https://upload.wikimedia.org/wikipedia/en/3/3b/Dark_Side_of_the_Moon.png",
  "Led Zeppelin IV": "https://upload.wikimedia.org/wikipedia/en/2/26/Led_Zeppelin_-_Led_Zeppelin_IV.jpg",
  "Rumours": "https://upload.wikimedia.org/wikipedia/en/f/fb/FMacRumours.PNG",
  "Hotel California": "https://upload.wikimedia.org/wikipedia/en/4/49/Hotelcalifornia.jpg",
  "Thriller": "https://upload.wikimedia.org/wikipedia/en/5/55/Michael_Jackson_-_Thriller.png",
  "Purple Rain": "https://upload.wikimedia.org/wikipedia/en/9/9c/Purple_Rain_%28album%29.jpg",
  "21": "https://upload.wikimedia.org/wikipedia/en/1/1b/Adele_-_21.png",
  "1989": "https://upload.wikimedia.org/wikipedia/en/f/f6/Taylor_Swift_-_1989.png",
  "Lemonade": "https://upload.wikimedia.org/wikipedia/en/5/53/Beyonce_-_Lemonade_%28Official_Album_Cover%29.png",
  "The Chronic": "https://upload.wikimedia.org/wikipedia/en/c/c4/Dr._Dre_-_The_Chronic.jpg",
  "Illmatic": "https://upload.wikimedia.org/wikipedia/en/2/27/IllmaticNas.jpg",
  "The Miseducation of Lauryn Hill": "https://upload.wikimedia.org/wikipedia/en/f/ff/Lauryn_Hill_-_The_Miseducation_of_Lauryn_Hill.png",
  "good kid, m.A.A.d city": "https://upload.wikimedia.org/wikipedia/en/5/51/Kendrick_Lamar_-_Good_Kid%2C_M.A.A.D_City.png",
  "My Beautiful Dark Twisted Fantasy": "https://upload.wikimedia.org/wikipedia/en/5/51/Mbdtf_album_cover.jpg",
  "OK Computer": "https://upload.wikimedia.org/wikipedia/en/b/ba/Radioheadokcomputer.png",
  "Nevermind": "https://upload.wikimedia.org/wikipedia/en/b/b7/NirvanaNevermindalbumcover.jpg",
  "In Rainbows": "https://upload.wikimedia.org/wikipedia/en/1/14/Inrainbowscover.png",
  "AM": "https://upload.wikimedia.org/wikipedia/en/0/04/Arctic_Monkeys_-_AM.png",
  "Kid A": "https://upload.wikimedia.org/wikipedia/en/b/b5/Radiohead.kida.albumart.png",
  "What's Going On": "https://upload.wikimedia.org/wikipedia/en/c/c1/Marvin_Gaye_-_What%27s_Going_On.png",
  "Songs in the Key of Life": "https://upload.wikimedia.org/wikipedia/en/e/e2/Songs_in_the_key_of_life.jpg",
  "Back to Black": "https://upload.wikimedia.org/wikipedia/en/1/16/Back_to_Black.png",
  "Channel Orange": "https://upload.wikimedia.org/wikipedia/en/2/28/Channel_ORANGE.jpg",
  "Blonde": "https://upload.wikimedia.org/wikipedia/en/a/a0/Blonde_-_Frank_Ocean.jpeg",
  "Random Access Memories": "https://upload.wikimedia.org/wikipedia/en/a/a7/Random_Access_Memories.jpg",
  "To Pimp a Butterfly": "https://upload.wikimedia.org/wikipedia/en/f/f6/Kendrick_Lamar_-_To_Pimp_a_Butterfly.png",
  "After Hours": "https://upload.wikimedia.org/wikipedia/en/c/c1/The_Weeknd_-_After_Hours.png",
  "folklore": "https://upload.wikimedia.org/wikipedia/en/f/f8/Taylor_Swift_-_Folklore.png",
  "SOUR": "https://upload.wikimedia.org/wikipedia/en/b/b2/Olivia_Rodrigo_-_SOUR.png"
};

async function updateCovers() {
  try {
    console.log('🎨 Updating album covers...\n');

    for (const [title, cover_url] of Object.entries(covers)) {
      await pool.query(
        'UPDATE albums SET cover_art_url = $1 WHERE title = $2',
        [cover_url, title]
      );
      console.log(`✓ Updated cover for: ${title}`);
    }

    console.log('\n✅ All covers updated!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

updateCovers();