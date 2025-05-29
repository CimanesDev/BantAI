const express = require('express');
const cors = require('cors');
const { VertexAI } = require('@google-cloud/vertexai');

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Vertex AI
const projectId = process.env.VITE_GOOGLE_CLOUD_PROJECT_ID;
const location = process.env.VITE_GOOGLE_CLOUD_LOCATION || 'us-central1';
const model = process.env.VITE_GOOGLE_CLOUD_MODEL || 'gemini-pro';

const vertexAI = new VertexAI({
  project: projectId,
  location: location,
});

const generativeModel = vertexAI.preview.getGenerativeModel({
  model: model,
  generationConfig: {
    maxOutputTokens: 1024,
    temperature: 0.7,
    topP: 0.8,
    topK: 40,
  },
});

const systemPrompt = `You are an AI assistant for the NCAP (No Contact Apprehension Policy) system. Your role is to help users understand and manage their traffic violations. You should:

1. Provide clear explanations about traffic violations and their consequences
2. Guide users through the appeal process
3. Help users understand their payment options
4. Explain the NCAP system and its policies
5. Assist with general inquiries about traffic rules and regulations

Always maintain a professional and helpful tone. If you're unsure about something, acknowledge the limitation and suggest contacting NCAP support directly.`;

app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;

    // Add system prompt
    const chat = generativeModel.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: systemPrompt }]
        },
        {
          role: 'model',
          parts: [{ text: 'I understand my role as the NCAP AI assistant. I will help users with their traffic violation concerns, appeals, and general inquiries about the NCAP system.' }]
        }
      ]
    });

    // Get the last user message
    const lastUserMessage = messages[messages.length - 1].content;

    // Generate response
    const result = await chat.sendMessage(lastUserMessage);
    const response = result.response;
    
    res.json({ content: response.candidates[0].content.parts[0].text });
  } catch (error) {
    console.error('Error generating response:', error);
    res.status(500).json({ error: 'Failed to generate response' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 