import React, { Suspense, useEffect, useRef, useState, useMemo, useCallback } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, useTexture, Loader, Environment, OrthographicCamera } from '@react-three/drei';
import { MeshStandardMaterial } from 'three/src/materials/MeshStandardMaterial';
import SyncLoader from "react-spinners/SyncLoader";
import { LinearEncoding, sRGBEncoding } from 'three/src/constants';
import { MeshPhysicalMaterial } from 'three';
import './App.css'; // Import the external CSS file
import createAnimation from './converter';
import blinkData from './blendDataBlink.json';
// import TalkData from './blendDataTalk.json';
// import ShutData from './blendDataShut.json';

// import VoiceSelector from './components/VoiceSelector';


import * as THREE from 'three';
import axios from 'axios';
import Subtitles from './Subtitles';
const _ = require('lodash');
// const sdk = require("microsoft-cognitiveservices-speech-sdk");
const host = 'https://luna-backend-yqsl.onrender.com'
// const host = 'http://localhost:5000';
// const host = 'https://mouvmntchatbotback.onrender.com';
let subtitleFileName = '';
let language = "french";
let recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.continuous = false;
const customTimeout = 8000;
let timeoutId;
let voiceMessage = "";
//let mediaRecorder; // MediaRecorder instance
//let recordedChunks = []; // Array to store recorded audio chunks
// Set your Azure Cognitive Services endpoint and key
// const endpoint = process.env.REACT_APP_AZURE_ENDPOINT;
// const apiKey = process.env.REACT_APP_AZURE_KEY;
let stringList;
let convertedTimes;
let indexer = 0;
let currentSubtitle = "";
let context = "";
let firstTime = true;
let canSpeak = true;
let timerResetId;
// const resetTimeout = 10000;
let reset = false;
let gltf;

let langIndex = 9

