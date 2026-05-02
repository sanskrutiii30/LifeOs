const pool = require("../config/db");
const axios = require("axios");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");

exports.createTaskWithAi = asyncHandler(async (req, res) => {
  const { input } = req.body;

  if(!input){
    throw new AppError("Input Required",400);
  }
    const result = await callGemini({
      contents: [
        {
          parts: [
            {
              text: `Return ONLY valid JSON:
                      {
                        "title": "",
                        "priority": "low | medium | high",
                        "duedate": ""
                      }
                        Convert relative dates like "Next week" , "tommarrow" into exact date. Today is ${new Date().toISOString().split("T")[0]}
                      Input: ${input}`
            }
          ]
        }
      ]
    });

    console.log(JSON.stringify(result.data, null, 2));

    const aiText = result.data.candidates[0].content.parts[0].text;

    if(!aiText){
      throw new AppError("AI didn't return valid response",500);
    }

    let cleaned = aiText.replace(/```json/g, "").replace(/```/g, "").trim();

    let parsedText;

    try {
      parsedText = JSON.parse(cleaned);
    } catch (err) {
      throw new AppError("AI returned invalid JSON", 500);
    }

    if(!parsedText.title){
      throw new AppError("AI response missing response",500);
    }

    const convertDate = (datastr) =>{
      const date = new Date(datastr);
      return isNaN(date) ? null : date.toISOString().split("T")[0];
    }
    const safeDate = convertDate(parsedText.duedate);

    const priority = ["low","medium","high"].includes(parsedText.priority)? parsedText.priority : "medium";

    await pool.query("INSERT INTO tasks (user_id, title, priority, duedate) VALUES ($1,$2,$3,$4)",
      [
        req.user.userId,
        parsedText.title,
        priority,
        safeDate
      ]
    );

    res.json({success : true, message: "AI task created",  data : parsedText});
});

const callGemini = async (payload) =>{
  for(let i = 0; i <3 ; i++){
    try {

      const result = await axios.post
      (`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`
        ,payload,{headers:{"Content-Type" : "application/json"}});

        return result;
      
    } catch (err) {
      if (i === 2) throw err;
      console.log("Retrying api calling");
      await new Promise(r => setTimeout(r,1000));
    }
  }
};
  
