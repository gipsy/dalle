import express from 'express';
import OpenAI from 'openai';

const router = express.Router();

let openaiClient;
function getOpenAIClient() {
  if (openaiClient) return openaiClient;
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      'OPENAI_API_KEY is not set. Add it to server/.env (copy server/.env.example).',
    );
  }
  openaiClient = new OpenAI({ apiKey });
  return openaiClient;
}

router.route('/').get((req, res) => {
  res.status(200).json({ message: 'Hello from DALL-E' });
});

router.route('/').post(async (req, res) => {
  try {
    const { prompt } = req.body;;

    const aiResponse = await getOpenAIClient().images.generate({
      model: process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1.5',
      prompt,
      n: 1,
      size: '1024x1024',
      response_format: 'b64_json',
    });

    const image = aiResponse.data?.[0]?.b64_json;

    if (!image) {
      res.status(500).json({ success: false, message: 'No image data returned from OpenAI' });
      return;
    }

    res.status(200).json({ photo: image });
  } catch (error) {
    console.error(error);
    const message = error?.message ?? error?.response?.data?.error?.message ?? 'Image generation failed';
    res.status(500).json({ success: false, message });
  }
})

export default router;
