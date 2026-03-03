// Supabase Configuration
// Replace these values with your Supabase project credentials

const SUPABASE_URL = 'https://rzkjfgwgkdphizaplhlv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ6a2pmZ3dna2RwaGl6YXBsaGx2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0OTA0ODksImV4cCI6MjA4ODA2NjQ4OX0.o2zjbx6noCnCn6VB5CcVaidJnouFwnmdFFjrHpELBkg';

// Initialize Supabase client using global library from CDN
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const supabase = supabaseClient;

// Export for use in other files
window.supabaseClient = supabaseClient;

// Test connection
async function testSupabaseConnection() {
    try {
        const { data, error } = await supabase.auth.getSession();
        if (error) console.error('Supabase Error:', error);
        else console.log('Supabase connected successfully');
    } catch (error) {
        console.error('Connection failed:', error);
    }
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', testSupabaseConnection);
