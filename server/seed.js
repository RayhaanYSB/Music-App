// ============================================
// DATABASE SEED SCRIPT - 30 Popular Albums
// ============================================

const pool = require('./config/db');

const albums = [
  // Rock Classics
  { title: "Abbey Road", artist: "The Beatles", year: "1969-09-26", genre: "Rock" },
  { title: "The Dark Side of the Moon", artist: "Pink Floyd", year: "1973-03-01", genre: "Progressive Rock" },
  { title: "Led Zeppelin IV", artist: "Led Zeppelin", year: "1971-11-08", genre: "Rock" },
  { title: "Rumours", artist: "Fleetwood Mac", year: "1977-02-04", genre: "Rock" },
  { title: "Hotel California", artist: "Eagles", year: "1976-12-08", genre: "Rock" },
  
  // Pop Icons
  { title: "Thriller", artist: "Michael Jackson", year: "1982-11-30", genre: "Pop" },
  { title: "Purple Rain", artist: "Prince", year: "1984-06-25", genre: "Pop" },
  { title: "21", artist: "Adele", year: "2011-01-24", genre: "Pop" },
  { title: "1989", artist: "Taylor Swift", year: "2014-10-27", genre: "Pop" },
  { title: "Lemonade", artist: "Beyoncé", year: "2016-04-23", genre: "R&B" },
  
  // Hip Hop Essentials
  { title: "The Chronic", artist: "Dr. Dre", year: "1992-12-15", genre: "Hip Hop" },
  { title: "Illmatic", artist: "Nas", year: "1994-04-19", genre: "Hip Hop" },
  { title: "The Miseducation of Lauryn Hill", artist: "Lauryn Hill", year: "1998-08-25", genre: "Hip Hop" },
  { title: "good kid, m.A.A.d city", artist: "Kendrick Lamar", year: "2012-10-22", genre: "Hip Hop" },
  { title: "My Beautiful Dark Twisted Fantasy", artist: "Kanye West", year: "2010-11-22", genre: "Hip Hop" },
  
  // Alternative/Indie
  { title: "OK Computer", artist: "Radiohead", year: "1997-05-21", genre: "Alternative" },
  { title: "Nevermind", artist: "Nirvana", year: "1991-09-24", genre: "Grunge" },
  { title: "In Rainbows", artist: "Radiohead", year: "2007-10-10", genre: "Alternative" },
  { title: "AM", artist: "Arctic Monkeys", year: "2013-09-09", genre: "Indie Rock" },
  { title: "Kid A", artist: "Radiohead", year: "2000-10-02", genre: "Electronic" },
  
  // R&B/Soul
  { title: "What's Going On", artist: "Marvin Gaye", year: "1971-05-21", genre: "Soul" },
  { title: "Songs in the Key of Life", artist: "Stevie Wonder", year: "1976-09-28", genre: "Soul" },
  { title: "Back to Black", artist: "Amy Winehouse", year: "2006-10-27", genre: "Soul" },
  { title: "Channel Orange", artist: "Frank Ocean", year: "2012-07-10", genre: "R&B" },
  { title: "Blonde", artist: "Frank Ocean", year: "2016-08-20", genre: "R&B" },
  
  // Modern Classics
  { title: "Random Access Memories", artist: "Daft Punk", year: "2013-05-17", genre: "Electronic" },
  { title: "To Pimp a Butterfly", artist: "Kendrick Lamar", year: "2015-03-15", genre: "Hip Hop" },
  { title: "After Hours", artist: "The Weeknd", year: "2020-03-20", genre: "R&B" },
  { title: "folklore", artist: "Taylor Swift", year: "2020-07-24", genre: "Alternative" },
  { title: "SOUR", artist: "Olivia Rodrigo", year: "2021-05-21", genre: "Pop" },
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
          `INSERT INTO albums (title, artist_id, release_date, genre)
           VALUES ($1, $2, $3, $4)`,
          [album.title, artist_id, album.year, album.genre]
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