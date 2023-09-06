const axios = require('axios');

const apiKey = 'YOUR_API_KEY';
const endpoint = 'https://api.openai.com/v1/engines/davinci-codex/completions'; // Adjust the engine and endpoint as needed

const sendMessage = async (message) => {
    try {
        const response = await axios.post(
        endpoint,
        {
            prompt: message,
            max_tokens: 50, // Adjust as needed
        },
        {
            headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            },
        }
        );

        const botResponse = response.data.choices[0].text;
        console.log('Bot: ' + botResponse);
        return botResponse;
  } catch (error) {
        console.error('Error:', error);
        return 'An error occurred.';
  }
}

module.exports = sendMessage;