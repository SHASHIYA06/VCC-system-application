require('dotenv').config();
const { callLLM } = require('./src/lib/llm');

async function testSimpleRAG() {
    console.log('Testing Simple RAG Functionality...');
    console.log('====================================');

    try {
        // Test basic LLM call with OpenRouter
        console.log('Testing OpenRouter API call...');

        const response = await callLLM(
            'What is the TRAC system in VCC trains?',
            {
                provider: 'openrouter',
                model: 'openai/gpt-4-turbo',
                system: 'You are a VCC train system expert.',
                temperature: 0.7,
                maxTokens: 100
            }
        );

        console.log('Response:', response);

        if (response.error) {
            console.log('❌ Error:', response.error);
            return;
        }

        console.log('✅ Success! LLM is working');
        console.log('Content:', response.content.substring(0, 200) + '...');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error('Stack:', error.stack);
    }
}

testSimpleRAG();