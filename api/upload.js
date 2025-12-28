import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
// These are Environment Variables that you will set on your hosting platform (Vercel)
// They are NOT hardcoded for security reasons.
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(request, response) {
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        // Vercel's helper to parse multipart/form-data
        const formData = await request.formData();
        
        const file = formData.get('file');
        const prompt = formData.get('prompt');
        const date = formData.get('date');
        const notes = formData.get('notes');

        if (!file) {
            return response.status(400).json({ error: 'No file provided.' });
        }
        
        // Use a unique name for the file to prevent overwrites
        const fileName = `${Date.now()}-${file.name}`;
        const fileBuffer = Buffer.from(await file.arrayBuffer());

        // 1. Upload the image file to Supabase Storage
        const { error: uploadError } = await supabase.storage
            .from('sketches') // The bucket name we created
            .upload(fileName, fileBuffer, {
                contentType: file.type,
                upsert: false,
            });

        if (uploadError) {
            throw uploadError;
        }

        // 2. Get the public URL of the file we just uploaded
        const { data: urlData } = supabase.storage
            .from('sketches')
            .getPublicUrl(fileName);

        if (!urlData.publicUrl) {
            throw new Error('Could not get public URL for the uploaded file.');
        }

        // 3. Insert the metadata (including the image URL) into the database
        const { error: dbError } = await supabase
            .from('sketches') // The table name we created
            .insert({
                prompt: prompt,
                date: date,
                notes: notes,
                image_url: urlData.publicUrl, // Save the URL, not the image data
            });

        if (dbError) {
            throw dbError;
        }

        // 4. Send a success response back to the front-end
        return response.status(200).json({ success: true });

    } catch (error) {
        console.error('Error in upload handler:', error);
        return response.status(500).json({ error: error.message });
    }
}