// Create a SpeechConfig object with your endpoint and key
//const speechConfig = sdk.SpeechConfig.fromEndpoint(urll, apiKey);
function Avatar({ avatar_url, setSpeak, text, playing, playerEnded, setIdle, setPlaying, frLang, enLang, arLang, voices }) {
  let zeroDiv = document.getElementById("stateZeroDiv");
  let playDiv = document.getElementById("statePlayDiv");
  let waitingDiv = document.getElementById("stateWaitingDiv");
  let listeningDiv = document.getElementById("stateListeningDiv");
  let thinkingDiv = document.getElementById("stateThinkingDiv");
  gltf = useGLTF(avatar_url);
  let morphTargetDictionaryBody = null;
  let morphTargetDictionaryLowerGum = null;
  let morphTargetDictionaryLowerteeth = null;
  let morphTargetDictionaryTongue = null;
  let morphTargetDictionaryEyes = null;
  let morphTargetDictionaryBrows = null;
  let morphTargetDictionaryUpperEyeLash = null;
  let morphTargetDictionaryLowerEyeLash = null;
  const [
    headTexture,
    headRoughnessTexture,
    eyesTexture,
    // teethSpecularTexture,
    tshirtDiffuseTexture,
    tshirtNormalTexture,
    tshirtRoughnessTexture,
    skirtDiffuseTexture,
    skirtNormalTexture,
    skirtRoughnessTexture,
    shoesDiffuseTexture,
    shoesNormalTexture,
    shoesRoughnessTexture,
  ] = useTexture([
    "/model/TEX_Head_Col.png",
    "/model/TEX_Head_Roughness.png",
    "/model/eye.png",
    // "/images/teeth_specular.webp",
    "/model/Tshirt_Base_color.png",
    "/model/Tshirt_Normal_OpenGL.png",
    "/model/Tshirt_Roughness.png",
    "/model/Skirt_Base_color.png",
    "/model/Skirt_Normal_OpenGL.png",
    "/model/Skirt_Roughness.png",
    "/model/Shoes_Base_color.png",
    "/model/Shoes_Normal_OpenGL.png",
    "/model/Shoes_Roughness.png",
  ]);

  _.each([
    headTexture,
    headRoughnessTexture,
    eyesTexture,
    // teethSpecularTexture,
    tshirtDiffuseTexture,
    tshirtNormalTexture,
    tshirtRoughnessTexture,
    skirtDiffuseTexture,
    skirtNormalTexture,
    skirtRoughnessTexture,
    shoesDiffuseTexture,
    shoesNormalTexture,
    shoesRoughnessTexture,
  ], t => {
    t.encoding = sRGBEncoding;
    t.flipY = false;
  });
  const synth = window.speechSynthesis;
  tshirtNormalTexture.encoding = LinearEncoding;
  gltf.scene.traverse(node => {
    if (node.type === 'Mesh' || node.type === 'LineSegments' || node.type === 'SkinnedMesh') {
      //console.log(node.name);
      //console.log(node.morphTargetDictionary);
      node.castShadow = true;
      node.receiveShadow = true;
      node.frustumCulled = false;
      if (node.name === "head") {
        node.castShadow = true;
        node.receiveShadow = true;

        node.material = new MeshPhysicalMaterial({ side: THREE.DoubleSide });
        //TODO
        node.material.map = headTexture;
        node.material.shininess = 60;
        node.material.roughness = 1.7;

        // node.material.specularMap = bodySpecularTexture;
        //TODO
        node.material.roughnessMap = headRoughnessTexture;
        //TODO
        //node.material.normalMap = bodyNormalTexture;
        //node.material.normalScale = new Vector2(0.6, 0.6);
        //TODO
        morphTargetDictionaryBody = node.morphTargetDictionary
        node.material.envMapIntensity = 0.8;
        // node.material.visible = false;

      }
      if (node.name === "body") {
        node.castShadow = true;
        node.receiveShadow = true;

        node.material = new THREE.MeshPhysicalMaterial({ side: THREE.DoubleSide, color: 0xC17860 }); // Red color
        //TODO
        //node.material.map = bodyTexture;
        node.material.shininess = 60;
        node.material.roughness = 1.7;

        //node.material.specularMap = bodySpecularTexture;
        //TODO
        //node.material.roughnessMap = bodyRoughnessTexture;
        //TODO
        //node.material.normalMap = bodyNormalTexture;
        //node.material.normalScale = new Vector2(0.6, 0.6);
        //TODO
        //morphTargetDictionaryBody = node.morphTargetDictionary
        node.material.envMapIntensity = 0.8;
        // node.material.visible = false;

      }


      if (node.name === "hands") {
        node.castShadow = true;
        node.receiveShadow = true;

        node.material = new THREE.MeshPhysicalMaterial({ side: THREE.DoubleSide, color: 0xC17860 }); // Red color
        //TODO
        //node.material.map = handTexture;
        node.material.shininess = 60;
        node.material.roughness = 1.7;

        //node.material.specularMap = bodySpecularTexture;
        //TODO
        //node.material.roughnessMap = handRoughnessTexture;
        //TODO
        //node.material.normalMap = bodyNormalTexture;
        //node.material.normalScale = new Vector2(0.6, 0.6);
        //TODO
        //morphTargetDictionaryBody = node.morphTargetDictionary
        node.material.envMapIntensity = 0.8;
        // node.material.visible = false;


      }
      if (node.name === "eyeL") {
        node.material = new MeshStandardMaterial();
        node.material.map = eyesTexture;
        node.material.shininess = 100;
        node.material.roughness = 0.1;
        node.material.envMapIntensity = 0.5;
        morphTargetDictionaryEyes = node.morphTargetDictionary

      }

      if (node.name === "tshirt") {
        node.material = new MeshStandardMaterial();
        node.material.map = tshirtDiffuseTexture;
        node.material.roughnessMap = tshirtRoughnessTexture;
        node.material.normalMap = tshirtNormalTexture;
        //node.material.color.setHex(0xffffff);
        node.material.envMapIntensity = 0.5;
      }

      if (node.name === "skirt") {
        node.material = new MeshStandardMaterial();
        node.material.map = skirtDiffuseTexture;
        node.material.roughnessMap = skirtRoughnessTexture;
        node.material.normalMap = skirtNormalTexture;
        //node.material.color.setHex(0xffffff);
        node.material.envMapIntensity = 0.5;
      }

      if (node.name === "shoes") {
        node.material = new MeshStandardMaterial();
        node.material.map = shoesDiffuseTexture;
        node.material.roughnessMap = shoesRoughnessTexture;
        node.material.normalMap = shoesNormalTexture;
        //node.material.color.setHex(0xffffff);
        node.material.envMapIntensity = 0.5;
      }



      if (node.name.includes("eyebrows")) {
        morphTargetDictionaryBrows = node.morphTargetDictionary;
      }
      /*
            if (node.name.includes("Teeth")) {
      
              node.receiveShadow = true;
              node.castShadow = true;
              node.material = new MeshStandardMaterial();
              node.material.roughness = 0.1;
              node.material.map = teethTexture;
              node.material.normalMap = teethNormalTexture;
      
              node.material.envMapIntensity = 0.7;
      
      
            }
      
            if (node.name.includes("Hair")) {
              node.material = new MeshStandardMaterial();
      
      
              node.material.transparent = true;
              node.material.depthWrite = false;
              node.material.side = 2;
              node.material.color.setHex(0x000000);
      
              node.material.envMapIntensity = 0.3;
            }
      
            if (node.name.includes("TSHIRT")) {
              node.material = new MeshStandardMaterial();
      
              node.material.map = tshirtDiffuseTexture;
              node.material.roughnessMap = tshirtRoughnessTexture;
              node.material.normalMap = tshirtNormalTexture;
              node.material.color.setHex(0xffffff);
      
              node.material.envMapIntensity = 0.5;
      
      
            }
      */

      if (node.name === "gums_lower") {
        morphTargetDictionaryLowerGum = node.morphTargetDictionary;
      }
      if (node.name === "tongue") {
        morphTargetDictionaryTongue = node.morphTargetDictionary;
      }
      if (node.name === "teeth_lower") {
        morphTargetDictionaryLowerteeth = node.morphTargetDictionary;
      }
      if (node.name === "Upper_Eyelash") {
        morphTargetDictionaryUpperEyeLash = node.morphTargetDictionary;
      }
      if (node.name === "Lower_Eyelash") {
        morphTargetDictionaryLowerEyeLash = node.morphTargetDictionary;
      }



    }

  });

  // Define a function to be called when the keyboard button is pressed
  const handleKeyPress = (event) => {
    if (event.key === 's' || event.key === 'S') { // Check for both lowercase and uppercase "S"
      console.log('S key pressed!');
      if (canSpeak) StartSpeaking();

    }
    /*if (event.key === 't' || event.key === 'T') { // Check for both lowercase and uppercase "S"
      //if (canSpeak) PlayTalkAnimation();
    }
    else if (event.key === 'f' || event.key === 'F') { // Check for both lowercase and uppercase "S"
      console.log('F key pressed!');
      language = "french";
      reset = true;
    }
    else if (event.key === 'e' || event.key === 'E') { // Check for both lowercase and uppercase "S"
      console.log('E key pressed!');
      language = "english";
      reset = true;
    }*/
  };

  const handleDocumentPress = () => {
    console.log('document pressed!');
    if (canSpeak) StartSpeaking();
  };

  /*function PlayTalkAnimation() {
    let talkHeadClip = createAnimation(TalkData, morphTargetDictionaryBody, 'head');
    let talkHeadAction = mixer.clipAction(talkHeadClip);
    talkHeadAction.play();

    let talkTeethClip = createAnimation(TalkData, morphTargetDictionaryLowerteeth, 'teeth_lower');
    let talkTeethAction = mixer.clipAction(talkTeethClip);
    talkTeethAction.play();

    let talkTongueClip = createAnimation(TalkData, morphTargetDictionaryTongue, 'tongue');
    let talkTongueAction = mixer.clipAction(talkTongueClip);
    talkTongueAction.play();

    let talkEyeClip = createAnimation(TalkData, morphTargetDictionaryEyes, 'eyeL');
    let talkEyeAction = mixer.clipAction(talkEyeClip);
    talkEyeAction.play();

    let talkEyeBClip = createAnimation(TalkData, morphTargetDictionaryBrows, 'eyebrows');
    let talkEyeBAction = mixer.clipAction(talkEyeBClip);
    talkEyeBAction.play();

    let talkEyeUpperClip = createAnimation(TalkData, morphTargetDictionaryUpperEyeLash, 'Upper_Eyelash');
    let talkEyeUpperAction = mixer.clipAction(talkEyeUpperClip);
    talkEyeUpperAction.play();

    let talkEyeLowerClip = createAnimation(TalkData, morphTargetDictionaryLowerEyeLash, 'Lower_Eyelash');
    let talkEyeLowerAction = mixer.clipAction(talkEyeLowerClip);
    talkEyeLowerAction.play();

    let talkGumsClip = createAnimation(TalkData, morphTargetDictionaryLowerGum, 'gums_lower');
    let talkGumsAction = mixer.clipAction(talkGumsClip);
    talkGumsAction.play();
  }

  function PlayShutAnimation() {
    let talkHeadClip = createAnimation(ShutData, morphTargetDictionaryBody, 'head');
    let talkHeadAction = mixer.clipAction(talkHeadClip);
    talkHeadAction.play();

    let talkTeethClip = createAnimation(ShutData, morphTargetDictionaryLowerteeth, 'teeth_lower');
    let talkTeethAction = mixer.clipAction(talkTeethClip);
    talkTeethAction.play();

    let talkTongueClip = createAnimation(ShutData, morphTargetDictionaryTongue, 'tongue');
    let talkTongueAction = mixer.clipAction(talkTongueClip);
    talkTongueAction.play();

    let talkEyeClip = createAnimation(ShutData, morphTargetDictionaryEyes, 'eyeL');
    let talkEyeAction = mixer.clipAction(talkEyeClip);
    talkEyeAction.play();

    let talkEyeBClip = createAnimation(ShutData, morphTargetDictionaryBrows, 'eyebrows');
    let talkEyeBAction = mixer.clipAction(talkEyeBClip);
    talkEyeBAction.play();

    let talkEyeUpperClip = createAnimation(ShutData, morphTargetDictionaryUpperEyeLash, 'Upper_Eyelash');
    let talkEyeUpperAction = mixer.clipAction(talkEyeUpperClip);
    talkEyeUpperAction.play();

    let talkEyeLowerClip = createAnimation(ShutData, morphTargetDictionaryLowerEyeLash, 'Lower_Eyelash');
    let talkEyeLowerAction = mixer.clipAction(talkEyeLowerClip);
    talkEyeLowerAction.play();

    let talkGumsClip = createAnimation(ShutData, morphTargetDictionaryLowerGum, 'gums_lower');
    let talkGumsAction = mixer.clipAction(talkGumsClip);
    talkGumsAction.play();
  }*/



  const [clips, setClips] = useState([]);

  const mixer = useMemo(() => new THREE.AnimationMixer(gltf.scene), []);
  useEffect(() => {
    // Replace this URL with the actual URL/path of the text file you want to read.
    const fileUrl = '/ContextFile.txt';

    // Fetch the file content using a GET request.
    fetch(fileUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.text();
      })
      .then((contents) => {
        context = contents;
      })
      .catch((error) => {
        console.error('Error reading file:', error);
      });
  }, []);


  // Attach the event listener when the component mounts
  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);

    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  // Attach the event listener when the component mounts
  useEffect(() => {
    document.addEventListener("click", handleDocumentPress);
    // Clean up the event listener when the component unmounts
    return () => {
      document.removeEventListener("click", handleDocumentPress);
    };
  }, []);
  function StartSpeaking() {
    //STATE LISTENING
    //console.log("STATE LISTENING");
    zeroDiv.style.display = "none";
    playDiv.style.display = "none";
    listeningDiv.style.display = "block";
    thinkingDiv.style.display = "none";
    waitingDiv.style.display = "none";

    ResetResetTimer();
    canSpeak = false;
    if (firstTime) {
      // audioPlayer.current.audioEl.current.src = "/zero.mp3";
      //audioPlayer.current.audioEl.current.muted = true;
      //audioPlayer.current.audioEl.current.play();
    }
    var speech = true;
    // window.SpeechRecognition = window.webkitSpeechRecognition;
    //startRecording(); // Start recording audio
    /*if (recognition.lang == "") {
      document.getElementById('tunisie').style.display = 'none';
      document.getElementById('british').style.display = 'none';
      document.getElementById('france').style.display = 'none';
    }*/
    recognition.lang = "fr-FR";

    recognition.interimResults = true;

    //recognition.lang = 'fr-FR'; // Set the language to US English 'ar-TN' 'en-US' fr-FR
    recognition.addEventListener('result', speechResultHandler);

    recognition.addEventListener('speechend', speechEndHandler);

    if (speech === true) {
      recognition.start();
      timeoutId = setTimeout(() => {
        recognition.stop();
        if (voiceMessage === "") canSpeak = true;
      }, customTimeout);
    }

  }
  function ResetResetTimer() {
    if (timerResetId) {//S
      clearTimeout(timerResetId); // Reset the timer by clearing the existing timer
      //console.log('Timer reset');
    } else {
      //console.log('No timer to reset');
    }
  }

  function speechResultHandler(e) {
    voiceMessage = Array.from(e.results)
      .map(result => result[0])
      .map(result => result.transcript)
      .join('')

  }

  function speechEndHandler() {

    //console.log('Texte: ' + voiceMessage);
    if (voiceMessage === "") {
      canSpeak = true;
      return;
    }

    // if (voiceMessage != "") document.getElementById("click_to_record").style.display = "none";
    //TODO START LOADING
    //setLoading(true);
    //STATE THINKING
    //console.log("STATE THINKING");
    zeroDiv.style.display = "none";
    playDiv.style.display = "none";
    listeningDiv.style.display = "none";
    thinkingDiv.style.display = "block";
    waitingDiv.style.display = "none";
    console.log("TEXT", voiceMessage, "LANG", recognition.lang);
    if (recognition.lang === 'ar-TN') {
      if (voiceMessage.includes("تغيير") && voiceMessage.includes("فرنسيه")) {
        langIndex = frLang
        //CHANGE TO FRENCH
        recognition.lang = 'fr-FR';
        //language = "french";
        //document.getElementById('tunisie').style.display = 'none';
        //document.getElementById('british').style.display = 'none';
        //document.getElementById('france').style.display = 'none';
        //setLoading(false);
        //  document.getElementById("click_to_record").style.display = "inline";
        canSpeak = true;
        playerEnded();
        setIdle()
        return;
      }
      else if (voiceMessage.includes("تغيير") && voiceMessage.includes("انجليزيه")) {
        //CHANGE TO FRENCH
        langIndex = enLang
        recognition.lang = 'en-US';
        //language = "english";
        //document.getElementById('tunisie').style.display = 'none';
        //document.getElementById('british').style.display = 'none';
        //document.getElementById('france').style.display = 'none';
        //setLoading(false);
        //  document.getElementById("click_to_record").style.display = "inline";
        canSpeak = true;
        playerEnded();
        setIdle()
        return;
      }
    }
    else if (recognition.lang === 'fr-FR') {
      if (voiceMessage.includes("change") && voiceMessage.includes("arabe")) {
        //CHANGE TO FRENCH
        recognition.lang = 'ar-TN';
        langIndex = arLang
        //language = "arabic";
        //document.getElementById('tunisie').style.display = 'none';
        //document.getElementById('british').style.display = 'none';
        //document.getElementById('france').style.display = 'none';
        //setLoading(false);
        //  document.getElementById("click_to_record").style.display = "inline";
        canSpeak = true;
        playerEnded();
        setIdle()
        return;
      }
      else if (voiceMessage.includes("change") && voiceMessage.includes("anglais")) {
        //CHANGE TO FRENCH
        langIndex = enLang
        recognition.lang = 'en-US';
        //language = "english";
        //document.getElementById('tunisie').style.display = 'none';
        //document.getElementById('british').style.display = 'none';
        //document.getElementById('france').style.display = 'none';
        //setLoading(false);
        //  document.getElementById("click_to_record").style.display = "inline";
        canSpeak = true;
        playerEnded();
        setIdle()
        return;
      }
    }
    else if (recognition.lang === 'en-US') {
      if (voiceMessage.includes("change") && voiceMessage.includes("Arabic")) {
        //CHANGE TO FRENCH
        recognition.lang = 'ar-TN';
        langIndex = arLang
        //language = "arabic";
        //document.getElementById('tunisie').style.display = 'none';
        //document.getElementById('british').style.display = 'none';
        //document.getElementById('france').style.display = 'none';
        //setLoading(false);
        //  document.getElementById("click_to_record").style.display = "inline";
        canSpeak = true;
        playerEnded();
        setIdle()
        return;
      }
      else if (voiceMessage.includes("change") && voiceMessage.includes("French")) {
        //CHANGE TO FRENCH
        recognition.lang = 'fr-FR';
        langIndex = frLang
        //language = "french";
        //document.getElementById('tunisie').style.display = 'none';
        //document.getElementById('british').style.display = 'none';
        //document.getElementById('france').style.display = 'none';
        //setLoading(false);
        //  document.getElementById("click_to_record").style.display = "inline";
        canSpeak = true;
        playerEnded();
        setIdle()
        return;
      }
    }
    recognition.stop(); // Stop the recognition process
    clearTimeout(timeoutId);

    //stopRecording();
    text = voiceMessage;
    voiceMessage = "";
    makeSpeech(text, language, reset)
      .then(response => {
        //TODO STOP LOADING
        //setLoading(false);
        let { blendData, filena, speech } = response.data;
        let newClips = [
          createAnimation(blendData, morphTargetDictionaryBody, 'head'),
          createAnimation(blendData, morphTargetDictionaryLowerteeth, 'teeth_lower'),
          createAnimation(blendData, morphTargetDictionaryTongue, 'tongue'),
          createAnimation(blendData, morphTargetDictionaryEyes, 'eyeL'),
          createAnimation(blendData, morphTargetDictionaryBrows, 'eyebrows'),
          createAnimation(blendData, morphTargetDictionaryUpperEyeLash, 'Upper_Eyelash'),
          createAnimation(blendData, morphTargetDictionaryLowerEyeLash, 'Lower_Eyelash'),
          createAnimation(blendData, morphTargetDictionaryLowerGum, 'gums_lower')];

        //TODO

        // filename = host + filename;
        setClips(newClips);
        console.log("SI",speech,langIndex);
        subtitleFileName = filena;
        if (language === "arabic" || language === "french") {
          currentSubtitle = speech;
        }
        const utterance = new SpeechSynthesisUtterance()
        utterance.text = speech
        utterance.voice = voices[langIndex]
        zeroDiv.style.display = "none";
        playDiv.style.display = "block";
        listeningDiv.style.display = "none";
        thinkingDiv.style.display = "none";
        waitingDiv.style.display = "none";
        const speak = () => {
          window.speechSynthesis.speak(utterance)
          console.log("SPEECH",utterance.text)
          setPlaying(true)
          animate(newClips);
        }
        playDiv.addEventListener('click', speak);
        playDiv.click()
        utterance.addEventListener("start", () => {
          console.log("START",voices[langIndex]);
        });
        utterance.addEventListener("end", () => {
          console.log("DONE");
          playDiv.removeEventListener("click",speak)
          stopAnimation()
          playerEnded()
          setIdle();
        });
        // easySpeak(speech,langIndex).then(() => {
        //   console.log("DONE");
        //   setAudioSource(null)
        //   stopAnimation()
        //   playerEnded()
        //   setIdle();
        // }).catch(() => {
        //   setAudioSource(null)
        //   playerEnded()
        //   setIdle();
        // });
        reset = false;


        
        
      })
      .catch(err => {
        console.error(err);
        setSpeak(false);
      })
  }
  //TODO
  //let idleFbx = useFBX('/model2/Idle.fbx');
  /*let { clips: idleClips } = useAnimations(idleFbx.animations);
  idleClips[0].tracks = _.filter(idleClips[0].tracks, track => {
    return track.name.includes("Head") || track.name.includes("Neck") || track.name.includes("Spine2");
  });

  idleClips[0].tracks = _.map(idleClips[0].tracks, track => {
    console.log(track.name);
    if (track.name.includes("Head")) {
      track.name = "head.quaternion";
    }

    if (track.name.includes("Neck")) {
      track.name = "neck.quaternion";
    }

    if (track.name.includes("Spine")) {
      track.name = "spine2.quaternion";
    }

    return track;

  });
*/
  useEffect(() => {

    //TODO
    console.log(gltf);
    let idleEyebrowClipAction = mixer.clipAction(gltf.animations[0]);
    idleEyebrowClipAction.play();
    let idleHairClipAction = mixer.clipAction(gltf.animations[1]);
    idleHairClipAction.play();
    let idleClipAction = mixer.clipAction(gltf.animations[2]);
    idleClipAction.play();
    let blinkClip = createAnimation(blinkData, morphTargetDictionaryBody, 'head');
    let blinkAction = mixer.clipAction(blinkClip);
    blinkAction.play();

    let blinkUpperEyeLash = createAnimation(blinkData, morphTargetDictionaryUpperEyeLash, 'Upper_Eyelash');
    let blinkUpperEyeLashAction = mixer.clipAction(blinkUpperEyeLash);
    blinkUpperEyeLashAction.play();

    let blinkLowerEyeLash = createAnimation(blinkData, morphTargetDictionaryLowerEyeLash, 'Lower_Eyelash');
    let blinkLowerEyeLashAction = mixer.clipAction(blinkLowerEyeLash);
    blinkLowerEyeLashAction.play();
  }, []);


function animate(newClips) {
  console.log("CLIPS",newClips.length)
  _.each(newClips, clip => {
    let clipAction = mixer.clipAction(clip);
    clipAction.setLoop(THREE.LoopOnce);
    //if (language == "french") clipAction.timeScale = 1.2;
    //else if (language == "arabic") clipAction.timeScale = 1.03;
    clipAction.play();
  });
}

function stopAnimation() {
  mixer.stopAllAction()
  let idleEyebrowClipAction = mixer.clipAction(gltf.animations[0]);
  idleEyebrowClipAction.play();
  let idleHairClipAction = mixer.clipAction(gltf.animations[1]);
  idleHairClipAction.play();
  let idleClipAction = mixer.clipAction(gltf.animations[2]);
  idleClipAction.play();
  let blinkClip = createAnimation(blinkData, morphTargetDictionaryBody, 'head');
  let blinkAction = mixer.clipAction(blinkClip);
  blinkAction.play();

  let blinkUpperEyeLash = createAnimation(blinkData, morphTargetDictionaryUpperEyeLash, 'Upper_Eyelash');
  let blinkUpperEyeLashAction = mixer.clipAction(blinkUpperEyeLash);
  blinkUpperEyeLashAction.play();

  let blinkLowerEyeLash = createAnimation(blinkData, morphTargetDictionaryLowerEyeLash, 'Lower_Eyelash');
  let blinkLowerEyeLashAction = mixer.clipAction(blinkLowerEyeLash);
  blinkLowerEyeLashAction.play();
}
  // Play animation clips when available
  useEffect(() => {
    console.log("PLAYER",playing)
    if (playing === false)
      return;

    _.each(clips, clip => {
      let clipAction = mixer.clipAction(clip);
      clipAction.setLoop(THREE.LoopOnce);
      //if (language == "french") clipAction.timeScale = 1.2;
      //else if (language == "arabic") clipAction.timeScale = 1.03;
      clipAction.play();

    });

  }, [playing]);


  useFrame((state, delta) => {
    mixer.update(delta);
  });


  return (
    <group name="avatar">
      <primitive object={gltf.scene} dispose={null} />
    </group>
  );
}


