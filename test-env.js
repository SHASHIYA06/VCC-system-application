require('dotenv').config();

// Test environment variables
console.log('Environment Variables Test:');
console.log('==========================');

const vars = [
    'OPENROUTER_API_KEY',
    'OPENAI_API_KEY',
    'DATABASE_URL',
    'NEXT_PUBLIC_SUPABASE_URL'
];

vars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
        console.log(`✅ ${varName}: SET (${value.substring(0, 20)}...)`);
    } else {
        console.log(`❌ ${varName}: NOT SET`);
    }
});

console.log('\nAPI Keys Available:');
console.log('- OPENROUTER_API_KEY:', process.env.OPENROUTER_API_KEY ? 'YES' : 'NO');
console.log('- OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? 'YES' : 'NO');