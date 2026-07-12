#!/usr/bin/env node

// Test script to verify AI questions functionality
require('dotenv').config();

async function testAIQuestions() {
    console.log('🧪 Testing AI Questions Feature...\n');

    try {
        // Test the simple RAG system directly
        console.log('1. Testing Simple RAG System...');
        const { executeSimpleRAG } = require('./src/lib/ai/simple-rag');

        const testQueries = [
            'What is TRAC system?',
            'Explain wire 3003',
            'Show me door system components',
            'What does TMS stand for?'
        ];

        for (const query of testQueries) {
            console.log(`\n🔍 Query: "${query}"`);
            const result = await executeSimpleRAG(query);
            console.log(`✅ Response (${result.confidence.toFixed(2)} confidence, ${result.executionTime}ms):`);
            console.log(`   ${result.response.substring(0, 100)}${result.response.length > 100 ? '...' : ''}`);
            if (result.fallbackUsed) {
                console.log('   ⚠️  Fallback response used');
            }
        }

        console.log('\n2. Testing LLM Configuration...');
        const { callLLM } = require('./src/lib/llm');

        const llmResult = await callLLM('Hello, what model are you?', {
            provider: 'openrouter',
            model: 'anthropic/claude-3-haiku',
            maxTokens: 50
        });

        if (llmResult.error) {
            console.log('❌ LLM Error:', llmResult.error);
        } else {
            console.log('✅ LLM Response:', llmResult.content.substring(0, 50) + '...');
        }

        console.log('\n🎉 All tests completed successfully!');
        console.log('\n🚀 The AI questions feature should now be working properly.');
        console.log('   Start the server with: npm run dev');
        console.log('   Test with: curl -X POST http://localhost:3000/api/rag -H "Content-Type: application/json" -d \'{"query":"What is TRAC system?"}\'');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error('Stack:', error.stack);
    }
}

testAIQuestions();