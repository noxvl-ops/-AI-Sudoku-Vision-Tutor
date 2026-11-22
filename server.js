import express from "express";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import path from "node:path";
import { fileURLToPath } from "node:url";

dotenv.config();
const app = express(), PORT = process.env.PORT || 3000;
const dir = path.dirname(fileURLToPath(import.meta.url));
app.use(express.json({limit:"12mb"}));
app.use(express.static(path.join(dir,"public")));
const ai = process.env.GEMINI_API_KEY ? new GoogleGenAI({apiKey:process.env.GEMINI_API_KEY}) : null;
const model = process.env.GEMINI_MODEL || "gemini-2.0-flash";
const schema = {type:"ARRAY",minItems:9,maxItems:9,items:{type:"ARRAY",minItems:9,maxItems:9,items:{type:"INTEGER",minimum:0,maximum:9}}};
const valid = g => Array.isArray(g) && g.length===9 && g.every(r=>Array.isArray(r)&&r.length===9&&r.every(n=>Number.isInteger(n)&&n>=0&&n<=9));

app.get("/api/status",(_,res)=>res.json({configured:!!ai,model}));
app.post("/api/ocr",async(req,res)=>{
  try {
    if(!ai) return res.status(503).json({error:"Gemini non configurato: inserisci GEMINI_API_KEY nel file .env."});
    const {mimeType,data}=req.body||{};
    if(!data||!["image/jpeg","image/png","image/webp"].includes(mimeType)) return res.status(400).json({error:"Immagine non valida. Usa JPG, PNG o WEBP."});
    const out=await ai.models.generateContent({model,contents:[{role:"user",parts:[
      {inlineData:{mimeType,data}},
      {text:"Leggi il Sudoku nell'immagine. Restituisci esclusivamente la matrice 9x9: 0 per caselle vuote o illeggibili, cifre da 1 a 9 per quelle chiaramente visibili. Rispetta righe dall'alto in basso e colonne da sinistra a destra. Non inventare cifre."}
    ]}],config:{responseMimeType:"application/json",responseSchema:{type:"OBJECT",properties:{grid:schema},required:["grid"]}}});
    const result=JSON.parse(out.text);
    if(!valid(result.grid)) throw new Error("La griglia restituita non è valida.");
    res.json(result);
  } catch(e){console.error(e);res.status(500).json({error:e.message||"Errore OCR Gemini."});}
});
app.post("/api/explain",async(req,res)=>{
  try {
    if(!ai) return res.status(503).json({error:"Gemini non configurato: inserisci GEMINI_API_KEY nel file .env."});
    const {grid,row,col,value,technique}=req.body||{};
    if(!valid(grid)||![row,col,value].every(Number.isInteger)||row<0||row>8||col<0||col>8||value<1||value>9) return res.status(400).json({error:"Dati della mossa non validi."});
    const out=await ai.models.generateContent({model,contents:`Spiega in italiano in massimo tre frasi, in modo didattico, perché la mossa indicata è valida. Griglia Sudoku 9x9 (0 vuoto): ${JSON.stringify(grid)}. Mossa: riga ${row+1}, colonna ${col+1}, inserire ${value}. Tecnica: ${technique}. Non modificare la mossa.`,config:{responseMimeType:"application/json",responseSchema:{type:"OBJECT",properties:{spiegazione:{type:"STRING"}},required:["spiegazione"]}}});
    res.json({explanation:JSON.parse(out.text).spiegazione});
  } catch(e){console.error(e);res.status(500).json({error:e.message||"Errore spiegazione Gemini."});}
});
app.listen(PORT,()=>console.log(`Sudoku Vision: http://localhost:${PORT}`));