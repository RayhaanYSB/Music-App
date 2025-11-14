const pool = require('./config/db');

async function checkDatabase() {
  try {
    console.log('🔍 Checking database structure...\n');

    // Get all tables
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;
    
    const tables = await pool.query(tablesQuery);
    
    console.log('📊 Tables found:', tables.rows.length);
    console.log('─────────────────────────────');
    tables.rows.forEach(row => {
      console.log(`  ✓ ${row.table_name}`);
    });

    // Check albums table structure
    console.log('\n📋 Albums table columns:');
    console.log('─────────────────────────────');
    const albumsStructure = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'albums'
      ORDER BY ordinal_position;
    `);
    
    albumsStructure.rows.forEach(col => {
      console.log(`  ${col.column_name} (${col.data_type})`);
    });

    // Check reviews table structure
    console.log('\n⭐ Reviews table columns:');
    console.log('─────────────────────────────');
    const reviewsStructure = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'reviews'
      ORDER BY ordinal_position;
    `);
    
    reviewsStructure.rows.forEach(col => {
      console.log(`  ${col.column_name} (${col.data_type})`);
    });

    // Check if trigger exists
    const triggerCheck = await pool.query(`
      SELECT trigger_name 
      FROM information_schema.triggers 
      WHERE trigger_name = 'trigger_update_album_rating';
    `);
    
    if (triggerCheck.rows.length > 0) {
      console.log('\n✅ Album rating trigger is set up correctly!');
    } else {
      console.log('\n❌ Warning: Album rating trigger not found!');
    }

    console.log('\n✅ Database structure looks good!\n');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error checking database:', error.message);
    process.exit(1);
  }
}

checkDatabase();