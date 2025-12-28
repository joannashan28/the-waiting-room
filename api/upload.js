import { createClient } from '@supabase/supabase-js';

export const config = {
  runtime: 'edge',
};

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req) {
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

    const fileName = `${Date.now()}-${file.name}`;
    const fileBuffer = await file.arrayBuffer();

    // 1. Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('sketches')
      .upload(fileName, fileBuffer, { contentType: file.type });

    if (uploadError) throw uploadError;

    // 2. Get the URL
    const { data: urlData } = supabase.storage.from('sketches').getPublicUrl(fileName);

    // 3. Insert into Database
    const { error: dbError } = await supabase
      .from('sketches')
      .insert({
        prompt,
        date,
        notes,
        image_url: urlData.publicUrl,
      });

    if (dbError) throw dbError;

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}