import { prisma } from '@/lib/prisma';
import { callLLM } from '@/lib/llm';

/**
 * Simple RAG System with Proper Error Handling and Fallbacks
 * This replaces the complex multi-agent system with a streamlined approach
 */

export interface SimpleRAGResponse {
    query: string;
    response: string;
    confidence: number;
    sources: string[];
    executionTime: number;
    fallbackUsed?: boolean;
    error?: string;
}

/**
 * Execute a simple RAG query with proper fallback handling
 */
export async function executeSimpleRAG(query: string): Promise<SimpleRAGResponse> {
    const startTime = Date.now();

    try {
        console.log(`🔍 Simple RAG Query: "${query}"`);

        // Step 1: Search relevant data from database
        const searchData = await searchRelevantData(query);

        // Step 2: Format context for LLM
        const context = formatContext(searchData);

        // Step 3: Try to get AI response with low token count to stay within limits
        const aiResponse = await getAIResponse(query, context);

        if (aiResponse.error) {
            // Step 4: Fallback to template-based response if AI fails
            console.log('⚠️  AI failed, using fallback response');
            const fallbackResponse = generateFallbackResponse(query, searchData);

            return {
                query,
                response: fallbackResponse,
                confidence: 0.3, // Lower confidence for fallback
                sources: searchData.sources,
                executionTime: Date.now() - startTime,
                fallbackUsed: true,
                error: aiResponse.error
            };
        }

        return {
            query,
            response: aiResponse.content,
            confidence: aiResponse.confidence,
            sources: searchData.sources,
            executionTime: Date.now() - startTime,
            fallbackUsed: false
        };

    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        console.error('❌ Simple RAG Error:', errorMsg);

        // Ultimate fallback - basic response
        return {
            query,
            response: `I'm sorry, but I encountered an error while processing your query: "${query}". Error: ${errorMsg}`,
            confidence: 0,
            sources: [],
            executionTime: Date.now() - startTime,
            fallbackUsed: true,
            error: errorMsg
        };
    }
}

/**
 * Search relevant data from database based on query
 */
async function searchRelevantData(query: string) {
    try {
        // Search multiple entity types
        const [systems, drawings, wires, devices, connectors] = await Promise.all([
            prisma.system.findMany({
                where: {
                    OR: [
                        { code: { contains: query, mode: 'insensitive' } },
                        { name: { contains: query, mode: 'insensitive' } },
                        { description: { contains: query, mode: 'insensitive' } },
                    ],
                },
                take: 3,
            }),
            prisma.drawing.findMany({
                where: {
                    OR: [
                        { drawingNo: { contains: query, mode: 'insensitive' } },
                        { title: { contains: query, mode: 'insensitive' } },
                    ],
                },
                include: { system: true },
                take: 3,
            }),
            prisma.wire.findMany({
                where: {
                    OR: [
                        { wireNo: { contains: query, mode: 'insensitive' } },
                        { signalName: { contains: query, mode: 'insensitive' } },
                    ],
                },
                take: 3,
            }),
            prisma.device.findMany({
                where: {
                    OR: [
                        { tagNo: { contains: query, mode: 'insensitive' } },
                        { deviceName: { contains: query, mode: 'insensitive' } },
                    ],
                },
                include: { system: true },
                take: 3,
            }),
            prisma.connector.findMany({
                where: {
                    connectorCode: { contains: query, mode: 'insensitive' },
                },
                include: { drawing: true },
                take: 3,
            }),
        ]);

        return {
            systems,
            drawings,
            wires,
            devices,
            connectors,
            sources: [
                ...systems.map(s => `system:${s.code}`),
                ...drawings.map(d => `drawing:${d.drawingNo}`),
                ...wires.map(w => `wire:${w.wireNo}`),
                ...devices.map(d => `device:${d.tagNo || d.deviceName}`),
                ...connectors.map(c => `connector:${c.connectorCode}`),
            ]
        };
    } catch (error) {
        console.warn('⚠️  Database search failed:', error);
        return {
            systems: [],
            drawings: [],
            wires: [],
            devices: [],
            connectors: [],
            sources: []
        };
    }
}

