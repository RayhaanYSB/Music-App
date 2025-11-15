const pool = require('./config/db');

const fixedCovers = {
  "The Chronic": "https://ia803108.us.archive.org/view_archive.php?archive=/17/items/mbid-c2de5d11-e5dc-431f-86ea-2a07c00a0a04/mbid-c2de5d11-e5dc-431f-86ea-2a07c00a0a04-29958038876_thumb500.jpg",
  "The Dark Side of the Moon": "https://ia601409.us.archive.org/view_archive.php?archive=/15/items/mbid-60d4281a-ec00-4364-8e4c-1edc9e5b0ac4/mbid-60d4281a-ec00-4364-8e4c-1edc9e5b0ac4-32039518952_thumb500.jpg",
  "The Miseducation of Lauryn Hill": "https://coverartarchive.org/release/7fa6fc6e-8df5-4e9e-9a5b-2557e8f85a30/29958038876-500.jpg",
  "What's Going On": "https://coverartarchive.org/release/8346e16c-c0bc-4831-8e1b-8a8c5e2be6e1/32311775555-500.jpg",
  "AM": "https://coverartarchive.org/release/d7fb8b1c-bd69-469d-a440-4d7e72e1b4f8/23319455494-500.jpg",
  "My Beautiful Dark Twisted Fantasy": "https://coverartarchive.org/release/353b8e93-49c7-45c6-85d0-83ed6c90c678/19024842853-500.jpg",
  "Purple Rain": "https://coverartarchive.org/release/c0b7f5d3-0e44-4284-bfb6-869c1a619c58/32310624638-500.jpg",
  "Random Access Memories": "https://coverartarchive.org/release/b6ed76dd-a428-4e4c-925f-6a9f70a1f607/18651614424-500.jpg",
};

async function fixCovers() {
  try {
    console.log('🔧 Fixing broken covers...\n');

    for (const [title, cover_url] of Object.entries(fixedCovers)) {
      await pool.query(
        'UPDATE albums SET cover_art_url = $1 WHERE title = $2',
        [cover_url, title]
      );
      console.log(`✓ Fixed cover for: ${title}`);
    }

    console.log('\n✅ Done!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixCovers();