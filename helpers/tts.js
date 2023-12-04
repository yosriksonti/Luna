// azure-cognitiveservices-speech.js
require('dotenv').config()
const sdk = require('microsoft-cognitiveservices-speech-sdk');
const blendShapeNames = require('./blendshapeNames');
const _ = require('lodash');
const askGPT = require('./askGPT');
const translate = require('arabic-name-to-en/translate');
const fs = require('fs');
const path = require('path');
let context = "";
let SSML = '';
let generateAnimation = require('./animation')



const key = process.env.AZURE_KEY;
const region = process.env.AZURE_REGION;
//<voice name="en-US-JennyNeural">
//<voice name="ar-TN-ReemNeural">
let currentLanguage = "english";
let resetDiscussion = false;
let triggerNumber = 0;
/**
 * Node.js server code to convert text to speech
 * @returns stream
 * @param {*} key your resource key
 * @param {*} region your resource region
 * @param {*} text text to convert to audio/speech
 * @param {*} filename optional - best for long text - temp file for converted speech/audio
 */
const textToSpeech = async (text, language, reset) => {
    console.log("language", language, "text", text, "reset", reset)
    return new Promise(async (resolve, reject) => {
        //READ CONTEXT FROM THE FILE
        const filePath = path.join(__dirname, '../', 'contextFile.txt'); // Replace with the actual file path
        fs.readFile(filePath, 'utf8', async (err, data) => {
            if (err) {
                console.error('Error reading the file:', err);
                return;
            }
            context = data;
            let speech = null;
            let ssml = null;
            let blendData = []
            if (reset) {
                resetDiscussion = true;
            }
            else {
                resetDiscussion = false;
            }
            console.log(context);
            speech = await askGPT(text, context, resetDiscussion);
            let wordsArray = speech.split(" ");
            let offset = 4
            for(let i = 0 ; i < wordsArray.length ; i++){
                let animation = generateAnimation(offset)
                blendData = [...blendData,...animation]
                offset += 1/320;
            }
            console.log(wordsArray.length)
            resolve({ blendData, filename: `/speech.mp3`, filena: "", speech: speech });
        });
    });



};

module.exports = textToSpeech;