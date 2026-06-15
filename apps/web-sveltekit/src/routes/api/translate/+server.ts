import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const data = await request.json().catch(() => null);
    if (!data || typeof data.html !== 'string' || typeof data.targetLanguage !== 'string') {
      return json({ error: 'Missing html or targetLanguage parameter' }, { status: 400 });
    }

    const { html, targetLanguage } = data;

    if (html.trim().length === 0) {
      return json({ error: 'HTML content cannot be empty' }, { status: 400 });
    }

    const apiKey = env.GEMINI_API_KEY;
    if (!apiKey) {
      return json({ error: 'Gemini API key is not configured on the server' }, { status: 500 });
    }

    const systemInstruction = `You are a professional, highly precise translation assistant.
Your task is to translate the provided HTML content of a blog post into the target language: ${targetLanguage}.

Follow these strict rules to ensure structure and formatting are preserved perfectly:
1. Translate all visible text (e.g. headings, paragraphs, list items, blockquotes, table cells, spans, etc.) into the requested target language: ${targetLanguage}.
2. DO NOT change, delete, or translate any HTML tags, class names, IDs, inline styles, layout rules, event handlers, href paths, src paths, alt attributes (unless they are descriptive image alt text), or HTML structures.
3. Preserve all spacing, layout, structure, and CSS classes exactly as they are in the input.
4. Do NOT wrap your output in markdown code blocks like \`\`\`html. Output ONLY the raw translated HTML content.
5. If there are code blocks (i.e. <pre> or <code> tags), translate the comments/strings inside the code block if appropriate, but do NOT translate programming syntax, function names, keywords, or variables.
6. Return only the translated HTML. Ensure it is valid HTML and contains all original tags.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Translate the following HTML into ${targetLanguage}:\n\n${html}`
          }]
        }],
        systemInstruction: {
          parts: [{
            text: systemInstruction
          }]
        },
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 8192
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API request failed:', errorText);
      return json({ error: 'Failed to translate content via Gemini API' }, { status: 502 });
    }

    const responseData = await response.json();
    let translatedText = responseData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!translatedText) {
      return json({ error: 'No translation returned from Gemini API' }, { status: 502 });
    }

    translatedText = translatedText.trim();
    if (translatedText.startsWith('```html')) {
      translatedText = translatedText.substring(7);
    } else if (translatedText.startsWith('```')) {
      translatedText = translatedText.substring(3);
    }
    if (translatedText.endsWith('```')) {
      translatedText = translatedText.substring(0, translatedText.length - 3);
    }
    translatedText = translatedText.trim();

    return json({ translatedHtml: translatedText });
  } catch (error: any) {
    console.error('Translation route error:', error);
    return json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
};
