export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // AI API
    if (url.pathname === "/api/chat" && request.method === "POST") {
      try {
        const body = await request.json();
        const message = body.message;

        if (!message || typeof message !== "string") {
          return Response.json(
            { error: "Message is required." },
            { status: 400 }
          );
        }

        const response = await fetch(
          "https://api.openai.com/v1/responses",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
              model: "gpt-5.6-luna",
              input: `You are an AI Business Employee.

Help the user with:
- Product listings
- Amazon selling
- Marketing
- Business ideas
- Social media content
- Business strategy

Give practical, simple and useful answers.

User request:
${message}`
            })
          }
        );

        const data = await response.json();

        if (!response.ok) {
          return Response.json(
            {
              error:
                data?.error?.message ||
                "OpenAI request failed."
            },
            { status: response.status }
          );
        }

        const answer =
          data.output
            ?.flatMap(item => item.content || [])
            ?.filter(part => part.type === "output_text")
            ?.map(part => part.text)
            ?.join("\n") ||
          "No response generated.";

        return Response.json({ answer });

      } catch (error) {
        return Response.json(
          { error: "Server error. Please try again." },
          { status: 500 }
        );
      }
    }

    // Website files
    return env.ASSETS.fetch(request);
  }
};
