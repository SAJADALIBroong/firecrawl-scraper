import { NextRequest, NextResponse } from 'next/server';

interface Message {
    role: string;
    content: string;
}

interface Choice {
    message: Message;
    finish_reason: string;
    index: number;
}

interface OpenRouterResponse {
    model: string;
    choices: Choice[];
}

export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        const body = await request.json();
        
        // Validate the request body
        if (!body.messages || !Array.isArray(body.messages)) {
            return NextResponse.json({ 
                error: 'Invalid request format', 
                details: 'messages must be an array of message objects' 
            }, { status: 400 });
        }

        // Validate each message in the array
        for (const message of body.messages) {
            if (!message.role || !message.content || typeof message.content !== 'string') {
                return NextResponse.json({ 
                    error: 'Invalid message format', 
                    details: 'Each message must have a role and content string' 
                }, { status: 400 });
            }
        }

        const { model, messages } = body;

        if (!process.env.OPENROUTER_API_KEY) {
            throw new Error('OpenRouter API key is not configured');
        }

        const augmentedMessages = [
            {
                role: 'system',
                content: ''
            },
            ...messages
        ];

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                "HTTP-Referer": process.env.SITE_URL || "",
                "X-Title": process.env.SITE_NAME || "",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: model || "deepseek/deepseek-r1:free",
                messages: augmentedMessages
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('OpenRouter API Error:', {
                status: response.status,
                statusText: response.statusText,
                error: errorText
            });
            return NextResponse.json({ 
                error: `OpenRouter API Error: ${response.status} ${response.statusText}`,
                details: errorText 
            }, { status: response.status });
        }

        const data: OpenRouterResponse = await response.json();
        
        if (!data.choices || !Array.isArray(data.choices)) {
            throw new Error('Invalid response format from OpenRouter API');
        }

        const relevantData = {
            model: data.model,
            messages: data.choices.map((choice) => ({
                role: choice.message.role,
                content: choice.message.content
            })),
        };

        return NextResponse.json(relevantData);
    } catch (error) {
        console.error('Error details:', error);
        return NextResponse.json({ 
            error: 'An unexpected error occurred', 
            details: error instanceof Error ? error.message : String(error) 
        }, { status: 500 });
    }
}