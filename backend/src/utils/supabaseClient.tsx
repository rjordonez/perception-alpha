require('dotenv').config({path: '../.env' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase URL or Key. Check your .env file.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log("It worked");


