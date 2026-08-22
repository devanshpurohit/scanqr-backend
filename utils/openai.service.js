import OpenAI from 'openai';
import fs from 'fs';

// Lazy initialization of OpenAI client
let openaiClient = null;

const getOpenAIClient = () => {
    if (!openaiClient) {
        if (!process.env.OPENAI_API_KEY) {
            throw new Error('OPENAI_API_KEY is not set in environment variables');
        }
        openaiClient = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });
    }
    return openaiClient;
};

/**
 * Process business card image(s) using OpenAI Vision API
 * @param {string} frontImagePath - Path to the front image
 * @param {string} backImagePath - Path to the back image (optional)
 * @returns {Promise<Object>} Extracted business card data
 */
export const processImageWithOpenAI = async (frontImagePath, backImagePath = null) => {
    try {
        const openai = getOpenAIClient();

        // Prepare content message
        const content = [
            {
                type: "text",
                text: `Extract all information from this business card image(s) and return it as a JSON object.
If a back side is provided, combine information from both sides.
Return a JSON object with the following fields:
{
  "name": "Full name of the person",
  "company": "Company name",
  "position": "Job title/position",
  "email": "Email address",
  "phone": "Phone number (comma separated if multiple)",
  "address": "Physical address",
  "website": "Website URL",
  "extraFields": [
     { "label": "Label of extra info (e.g. Services, Tagline)", "value": "Value" }
  ]
}

Only include fields that are clearly visible. valid JSON only. No markdown formatting.`
            }
        ];

        // Add Front Image
        const frontBuffer = fs.readFileSync(frontImagePath);
        const frontBase64 = frontBuffer.toString('base64');
        const frontMime = frontImagePath.endsWith('.png') ? 'image/png' : 'image/jpeg';

        content.push({
            type: "image_url",
            image_url: {
                url: `data:${frontMime};base64,${frontBase64}`
            }
        });

        // Add Back Image if exists
        if (backImagePath) {
            const backBuffer = fs.readFileSync(backImagePath);
            const backBase64 = backBuffer.toString('base64');
            const backMime = backImagePath.endsWith('.png') ? 'image/png' : 'image/jpeg';

            content.push({
                type: "image_url",
                image_url: {
                    url: `data:${backMime};base64,${backBase64}`
                }
            });
        }

        // Call OpenAI Vision API
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "user",
                    content: content
                }
            ],
            max_tokens: 1000
        });

        // Parse the response
        const responseContent = response.choices[0].message.content;

        // Extract JSON from the response
        const jsonMatch = responseContent.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('Failed to extract JSON from OpenAI response');
        }

        const parsedData = JSON.parse(jsonMatch[0]);

        return {
            success: true,
            data: {
                name: parsedData.name || '',
                company: parsedData.company || '',
                position: parsedData.position || '',
                email: parsedData.email || '',
                phone: parsedData.phone || '',
                address: parsedData.address || '',
                website: parsedData.website || '',
                extraFields: parsedData.extraFields || []
            },
            rawText: responseContent,
            confidence: 95
        };
    } catch (error) {
        console.error('OpenAI Vision API Error:', error);
        throw new Error(`Failed to process image with OpenAI: ${error.message}`);
    }
};

/**
 * Analyze any scanned image (business card, contact card, screenshot,
 * social media post, company card, etc.) using OpenAI Vision and return
 * normalized fields matching the Scan model.
 * @param {string} imagePath - Path to the uploaded image on disk.
 * @returns {Promise<Object>} Normalized scan fields.
 */
export const analyzeImageWithOpenAI = async (imagePath) => {
    try {
        const openai = getOpenAIClient();

        const imageBuffer = fs.readFileSync(imagePath);
        const base64Image = imageBuffer.toString('base64');
        const mimeType = imagePath.endsWith('.png') ? 'image/png' : 'image/jpeg';

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: `Analyze this image. It may be a business card, a personal contact card, a company card, a screenshot of a social media post (LinkedIn, Instagram, or similar), or any other image containing useful contact/business information.

First, decide the "sourceType" — one of: "business_card", "contact_card", "company_card", "linkedin_post", "instagram_post", "social_post", "screenshot", "image", "other".

Then extract every field that is clearly visible or reasonably inferable, and return STRICT JSON only (no markdown, no commentary) in exactly this shape:
{
  "sourceType": "",
  "name": "",
  "email": "",
  "phone": "",
  "company": "",
  "designation": "",
  "website": "",
  "address": "",
  "socialLinks": [],
  "sourceUrl": "",
  "rawText": ""
}

Rules:
- Only fill in fields that are actually present in the image; leave others as "" or [].
- "socialLinks" should contain any social media profile/post URLs or handles visible (e.g. linkedin.com/in/..., @handle on Instagram).
- "sourceUrl" is the URL of the post/page itself, if visible (e.g. a shared link, a post permalink).
- "rawText" should contain a transcript of all readable text in the image.
- Respond with valid JSON only.`
                        },
                        {
                            type: "image_url",
                            image_url: {
                                url: `data:${mimeType};base64,${base64Image}`
                            }
                        }
                    ]
                }
            ],
            max_tokens: 1000
        });

        const responseContent = response.choices[0].message.content;
        const jsonMatch = responseContent.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('Failed to extract JSON from OpenAI response');
        }

        const parsed = JSON.parse(jsonMatch[0]);

        return {
            sourceType: parsed.sourceType || 'other',
            name: parsed.name || '',
            email: parsed.email || '',
            phone: parsed.phone || '',
            company: parsed.company || '',
            designation: parsed.designation || '',
            website: parsed.website || '',
            address: parsed.address || '',
            socialLinks: Array.isArray(parsed.socialLinks) ? parsed.socialLinks.filter(Boolean) : [],
            sourceUrl: parsed.sourceUrl || '',
            rawText: parsed.rawText || responseContent
        };
    } catch (error) {
        console.error('OpenAI Vision API Error:', error);
        throw new Error(`Failed to analyze image with OpenAI: ${error.message}`);
    }
};
