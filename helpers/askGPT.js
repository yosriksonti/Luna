const OpenAI = require("openai");
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  organization: "org-4pZyMecDsAioe5GBBpOeSskR"
});
let messages = [];
async function askGPT(prompt, systemContent, reset) {
  if (reset) messages = [];
  const newMessage = { role: "user", content: prompt }
  messages.push(newMessage);
  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    max_tokens: 256,
    messages: [
      { role: "system", content: systemContent }, ...messages
    ]
  });
  const newAssistantMessage = { role: "assistant", content: completion.choices[0].message.content }
  messages.push(newAssistantMessage);
  return completion.choices[0].message.content
  /* const completion = await openai.createCompletion({
     model: "text-davinci-003",
     temperature: 0.2,
     max_tokens: 50,
     prompt,
     // Or any number that suits your needs
   })
   return completion.data.choices[0].text*/
}


module.exports = askGPT
