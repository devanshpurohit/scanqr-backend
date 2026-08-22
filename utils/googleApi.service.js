import { google } from 'googleapis';

/**
 * Get Google OAuth2 client
 * @param {string} accessToken - User's Google access token
 * @param {string} refreshToken - User's Google refresh token
 * @returns {OAuth2Client}
 */
export const getOAuth2Client = (accessToken, refreshToken) => {
    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials({
        access_token: accessToken,
        refresh_token: refreshToken
    });

    return oauth2Client;
};

/**
 * Sync business card to Google Contacts
 * @param {Object} cardData - Business card data
 * @param {string} accessToken - User's Google access token
 * @param {string} refreshToken - User's Google refresh token
 * @returns {Promise<string>} - Google Contact ID
 */
export const syncToGoogleContacts = async (cardData, accessToken, refreshToken) => {
    try {
        const auth = getOAuth2Client(accessToken, refreshToken);
        const people = google.people({ version: 'v1', auth });

        // Prepare contact data
        const contactResource = {
            names: cardData.name ? [{
                givenName: cardData.name.split(' ')[0],
                familyName: cardData.name.split(' ').slice(1).join(' ') || ''
            }] : [],
            emailAddresses: cardData.email ? [{
                value: cardData.email,
                type: 'work'
            }] : [],
            phoneNumbers: cardData.phone && cardData.phone.length > 0
                ? cardData.phone.map(phone => ({
                    value: phone,
                    type: 'work'
                }))
                : [],
            organizations: cardData.company || cardData.position ? [{
                name: cardData.company || '',
                title: cardData.position || ''
            }] : [],
            addresses: cardData.address ? [{
                formattedValue: cardData.address,
                type: 'work'
            }] : [],
            urls: cardData.website ? [{
                value: cardData.website,
                type: 'work'
            }] : []
        };

        // Check if contact already exists (update) or create new
        if (cardData.googleContactId) {
            // Update existing contact
            const response = await people.people.updateContact({
                resourceName: cardData.googleContactId,
                updatePersonFields: 'names,emailAddresses,phoneNumbers,organizations,addresses,urls',
                requestBody: contactResource
            });
            return response.data.resourceName;
        } else {
            // Create new contact
            const response = await people.people.createContact({
                requestBody: contactResource
            });
            return response.data.resourceName;
        }
    } catch (error) {
        console.error('Google Contacts sync error:', error);
        throw new Error('Failed to sync with Google Contacts');
    }
};

/**
 * Delete contact from Google Contacts
 * @param {string} googleContactId - Google Contact resource name
 * @param {string} accessToken - User's Google access token
 * @param {string} refreshToken - User's Google refresh token
 */
export const deleteFromGoogleContacts = async (googleContactId, accessToken, refreshToken) => {
    try {
        const auth = getOAuth2Client(accessToken, refreshToken);
        const people = google.people({ version: 'v1', auth });

        await people.people.deleteContact({
            resourceName: googleContactId
        });
    } catch (error) {
        console.error('Google Contacts delete error:', error);
        throw new Error('Failed to delete from Google Contacts');
    }
};
