import { createClient } from '@supabase/supabase-js';

// This line tells Vercel to use the Edge Runtime, which handles formData natively
export const config = {
  runtime: 'edge',
};

// These variables are pulled from your Vercel Environment Variables
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file');
    const prompt = formData.get('prompt');
    const date = formData.get('date');
    const notes = formData.get('notes');

    if (!file) {
      return new Response(JSON.stringify({ error: 'No file provided.' }), { status: 400 });
    }

    // Create a unique filename
    const fileName = `${Date.now()}-${file.name}`;
    const fileBuffer = await file.arrayBuffer();

    // 1. Upload the image to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('sketches') // Ensure your bucket is named 'sketches'
      .upload(fileName, fileBuffer, { 
          contentType: file.type,
          upsert: false 
      });

    if (uploadError) throw uploadError;

    // 2. Generate the Public URL for the image
    const { data: urlData } = supabase.storage
      .from('sketches')
      .getPublicUrl(fileName);

    // 3. Insert metadata into your Supabase Database table
    const { error: dbError } = await supabase
      .from('sketches') // Ensure your table is named 'sketches'
      .insert({
        prompt: prompt,
        date: date,
        notes: notes,
        image_url: urlData.publicUrl,
      });

    if (dbError) throw dbError;

    // Success response
    return new Response(JSON.stringify({ success: true }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    // This catches errors and sends them back as JSON instead of plain text
    return new Response(JSON.stringify({ error: err.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}