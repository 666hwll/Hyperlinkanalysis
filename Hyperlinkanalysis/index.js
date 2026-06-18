const express = require('express');
const cors = require('cors');


const splitter = require('./backend/split_links.js')
const scraper = require('./backend/scrape.js');

const PORT = 3000;
const app = express();
let server;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Node + TypeScript works!');
});

app.get('/events', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');

    const project = {
        name: "Mein Projekt",
        version: "1.0",
        files: [
            "index.html",
            "main.js"
        ]
    };

    res.write(`data: ${JSON.stringify(project)}\n\n`);
    res.end();
});

app.post('/search', (req, res) => {
    console.log(req.body);
    console.log("Received from frontend:", req.body.content);

    res.json({
        success: true
    });
});

app.post('/upload', async (req, res) => {
    const blob = req.body.content;   // already a plain string
    console.log("Type:", typeof req.body.content);
    console.log("Received string blob:");
    console.log(blob);
    
    // start splitting
    let scrape_list = splitter.urlDetection(blob);
    let content_list = await scraper.scrapeURLs(scrape_list, scraper.user_agent);
    res.json({ success: true,
                valid_urls: scrape_list,
                valid_content: content_list
    });
});

// Graceful shutdown
function shutdown(message = "Server shutting down...") {
    console.log(`\n${message}`);

    // Send goodbye to all connected clients (if using SSE or WebSocket)
    // For now, we'll log it. You can expand this later.

    // Close the server so no new connections are accepted
    if (server) {
        server.close(() => {
            console.log("HTTP server closed.");
            process.exit(0);
        });
    } else {
        process.exit(0);
    }
}

// Listen for different termination signals
process.on('SIGTERM', () => shutdown("Server received SIGTERM (shutdown)"));
process.on('SIGINT', () => shutdown("Server received SIGINT (Ctrl+C)"));   // Most common during development

// Optional: Catch uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error("Uncaught Exception:", err);
    shutdown("Server crashed - shutting down");
});

server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

