const fs = require('fs');

// Simple test to verify RAG API is working
async function testRAG() {
    try {
        console.log('Testing RAG API...');

        // Check if environment variables are set
        const openRouterKey = process.env.OPENROUTER_API_KEY;
        const openaiKey = process.env.OPENAI_API_KEY;

        console.log('Environment variables:');
        console.log('- OPENROUTER_API_KEY:', openRouterKey ? 'SET' : 'NOT SET');
        console.log('- OPENAI_API_KEY:', openaiKey ? 'SET' : 'NOT SET');

        if (!openRouterKey && !openaiKey) {
            console.log('❌ No API keys found. Please set OPENROUTER_API_KEY or OPENAI_API_KEY in .env.local');
            return;
        }

        // Test basic functionality
        console.log('✅ Environment setup looks good');
        console.log('Next steps:');
        console.log('1. Start the development server: npm run dev');
        console.log('2. Test the API: curl -X POST http://localhost:3000/api/rag -H "Content-Type: application/json" -d \'{"query":"What is TRAC system?"}\'');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testRAG();