function makeSpeech(text, language, reset) {
  return axios.post(host + '/talk', { text, language, reset });
}


function clearStorage() {
  if (!firstTime) {
    return axios.post(host + '/clearStorage');
  }
  firstTime = false;
}

// const STYLES = {
//   area: { position: 'absolute', bottom: '10px', left: '10px', zIndex: 500 },
//   text: { margin: '0px', width: '300px', padding: '5px', background: 'none', color: '#ffffff', fontSize: '1.2em', border: 'none' },
//   speak: { padding: '10px', marginTop: '5px', display: 'block', color: '#FFFFFF', background: '#222222', border: 'None' },
//   area2: { position: 'absolute', top: '5px', right: '15px', zIndex: 500 },
//   label: { color: '#777777', fontSize: '0.8em' }
// }

function App() {
  let zeroDiv = document.getElementById("stateZeroDiv");
  let playDiv = document.getElementById("statePlayDiv");
  let waitingDiv = document.getElementById("stateWaitingDiv");
  let listeningDiv = document.getElementById("stateListeningDiv");
  let thinkingDiv = document.getElementById("stateThinkingDiv");
  
  const [speak, setSpeak] = useState(false);
  const [text, setText] = useState("Write your context here ..");
  const [audioSource, setAudioSource] = useState(null);
  const [playing, setPlaying] = useState(false);
  // const [currentTime, setCurrentTime] = useState(0);
  const [loading, setLoading] = useState(false);

  // const [selectedVoice, setSelectedVoice] = useState();
  // const [selectedIndex, setSelectedIndex] = useState();
  const [language, setLanguage] = useState('fr-FR');
  const [voices, setVoices] = useState([]);
  const [frLang, setFrLang] = useState(9);
  const [enLang, setEnLang] = useState(5);
  const [arLang, setArLang] = useState(30);
  const synth = window.speechSynthesis;

  const populateVoiceList = useCallback(() => {
    const newVoices = synth.getVoices();
    setVoices(newVoices);
    console.log("VOICES", newVoices);
  }, []);
  useEffect(() => {
    let fr = voices.findIndex(voice => voice.lang === 'fr-CA') || voices.findIndex(voice => voice.lang === 'fr-FR')
    let en = voices.findIndex(voice => voice.lang === 'fr-AU') || voices.findIndex(voice => voice.lang === 'en-GB')
    let ar = voices.findIndex(voice => voice.lang === 'ar-SA') || voices.findIndex(voice => voice.lang === 'ar-TN')
    console.log("FR",fr)
    _.each(voices, (voice,index) => {
      console.log("VOICE",voice.lang,index)
    })
    langIndex = fr
    setFrLang(fr);
    setEnLang(en);
    setArLang(ar);
  }, [voices]);
  useEffect(() => {
    populateVoiceList();
    if (synth.onvoiceschanged !== undefined) {
      synth.onvoiceschanged = populateVoiceList;
    }
  }, [populateVoiceList]);
  


  

  // End of play
  function playerEnded(e) {
    setAudioSource(null);
    setSpeak(false);
    setPlaying(false);
    if (!firstTime) {
      canSpeak = true;
      //STATE WAITING
      //console.log("STATE WAITING");
      
      //START TIMER
    }
    clearStorage();
    //  document.getElementById("click_to_record").style.display = "inline";

  }

  function setIdle(e) {
    setSpeak(false);
    setPlaying(false);
    currentSubtitle = "";
    if (!firstTime) {
      canSpeak = true;
      //STATE WAITING
      //console.log("STATE WAITING");
      zeroDiv.style.display = "none";
      playDiv.style.display = "none";
      listeningDiv.style.display = "none";
      thinkingDiv.style.display = "none";
      waitingDiv.style.display = "block";
      //START TIMER
    }
    //  document.getElementById("click_to_record").style.display = "inline";

  }


  // function StartResetTimer() {
  //   //console.log('Timer started');
  //   timerResetId = setTimeout(function () {
  //     //STATE ZERO
  //     //console.log('STATE ZERO');
  //     zeroDiv.style.display = "block";
  //     listeningDiv.style.display = "none";
  //     thinkingDiv.style.display = "none";
  //     waitingDiv.style.display = "none";
  //     reset = true;
  //   }, resetTimeout); // Set a timer for 5 seconds (5000 milliseconds)
  // }

  

  /*
    function checkSound() {
      analyser.getByteFrequencyData(dataArray);
  
      // Calculate the average amplitude
      var sum = dataArray.reduce((acc, val) => acc + val, 0);
      var averageAmplitude = sum / bufferLength;
  
      if (averageAmplitude > 0) {
        console.log("Audio is playing with sound.");
      } else {
        console.log("Audio is playing but there's no audible sound.");
      }
    }*/

  function CreatingSubtitlesFromFile() {
    indexer = 0;
    convertedTimes = [];
    stringList = [];
    fetch(host + "/" + subtitleFileName + ".vtt")
      .then(response => response.text())
      .then(data => {
        const lines = data.match(/^- .+/gm);
        stringList = lines.map(line => line.replace(/^- /, ''));
        const regex = /(\d{2}:\d{2}:\d{2}.\d{3})(?=.* --> )/g;
        const matches = data.match(regex);
        const timeList = matches.map(match => match.split(' ')[0]);
        convertedTimes = timeList.map((timeString) => {
          const [hours, minutes, seconds] = timeString.split(':');
          const milliseconds = timeString.match(/\d{2}\.(\d{3})/)[1];
          const totalSeconds = parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseInt(seconds);
          return parseFloat(`${totalSeconds}.${milliseconds}`);
        });

      })
      .catch(error => {
        console.error('Error reading the file:', error);
      });
  }
  /*
        <div style={STYLES.area}>
          <textarea rows={4} type="text" style={STYLES.text} value={text} onChange={(e) => setText(e.target.value.substring(0, 200))} />
          <button onClick={() => setSpeak(true)} style={STYLES.speak}> { speak? 'Running...': 'Speak' }</button>
  /*
  <textarea id="area" rows={20} type="text" style={STYLES.text} value={text} onChange={(e) => setText(e.target.value.substring(0, 50000))} />
  <button id="hidebtn" onClick={() => { document.getElementById("area").style.display = 'none'; document.getElementById("hidebtn").style.display = 'none'; }} style={STYLES.speak}> {speak ? 'HIDE' : 'HIDE'}</button>
  */
  /*
    


            <div style={STYLES.area}>
        <textarea id="area" rows={20} type="text" style={STYLES.text} value={text} onChange={(e) => setText(e.target.value.substring(0, 50000))} />
        <button id="hidebtn" onClick={() => { document.getElementById("area").style.display = 'none'; document.getElementById("hidebtn").style.display = 'none'; }} style={STYLES.speak}> {speak ? 'HIDE' : 'HIDE'}</button>
        <div className="voice_to_text">
          <button id="click_to_record">Speak</button>
        </div>
        
  </div>*/

  
  return (
    <div className="full">
      <div className='loading'>
        <SyncLoader
          loading={loading}
          size={30}
          color='red' />
      </div>

      

      {/* <Stats /> */}
      <Canvas dpr={2} onCreated={(ctx) => {
        ctx.gl.physicallyCorrectLights = true;
      }}>

        <OrthographicCamera
          makeDefault
          zoom={2300}
          position={[0, 1.48, 1]}
        />

        {/* <OrbitControls
        target={[0, 1.65, 0]}
      /> */}

        <Suspense fallback={null}>
          <Environment background={false} files="/images/photo_studio_loft_hall_1k.hdr" />
        </Suspense>

        <Suspense fallback={null}>
          <Bg />
        </Suspense>

        <Suspense fallback={null}>



          <Avatar
            //avatar_url="/ac.glb"
            avatar_url="/model/trial.gltf"
            setSpeak={setSpeak}
            text={text}
            playing={playing}
            playerEnded={playerEnded}
            setIdle={setIdle}
            setPlaying={setPlaying}
            frLang={frLang}
            enLang={enLang}
            arLang={arLang}
            voices={voices}
          />
          
        </Suspense>
      </Canvas>
      
      <Loader dataInterpolation={(p) => `Loading... please wait`} />
      <div id="topRightImageContainer">
        <img src="/images/QrCode.png" alt="Top Right Img" id="topRightImage" />
      </div>
      <div id="roundedDiv">
        <img src="/images/arrow.png" alt="Arrow" className="center-image" style={{ order: 2 }} />
        <img src="/images/mouvmntLogo.png" alt="Mouvmnt Logo" id="mouvmntLogo" style={{ order: 1 }} />
      </div>
      <div id='stateZeroDiv' style={{ display: 'block' }}>
        <img src="/images/aiBubble.png" alt="AI Bubble" className="bottom-right" />
        <img src="/images/bubbles.png" alt="Bubbles" className="bottom-center small-image" />
      </div>
      <div id='statePlayDiv' style={{ display: 'none' }}>
        <img src="/images/arrow.png" alt="Play Bubble" className="bottom-right" />
      </div>
      <div id='stateWaitingDiv' style={{ display: 'none' }}>
        <img src="/images/helloBubble.png" alt="Hello Bubble" className="bottom-right" />
      </div>
      <div id='stateListeningDiv' style={{ display: 'none' }}>
        <img src="/images/listeningBubble.png" alt="Listen Bubble" className="bottom-right" />
      </div>
      <div id='stateThinkingDiv' style={{ display: 'none' }}>
        <img src="/images/thinkingBubble.png" alt="Think Bubble" className="bottom-right" />
      </div>
      <Subtitles text={currentSubtitle} />
    </div>
  )
}

function Bg() {
  const texture = useTexture('/images/Background LOUNA.png');
  return (
    <mesh position={[0, 1.5, -2]} scale={[2, 2, 2]}>
      <planeBufferGeometry />
      <meshBasicMaterial map={texture} />

    </mesh>
  )
}

export default App;