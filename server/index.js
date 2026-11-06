import './load-env.js';

import express from "express";
import cors from "cors";

import connectDB from "./mongodb/connect.js";
import postRoutes from "./routes/postRoutes.js";
import dalleRoutes from "./routes/dalleRoutes.js";

const app = express();

// Reflect browser Origin so Netlify (and local dev) work without enumerating every preview URL.
app.use(cors({ origin: true }));
app.use(express.json({ limit: '50mb' }));

// Middleware
app.use('/api/v1/post', postRoutes);
app.use('/api/v1/dalle', dalleRoutes);

app.get('/', async (req, res) => {
  res.send('Hello from DALL-E!');
})

const startServer = async () => {
  try {
    const port = Number(process.env.PORT) || 8080;
    connectDB(process.env.MONGODB_URL);
    app.listen(port, () => console.log(`Server has started on port http://localhost:${port}`));
  } catch(err) {
    console.log(err)
  }
}

await startServer();
