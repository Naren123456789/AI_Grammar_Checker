const dotenv = require("dotenv").config();
const express = require("express");
const path = require('path');
const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const port = process.env.PORT || 5000;
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.set('views', path.join(__dirname, 'views'));
//app.set('public', path.join(__dirname, 'public'));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
//app.use(express.static("public", path.join(__dirname, 'public')));

app.get("/", (req, res) => {
    res.render("index", {
        corrected: "",
        originalText: "", 
    });
});
//Main route
app.post("/correct", async (req, res) => {
    const text = req.body.text.trim();
    if (!text) {
        res.render("index", {
            corrected: "Please enter some text to correct",
            originalText: text, 
        });
        return;
    }
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});
        const prompt = `Correct the following text grammatically: ${text}`;
        const result = await model.generateContent(prompt);
        console.log(prompt);
        console.log(result.response.text());
        if (result.response || !result.response.text()) {
            res.render("index", {
              corrected: "Error:  API response is unsuccessful.",
              originalText: text,
            });
            return;
        }
        const correctedText = result.response.text();
        console.log(correctedText);
        res.render("index", {
            corrected: correctedText,
            originalText: text,
        });
    } catch (error) {
        res.render("index", {
            corrected: `Error2. Please try again. ${error}`,
            originalText: text,
        });
    }
});


//start the server
app.listen(port, () => {
    console.log(`Server started on http://localhost:${port}`);
});

/*
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const genAI = new GoogleGenerativeAI("AIzaSyCBxFpDI3sfqPKguQ9NkVuEyFQwiygDU3I");

async function run() {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});
  const result = await model.generateContent(["Explain how AI works"]);
  console.log(result.response.text());
}
run();
*/