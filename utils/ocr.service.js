import Tesseract from 'tesseract.js';
import sharp from 'sharp';

/**
 * Process image with OCR using Tesseract.js
 * @param {string} imagePath - Path to the image file
 * @returns {Promise<{text: string, confidence: number}>}
 */
export const processImageWithTesseract = async (imagePath) => {
    try {
        // Preprocess image for better OCR results
        const processedImagePath = await preprocessImage(imagePath);

        // Perform OCR
        const { data } = await Tesseract.recognize(
            processedImagePath,
            'eng',
            {
                logger: info => console.log(info)
            }
        );

        return {
            text: data.text,
            confidence: data.confidence
        };
    } catch (error) {
        console.error('OCR Error:', error);
        throw new Error('Failed to process image with OCR');
    }
};

/**
 * Preprocess image to improve OCR accuracy
 * @param {string} imagePath - Original image path
 * @returns {Promise<string>} - Processed image path
 */
const preprocessImage = async (imagePath) => {
    try {
        const processedPath = imagePath.replace(/(\.[^.]+)$/, '-processed$1');

        await sharp(imagePath)
            .greyscale() // Convert to grayscale
            .normalize() // Normalize contrast
            .sharpen() // Sharpen the image
            .toFile(processedPath);

        return processedPath;
    } catch (error) {
        console.error('Image preprocessing error:', error);
        return imagePath; // Return original if preprocessing fails
    }
};

/**
 * Extract structured data from OCR text
 * @param {string} text - Raw OCR text
 * @returns {Object} - Structured business card data
 */
export const parseBusinessCardData = (text) => {
    const data = {
        name: null,
        company: null,
        position: null,
        email: null,
        phone: [],
        address: null,
        website: null
    };

    const lines = text.split('\n').map(line => line.trim()).filter(line => line);

    // Extract email
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const emails = text.match(emailRegex);
    if (emails && emails.length > 0) {
        data.email = emails[0].toLowerCase();
    }

    // Extract phone numbers
    const phoneRegex = /(\+?\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}/g;
    const phones = text.match(phoneRegex);
    if (phones) {
        data.phone = phones.map(p => p.trim());
    }

    // Extract website
    const websiteRegex = /(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/gi;
    const websites = text.match(websiteRegex);
    if (websites) {
        data.website = websites[0];
    }

    // Extract name (usually first line or second line)
    if (lines.length > 0) {
        // First non-empty line is often the name
        data.name = lines[0];
    }

    // Extract position (often second or third line)
    if (lines.length > 1) {
        const secondLine = lines[1];
        // Check if it's not an email or phone
        if (!emailRegex.test(secondLine) && !phoneRegex.test(secondLine)) {
            data.position = secondLine;
        }
    }

    // Extract company (look for common indicators)
    const companyKeywords = ['Inc', 'LLC', 'Ltd', 'Corp', 'Company', 'Co.', 'Corporation', 'Group'];
    for (const line of lines) {
        if (companyKeywords.some(keyword => line.includes(keyword))) {
            data.company = line;
            break;
        }
    }

    // If company not found, use third line if available
    if (!data.company && lines.length > 2) {
        const thirdLine = lines[2];
        if (!emailRegex.test(thirdLine) && !phoneRegex.test(thirdLine)) {
            data.company = thirdLine;
        }
    }

    // Extract address (usually longer lines with numbers and street keywords)
    const addressKeywords = ['Street', 'St', 'Avenue', 'Ave', 'Road', 'Rd', 'Boulevard', 'Blvd', 'Suite', 'Floor'];
    for (const line of lines) {
        if (addressKeywords.some(keyword => line.includes(keyword)) || /\d+/.test(line)) {
            if (!data.phone.includes(line) && line !== data.website) {
                data.address = line;
                break;
            }
        }
    }

    return data;
};
