
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://zxrqvtpdmtiteltpytum.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4cnF2dHBkbXRpdGVsdHB5dHVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4ODU2MzcsImV4cCI6MjA4MzQ2MTYzN30.1vM7WC7ODyGUOXlqxMM2HY1UfGihHvbJ9L9XqloRP5Y'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testSignup() {
    console.log("Attempting signup with alice_test_script@gmail.com...");
    const { data, error } = await supabase.auth.signUp({
        email: 'alice_test_script@gmail.com',
        password: 'password123',
        options: {
            data: {
                role: 'parent'
            }
        }
    })

    if (error) {
        console.error("Signup Error:", error.message);
        console.error("Full Error:", error);
    } else {
        console.log("Signup Success:", data);
    }
}

testSignup();
