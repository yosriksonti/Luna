import React, { useState, useCallback, useEffect } from "react";
import EasySpeech from 'easy-speech'


const VoiceSelector = ({ selected = 0, onSelected, setSelectedVoice, setSelectedIndex, synth, setLanguage }) => {
    const [voices, setVoices] = useState([]);
    EasySpeech.init({ maxTimeout: 5000, interval: 250 })
      .then(() => console.debug('load complete'))
      .catch(e => console.error(e))
    const populateVoiceList = useCallback(() => {
      const newVoices = EasySpeech.voices();
      console.log(voices)
      setVoices(newVoices);
    }, []);
  
    const handleOnSelected = (e) => {
        // console.log("SELECTED VOICE", voices[e.target.value])
        onSelected({voice: voices[e.target.value], index: e.target.value, language: voices[e.target.value].lang})
        // setSelectedVoice(voices[e.target.value]);
        // setSelectedIndex(e.target.value);
        // setLanguage(voices[e.target.value].lang)
        }

    useEffect(() => {
      populateVoiceList();
      if (synth.onvoiceschanged !== undefined) {
        synth.onvoiceschanged = populateVoiceList;
      }
    }, [populateVoiceList]);
  
    return (
      <select
        value={selected}
        onChange={handleOnSelected}
      >
        {voices.map((voice, index) => (
          <option key={index} value={index}>
            {voice.name} ({voice.lang}) {voice.default && ' [Default]'}
          </option>
        ))}
      </select>
    );
  };

  export default VoiceSelector;