import express from "express";
import Thread from "../models/Thread.js";
import User from "../models/User.js";
import getOpenAIAPIResponse from "../utils/openai.js";
import jwt from "jsonwebtoken";
import { authMiddleware } from "../middlewares/auth.js";

const router = express.Router();

// Test route
router.post("/test", async (req, res) => {
    try {
        const thread = new Thread({
            threadId: "abc",
            title: "Testing New Thread2"
        });
        let response = await thread.save();
        res.send(response);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Failed to save in DB" });
    }
});

// Get all threads (authenticated)
router.get("/thread", authMiddleware, async (req, res) => {
    try {
        const threads = await Thread.find({ user: req.user._id }).sort({ updatedAt: -1 });
        res.json(threads);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Failed to fetch threads" });
    }
});

// Get messages of a thread (authenticated)
router.get("/thread/:threadId", authMiddleware, async (req, res) => {
    const { threadId } = req.params;

    try {
        const thread = await Thread.findOne({ threadId, user: req.user._id });
        if (!thread) {
            return res.status(404).json({ error: "Thread not found" });
        }

        res.json(thread.messages);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Failed to fetch chat" });
    }
});

// Delete a thread (authenticated)
router.delete("/thread/:threadId", authMiddleware, async (req, res) => {
    const { threadId } = req.params;

    try {
        const deletedThread = await Thread.findOneAndDelete({ threadId, user: req.user._id });
        if (!deletedThread) {
            return res.status(404).json({ error: "Thread not found" });
        }
        res.status(200).json({ success: "Thread deleted successfully" });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Failed to delete thread" });
    }
});

// Chat route (optional auth for free users)
router.post("/chat", authMiddlewareOptional, async (req, res) => {
    const { threadId, message } = req.body;

    if (!threadId || !message) {
        return res.status(400).json({ error: "missing required fields" });
    }

    try {
        let thread = await Thread.findOne({ threadId });

        if (!thread) {
            // Create a new thread in DB
            thread = new Thread({
                threadId,
                title: message,
                messages: [{ role: "user", content: message }],
                user: req.user ? req.user._id : null
            });
        } else {
            thread.messages.push({ role: "user", content: message });
        }

        const assistantReply = await getOpenAIAPIResponse(message);
        thread.messages.push({ role: "assistant", content: assistantReply });
        thread.updatedAt = new Date();

        await thread.save();
        res.json({ reply: assistantReply });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "something went wrong" });
    }
});

// Helper middleware: optional auth for free users
async function authMiddlewareOptional(req, res, next) {
    const token = req.headers.authorization?.split(" ")[1];
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id);
        } catch (err) {
            console.log("Invalid token");
        }
    }
    next();
}

export default router;
