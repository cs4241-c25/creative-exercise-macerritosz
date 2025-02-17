import express from "express";
import path from "path"
import { fileURLToPath } from 'url';

// Create an ES module-friendly __dirname
const __filename = fileURLToPath(import.meta.url);


const app = express();
const __dirname = path.dirname(__filename);
// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve the main HTML page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});