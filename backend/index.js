const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { generateFile } = require('./generateFile');
const { generateInputFile } = require('./generateInputFile');
const { executeCpp } = require('./executeCpp');
const { executeJava } = require('./executeJava');
const { executePy } = require('./executePy');
const { aiCodeReview } = require('./aiCodeReview');


const app = express();
dotenv.config();

//middlewares
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


app.get("/", (req, res) => {
    res.json({ online: 'compiler' });
});

app.post("/run", async (req, res) => {
    const { language = 'cpp', code, input } = req.body;
    if (code === undefined) {
        return res.status(404).json({ success: false, error: "Empty code!" });
    }

    try {
        const filePath = await generateFile(language, code);
        const inputPath = await generateInputFile(input);
        let output;
        
        if (language === 'cpp' || language === 'c') {
            output = await executeCpp(filePath, inputPath);
        } else if (language === 'java') {
            output = await executeJava(filePath, inputPath);
        } else if (language === 'py') {
            output = await executePy(filePath, inputPath);
        } else {
            return res.status(400).json({ success: false, error: "Unsupported language!" });
        }

        res.json({ filePath, inputPath, output });
    } catch (error) {
        res.status(500).json({ error: "Error in execution, error: " + error.message });
    }
});

app.post("/ai-review", async (req, res) => {
    const { code } = req.body;
    if (code === undefined) {
        return res.status(404).json({ success: false, error: "Empty code!" });
    }
    try {
        const review = await aiCodeReview(code);
        res.json({ review });
    } catch (error) {
        res.status(500).json({ error: "Error in AI review, error: " + error.message });
    }
});
app.listen(process.env.PORT || 8000, () => {
    console.log(`Server is listening on port ${process.env.PORT || 8000}!`);
});