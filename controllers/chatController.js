import { AzureOpenAI } from "openai";

const client = new AzureOpenAI({
  endpoint: process.env.AZURE_OPENAI_ENDPOINT,
  apiKey: process.env.AZURE_OPENAI_API_KEY,
  apiVersion: "2024-05-01-preview",
  deployment: "gpt-35-turbo",
});

export const handleChat = async (req, res) => {
  const { messages } = req.body;

  const initialGreeting = "Vannakkam! How can I assist you today?";

  try {
    const result = await client.chat.completions.create({
      messages: [
        ...messages,
        { role: "system", content: initialGreeting }, // Include greeting
      ],
      max_tokens: 3000,
      temperature: 0.7,
      top_p: 0.48,
      frequency_penalty: 0,
      presence_penalty: 0,
      stop: null,
    });

    //     // Ensure the response format is correct
    //     if (result && result.choices && result.choices.length > 0) {
    //       //   res.json(result.choices[0].message.content);
    //       res.json({ content: result.choices[0].message.content });
    //     } else {
    //       res.status(500).json({ error: "No valid response from API" });
    //     }
    //   } catch (error) {
    //     console.error("Error processing request:", error);
    //     res.status(500).json({ error: "Error processing the request" });
    //   }

    // Ensure the response format is correct
    if (result && result.choices && result.choices.length > 0) {
      let content = result.choices[0].message.content;

      // Modify response to include South Indian slang
      if (content.includes("How can I help you?")) {
        content = content.replace(
          "How can I help you?",
          "What do you need, kanna?"
        );
      }

      // Send back the modified content in a JSON object
      res.json({ content });
    } else {
      res.status(500).json({ error: "No valid response from API" });
    }
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).json({ error: "Error processing the request" });
  }
};

// module.exports = chatController;
