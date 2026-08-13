const express = require('express');

const app = express();
const PORT = process.env.PORT || 3003;

const multipass_url = "http://192.168.252.4:8000/webhook";

app.use(express.json());

app.all('/webhook', async (req, res) => {
    console.log("Query params:", req.query);
    console.log("Body:", JSON.stringify(req.body, null, 2));
    const validationToken = req.query.validationToken;

    if (validationToken) {
        return res
            .status(200)
            .type("text/plain")
            .send(validationToken);
    }

 console.log("==== RECEIVED REQUEST ====");
    console.log(req.method, req.originalUrl);
    try {
        // Preserve all query parameters
        const url = new URL(multipass_url);
        Object.entries(req.query).forEach(([key, value]) => {
            if (Array.isArray(value)) {
                value.forEach(v => url.searchParams.append(key, v));
            } else {
                url.searchParams.append(key, value);
            }
        });

return;

        const response = await fetch(url.toString(), {
            method: req.method,
            headers: {
                "Content-Type": "application/json",
            },
            body: ["GET", "HEAD"].includes(req.method)
                ? undefined
                : JSON.stringify(req.body),
        });

        const text = await response.text();
console.log(text);
        res.status(response.status).send(text);
    } catch (err) {
        console.error("Proxy error:", err);
        res.status(500).json({
            error: "Failed to forward request",
            details: err.message,
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