/**
 * Format search data into context for LLM
 */
function formatContext(data: any) {
    const sections = [];

    if (data.systems.length > 0) {
        sections.push(`Systems:\n${data.systems.map((s: any) =>
            `- ${s.code}: ${s.name} (${s.description || 'No description'})`
        ).join('\n')}`);
    }

    if (data.drawings.length > 0) {
        sections.push(`Drawings:\n${data.drawings.map((d: any) =>
            `- ${d.drawingNo}: ${d.title} (System: ${d.system?.code || 'N/A'})`
        ).join('\n')}`);
    }

    if (data.wires.length > 0) {
        sections.push(`Wires:\n${data.wires.map((w: any) =>
            `- ${w.wireNo}: ${w.signalName || 'No signal name'}`
        ).join('\n')}`);
    }

    if (data.devices.length > 0) {
        sections.push(`Devices:\n${data.devices.map((d: any) =>
            `- ${d.tagNo || d.deviceName}: ${d.deviceName} (System: ${d.system?.code || 'N/A'})`
        ).join('\n')}`);
    }

    if (data.connectors.length > 0) {
        sections.push(`Connectors:\n${data.connectors.map((c: any) =>
            `- ${c.connectorCode}: Drawing ${c.drawing?.drawingNo || 'N/A'}`
        ).join('\n')}`);
    }

    return sections.join('\n\n') || 'No relevant data found.';
}

/**
 * Get AI response with proper error handling
 */
async function getAIResponse(query: string, context: string) {
    try {
        // Use very conservative token limits to stay within free tier
        const response = await callLLM(
            `Based on the following VCC system data, answer this question: "${query}"

Context data:
${context}

Instructions:
- Provide a concise, accurate answer
- Focus on the most relevant information
- If the data doesn't contain relevant information, say so
- Keep response under 100 words`,
            {
                provider: 'openrouter',
                model: 'openai/gpt-4-turbo',
                system: 'You are a VCC (Vehicle Control Circuit) system expert for KMRCL RS3R Metro trains.',
                temperature: 0.3,
                maxTokens: 50 // Very conservative to stay within limits
            }
        );

        if (response.error) {
            return { error: response.error, content: '', confidence: 0 };
        }

        return {
            content: response.content || 'No response generated.',
            confidence: 0.9,
            error: undefined
        };
    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown AI error';
        return { error: errorMsg, content: '', confidence: 0 };
    }
}

/**
 * Generate fallback response when AI fails
 */
function generateFallbackResponse(query: string, data: any) {
    const totalResults =
        data.systems.length +
        data.drawings.length +
        data.wires.length +
        data.devices.length +
        data.connectors.length;

    if (totalResults === 0) {
        return `I couldn't find any data matching your query: "${query}". Please try a different search term or check if the data exists in the system.`;
    }

    let response = `Based on the available data, I found ${totalResults} items related to your query: "${query}".\n\n`;

    if (data.systems.length > 0) {
        response += `Systems (${data.systems.length}):\n`;
        data.systems.slice(0, 2).forEach((s: any) => {
            response += `• ${s.code}: ${s.name}\n`;
        });
        if (data.systems.length > 2) response += `• ... and ${data.systems.length - 2} more\n`;
        response += '\n';
    }

    if (data.drawings.length > 0) {
        response += `Drawings (${data.drawings.length}):\n`;
        data.drawings.slice(0, 2).forEach((d: any) => {
            response += `• ${d.drawingNo}: ${d.title}\n`;
        });
        if (data.drawings.length > 2) response += `• ... and ${data.drawings.length - 2} more\n`;
        response += '\n';
    }

    if (data.wires.length > 0) {
        response += `Wires (${data.wires.length}):\n`;
        data.wires.slice(0, 2).forEach((w: any) => {
            response += `• ${w.wireNo}: ${w.signalName || 'No signal name'}\n`;
        });
        if (data.wires.length > 2) response += `• ... and ${data.wires.length - 2} more\n`;
        response += '\n';
    }

    response += 'Note: This is a simplified response due to AI service limitations. For detailed analysis, please check the specific data items above.';

    return response;
}