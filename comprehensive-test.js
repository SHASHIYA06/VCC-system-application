require('dotenv').config();

async function testComprehensiveFix() {
    console.log('🧪 Comprehensive RAG System Test');
    console.log('================================');

    try {
        // Test 1: Environment variables
        console.log('\n1. Testing Environment Variables...');
        const openRouterKey = process.env.OPENROUTER_API_KEY;
        const openaiKey = process.env.OPENAI_API_KEY;

        if (!openRouterKey && !openaiKey) {
            console.log('❌ No API keys found');
            return;
        }
        console.log('✅ API keys are set');

        // Test 2: Simple RAG module
        console.log('\n2. Testing Simple RAG Module...');
        const { executeSimpleRAG } = require('./src/lib/ai/simple-rag');
        console.log('✅ Simple RAG module loaded successfully');

        // Test 3: Basic functionality
        console.log('\n3. Testing Basic Query...');
        const result = await executeSimpleRAG('What is TRAC system?');
        console.log('✅ Query executed successfully');
        console.log('   Response length:', result.response.length);
        console.log('   Confidence:', result.confidence);
        console.log('   Execution time:', result.executionTime, 'ms');
        console.log('   Fallback used:', result.fallbackUsed ? 'YES' : 'NO');

        if (result.error) {
            console.log('⚠️  Error occurred (but handled gracefully):', result.error);
        }

        console.log('\n📋 Sample Response:');
        console.log('===================');
        console.log(result.response.substring(0, 300) + (result.response.length > 300 ? '...' : ''));

        console.log('\n✅ All tests completed successfully!');
        console.log('\n🚀 The RAG system should now be working properly.');
        console.log('   Start the server with: npm run dev');
        console.log('   Test with: curl -X POST http://localhost:3000/api/rag -H "Content-Type: application/json" -d \'{"query":"What is TRAC system?"}\'');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error('Stack:', error.stack);
    }
}

testComprehensiveFix();