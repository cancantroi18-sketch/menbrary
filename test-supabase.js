const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
    console.log('Testing Supabase connection...');
    console.log('URL:', supabaseUrl ? 'Set' : 'Not Set');
    console.log('Key:', supabaseKey ? 'Set' : 'Not Set');

    if (!supabaseUrl || !supabaseKey) {
        console.error('❌ Supabase URL or Key is missing!');
        process.exit(1);
    }

    const { data, error } = await supabase.from('shops').select('*').limit(1);

    if (error) {
        console.error('❌ Connection Failed:', error.message);
        process.exit(1);
    }

    console.log('✅ Connection Successful! Found shops:', data);
    process.exit(0);
}

testConnection();
