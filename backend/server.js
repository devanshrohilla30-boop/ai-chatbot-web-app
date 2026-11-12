
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const OpenAI = require("openai");

dotenv.config();

const app = express();

app.use(cors({
    origin: [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:5176"
    ],
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"]
}));

app.use(express.json({ limit: "1mb" }));

const PORT = process.env.PORT || 5000;

let client;

if (!process.env.OPENAI_API_KEY) {
    console.error("ERROR: OPENAI_API_KEY is missing in backend/.env");
} else {
    client = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
    });
}

app.get("/", (req, res) => {
    res.status(200).send("AI Chatbot Backend is running!");
});

app.get("/api/health", (req, res) => {
    res.status(200).json({
        status: "OK",
        message: "Backend is running",
        aiConfigured: Boolean(client)
    });
});

app.post("/api/chat", async (req, res) => {
    try {
        if (!client) {
            return res.status(503).json({
                error: "OpenAI API key is not configured. Check backend/.env."
            });
        }

        const { message } = req.body;

        if (
            typeof message !== "string" ||
            message.trim().length === 0
        ) {
            return res.status(400).json({
                error: "Please enter a valid message."
            });
        }

        if (message.length > 10000) {
            return res.status(400).json({
                error: "Message is too long. Maximum 10000 characters."
            });
        }

        console.log("User message received:", message);

        const response = await client.responses.create({
            model: "gpt-4.1-mini",
            instructions:
                "You are a helpful, friendly AI assistant. Answer clearly and accurately. Use simple language when explaining technical concepts.",
            input: message.trim()
        });

        const reply = response.output_text;

        if (!reply) {
            throw new Error("The AI returned an empty response.");
        }

        console.log("AI response generated successfully.");

        return res.status(200).json({
            success: true,
            reply
        });

    } catch (error) {
        console.error("========== OPENAI ERROR ==========");
        console.error("Message:", error.message);
        console.error("Status:", error.status);
        console.error("Code:", error.code);
        console.error("Type:", error.type);
        console.error("==================================");

        return res.status(error.status || 500).json({
            success: false,
            error: error.message || "AI response failed."
        });
    }
});

app.use((req, res) => {
    res.status(404).json({
        error: "Route not found."
    });
});

app.listen(PORT, () => {
    console.log("----------------------------------");
    console.log("AI CHATBOT BACKEND STARTED");
    console.log(`Server: http://localhost:${PORT}`);
    console.log(`Health: http://localhost:${PORT}/api/health`);
    console.log(`AI configured: ${Boolean(client)}`);
    console.log("----------------------------------");
});
