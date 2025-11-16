
// ============================================
// DATABASE SEED SCRIPT - 30 Popular Albums
// ============================================

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:tvRAxqLIvVbAhRgXYcBkWZamUoBHAPFd@maglev.proxy.rlwy.net:54146/railway',
  ssl: {
    rejectUnauthorized: false
  }
});

const albums = [
  // Rock Classics
  { 
    title: "Abbey Road", 
    artist: "The Beatles", 
    year: "1969-09-26", 
    genre: "Rock",
    cover: "https://upload.wikimedia.org/wikipedia/en/4/42/Beatles_-_Abbey_Road.jpg"
  },
  { 
    title: "The Dark Side of the Moon", 
    artist: "Pink Floyd", 
    year: "1973-03-01", 
    genre: "Progressive Rock",
    cover: "https://upload.wikimedia.org/wikipedia/en/3/3b/Dark_Side_of_the_Moon.png"
  },
  { 
    title: "Led Zeppelin IV", 
    artist: "Led Zeppelin", 
    year: "1971-11-08", 
    genre: "Rock",
    cover: "https://upload.wikimedia.org/wikipedia/en/2/26/Led_Zeppelin_-_Led_Zeppelin_IV.jpg"
  },
  { 
    title: "Rumours", 
    artist: "Fleetwood Mac", 
    year: "1977-02-04", 
    genre: "Rock",
    cover: "https://upload.wikimedia.org/wikipedia/en/f/fb/FMacRumours.PNG"
  },
  { 
    title: "Hotel California", 
    artist: "Eagles", 
    year: "1976-12-08", 
    genre: "Rock",
    cover: "https://upload.wikimedia.org/wikipedia/en/4/49/Hotelcalifornia.jpg"
  },
  
  // Pop Icons
  { 
    title: "Thriller", 
    artist: "Michael Jackson", 
    year: "1982-11-30", 
    genre: "Pop",
    cover: "https://upload.wikimedia.org/wikipedia/en/5/55/Michael_Jackson_-_Thriller.png"
  },
  { 
    title: "Purple Rain", 
    artist: "Prince", 
    year: "1984-06-25", 
    genre: "Pop",
    cover: "https://upload.wikimedia.org/wikipedia/en/9/9c/Purple_Rain_%28album%29.jpg"
  },
  { 
    title: "21", 
    artist: "Adele", 
    year: "2011-01-24", 
    genre: "Pop",
    cover: "https://upload.wikimedia.org/wikipedia/en/1/1b/Adele_-_21.png"
  },
  { 
    title: "1989", 
    artist: "Taylor Swift", 
    year: "2014-10-27", 
    genre: "Pop",
    cover: "https://upload.wikimedia.org/wikipedia/en/f/f6/Taylor_Swift_-_1989.png"
  },
  { 
    title: "Lemonade", 
    artist: "Beyoncé", 
    year: "2016-04-23", 
    genre: "R&B",
    cover: "https://upload.wikimedia.org/wikipedia/en/5/53/Beyonce_-_Lemonade_%28Official_Album_Cover%29.png"
  },
  
  // Hip Hop Essentials
  { 
    title: "The Chronic", 
    artist: "Dr. Dre", 
    year: "1992-12-15", 
    genre: "Hip Hop",
    cover: "https://upload.wikimedia.org/wikipedia/en/c/c4/Dr._Dre_-_The_Chronic.jpg"
  },
  { 
    title: "Illmatic", 
    artist: "Nas", 
    year: "1994-04-19", 
    genre: "Hip Hop",
    cover: "https://upload.wikimedia.org/wikipedia/en/2/27/IllmaticNas.jpg"
  },
  { 
    title: "The Miseducation of Lauryn Hill", 
    artist: "Lauryn Hill", 
    year: "1998-08-25", 
    genre: "Hip Hop",
    cover: "https://upload.wikimedia.org/wikipedia/en/f/ff/Lauryn_Hill_-_The_Miseducation_of_Lauryn_Hill.png"
  },
  { 
    title: "good kid, m.A.A.d city", 
    artist: "Kendrick Lamar", 
    year: "2012-10-22", 
    genre: "Hip Hop",
    cover: "https://upload.wikimedia.org/wikipedia/en/5/51/Kendrick_Lamar_-_Good_Kid%2C_M.A.A.D_City.png"
  },
  { 
    title: "My Beautiful Dark Twisted Fantasy", 
    artist: "Kanye West", 
    year: "2010-11-22", 
    genre: "Hip Hop",
    cover: "https://upload.wikimedia.org/wikipedia/en/5/51/Mbdtf_album_cover.jpg"
  },
  
  // Alternative/Indie
  { 
    title: "OK Computer", 
    artist: "Radiohead", 
    year: "1997-05-21", 
    genre: "Alternative",
    cover: "https://upload.wikimedia.org/wikipedia/en/b/ba/Radioheadokcomputer.png"
  },
  { 
    title: "Nevermind", 
    artist: "Nirvana", 
    year: "1991-09-24", 
    genre: "Grunge",
    cover: "https://upload.wikimedia.org/wikipedia/en/b/b7/NirvanaNevermindalbumcover.jpg"
  },
  { 
    title: "In Rainbows", 
    artist: "Radiohead", 
    year: "2007-10-10", 
    genre: "Alternative",
    cover: "https://upload.wikimedia.org/wikipedia/en/1/14/Inrainbowscover.png"
  },
  { 
    title: "AM", 
    artist: "Arctic Monkeys", 
    year: "2013-09-09", 
    genre: "Indie Rock",
    cover: "https://upload.wikimedia.org/wikipedia/en/0/04/Arctic_Monkeys_-_AM.png"
  },
  { 
    title: "Kid A", 
    artist: "Radiohead", 
    year: "2000-10-02", 
    genre: "Electronic",
    cover: "https://upload.wikimedia.org/wikipedia/en/b/b5/Radiohead.kida.albumart.png"
  },
  
  // R&B/Soul
  { 
    title: "What's Going On", 
    artist: "Marvin Gaye", 
    year: "1971-05-21", 
    genre: "Soul",
    cover: "https://upload.wikimedia.org/wikipedia/en/c/c1/Marvin_Gaye_-_What%27s_Going_On.png"
  },
  { 
    title: "Songs in the Key of Life", 
    artist: "Stevie Wonder", 
    year: "1976-09-28", 
    genre: "Soul",
    cover: "https://upload.wikimedia.org/wikipedia/en/e/e2/Songs_in_the_key_of_life.jpg"
  },
  { 
    title: "Back to Black", 
    artist: "Amy Winehouse", 
    year: "2006-10-27", 
    genre: "Soul",
    cover: "https://upload.wikimedia.org/wikipedia/en/1/16/Back_to_Black.png"
  },
  { 
    title: "Channel Orange", 
    artist: "Frank Ocean", 
    year: "2012-07-10", 
    genre: "R&B",
    cover: "https://upload.wikimedia.org/wikipedia/en/2/28/Channel_ORANGE.jpg"
  },
  { 
    title: "Blonde", 
    artist: "Frank Ocean", 
    year: "2016-08-20", 
    genre: "R&B",
    cover: "https://upload.wikimedia.org/wikipedia/en/a/a0/Blonde_-_Frank_Ocean.jpeg"
  },
  
  // Modern Classics
  { 
    title: "Random Access Memories", 
    artist: "Daft Punk", 
    year: "2013-05-17", 
    genre: "Electronic",
    cover: "https://upload.wikimedia.org/wikipedia/en/a/a7/Random_Access_Memories.jpg"
  },
  { 
    title: "To Pimp a Butterfly", 
    artist: "Kendrick Lamar", 
    year: "2015-03-15", 
    genre: "Hip Hop",
    cover: "https://upload.wikimedia.org/wikipedia/en/f/f6/Kendrick_Lamar_-_To_Pimp_a_Butterfly.png"
  },
  { 
    title: "After Hours", 
    artist: "The Weeknd", 
    year: "2020-03-20", 
    genre: "R&B",
    cover: "https://upload.wikimedia.org/wikipedia/en/c/c1/The_Weeknd_-_After_Hours.png"
  },
  { 
    title: "folklore", 
    artist: "Taylor Swift", 
    year: "2020-07-24", 
    genre: "Alternative",
    cover: "https://upload.wikimedia.org/wikipedia/en/f/f8/Taylor_Swift_-_Folklore.png"
  },
  { 
    title: "SOUR", 
    artist: "Olivia Rodrigo", 
    year: "2021-05-21", 
    genre: "Pop",
    cover: "https://upload.wikimedia.org/wikipedia/en/b/b2/Olivia_Rodrigo_-_SOUR.png"
  },
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seed...\n');

    let albumsCreated = 0;
    let albumsSkipped = 0;

    for (const album of albums) {
      // Check if artist exists
      let artist = await pool.query(
        'SELECT artist_id FROM artists WHERE name = $1',
        [album.artist]
      );

      let artist_id;
      if (artist.rows.length === 0) {
        // Create new artist
        const newArtist = await pool.query(
          'INSERT INTO artists (name) VALUES ($1) RETURNING artist_id',
          [album.artist]
        );
        artist_id = newArtist.rows[0].artist_id;
        console.log(`   ✓ Created artist: ${album.artist}`);
      } else {
        artist_id = artist.rows[0].artist_id;
      }

      // Check if album already exists
      const existingAlbum = await pool.query(
        'SELECT album_id FROM albums WHERE title = $1 AND artist_id = $2',
        [album.title, artist_id]
      );

      if (existingAlbum.rows.length === 0) {
        // Create album
        await pool.query(
            `INSERT INTO albums (title, artist_id, release_date, genre, cover_art_url)
            VALUES ($1, $2, $3, $4, $5)`,
            [album.title, artist_id, album.year, album.genre, album.cover]
        );
        console.log(`   ✓ Created album: ${album.title} - ${album.artist}`);
        albumsCreated++;
      } else {
        console.log(`   ⊘ Skipped (already exists): ${album.title}`);
        albumsSkipped++;
      }
    }

    console.log(`\n✅ Seed complete!`);
    console.log(`   Albums created: ${albumsCreated}`);
    console.log(`   Albums skipped: ${albumsSkipped}`);
    console.log(`   Total albums in database: ${albumsCreated + albumsSkipped}`);
    
    process.exit(0);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seed
seedDatabase();