import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Manually parse .env
const envFile = fs.readFileSync('.env', 'utf-8');
const env = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = match[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.substring(1, value.length - 1);
    } else if (value.startsWith("'") && value.endsWith("'")) {
      value = value.substring(1, value.length - 1);
    }
    env[match[1]] = value;
  }
});

const supabaseUrl = env.SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkColumns() {
  const { data: selectData, error: selectError } = await supabase.from('payments').select('*').limit(1);
  if (selectError) {
    console.error("Select failed:", selectError);
  } else {
    console.log("Success! Rows in payments:", selectData);
    if (selectData.length > 0) {
      console.log("Available columns:", Object.keys(selectData[0]));
    } else {
      console.log("Table exists but is empty.");
      // Let's check via information_schema
      const { data: colData, error: colError } = await supabase.rpc('get_table_columns_fallback');
      if (colError) {
        // Let's do a trick: insert a dummy value with wrong columns to see the error message with list of columns,
        // or query using a postgres view if we can, or just print keys.
        // Actually, we can fetch information_schema via a standard query if supabase service role has permissions:
        const { data: infoData, error: infoError } = await supabase
          .from('information_schema.columns')
          .select('column_name')
          .eq('table_name', 'payments');
        console.log("From info schema:", infoData, infoError);
      }
    }
  }
}

checkColumns();
