const apiBase = 'http://localhost:8000';

const cameraVideo = document.getElementById('cameraVideo');
const startCameraBtn = document.getElementById('startCameraBtn');
const uploadVideoInput = document.getElementById('uploadVideoInput');
const uploadVideoBtn = document.getElementById('uploadVideoBtn');
const captureFramesBtn = document.getElementById('captureFramesBtn');
const recordAnswerBtn = document.getElementById('recordAnswerBtn');
const textAnswerInput = document.getElementById('textAnswerInput');
const submitTextAnswerBtn = document.getElementById('submitTextAnswerBtn');
const playSummaryBtn = document.getElementById('playSummaryBtn');
const voiceStatus = document.getElementById('voiceStatus');
const resultOutput = document.getElementById('resultOutput');
const logArea = document.getElementById('logArea');
const progressBar = document.getElementById('progressBar');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const stepsList = document.getElementById('stepsList');

let previewStream = null;
let usingUploadedVideo = false;
let sessionId = null;
let currentQuestion = null;
let lastSummaryAudio = null;
let lastSummaryText = null;
let mediaRecorder = null;
let recordedChunks = [];

function log(message) {
  const entry = document.createElement('div');
  entry.className = 'log-entry';
  entry.textContent = `${new Date().toLocaleTimeString()}: ${message}`;
  logArea.prepend(entry);
}

function setStatus(message, isError = false) {
  voiceStatus.textContent = message;
  if (isError) {
    voiceStatus.classList.add('error');
  } else {
    voiceStatus.classList.remove('error');
  }
}

function enableControls({ capture = false, record = false, text = false, summary = false }) {
  captureFramesBtn.disabled = !capture;
  recordAnswerBtn.disabled = !record;
  textAnswerInput.disabled = !text;
  submitTextAnswerBtn.disabled = !text;
  playSummaryBtn.disabled = !summary;
}

async function startCamera() {
  try {
    if (previewStream) {
      return;
    }
    usingUploadedVideo = false;
    previewStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    cameraVideo.srcObject = previewStream;
    cameraVideo.src = '';
    await cameraVideo.play();
    enableControls({ capture: true });
    log('Camera started successfully.');
  } catch (error) {
    log('Camera failed: ' + error.message);
    setStatus('Failed to access camera. Please allow camera permission.');
  }
}

async function loadUploadedVideo() {
  const file = uploadVideoInput.files[0];
  if (!file) {
    setStatus('Please select a video file first.');
    return;
  }

  if (previewStream) {
    previewStream.getTracks().forEach((track) => track.stop());
    previewStream = null;
  }

  usingUploadedVideo = true;
  cameraVideo.srcObject = null;
  cameraVideo.src = URL.createObjectURL(file);
  cameraVideo.muted = true;
  setStatus('Loading uploaded video...');

  await new Promise((resolve) => {
    const onLoaded = () => {
      cameraVideo.removeEventListener('loadedmetadata', onLoaded);
      resolve();
    };
    cameraVideo.addEventListener('loadedmetadata', onLoaded);
  });

  await cameraVideo.play();
  enableControls({ capture: true });
  setStatus('Uploaded video ready. Capture frames to assess.');
  log('Video file loaded successfully.');
}

async function uploadVideoFile() {
  const file = uploadVideoInput.files[0];
  if (!file) {
    setStatus('Please select a video file first.');
    return;
  }

  const form = new FormData();
  form.append('video', file, file.name);

  setStatus('Uploading video and assessing...');
  log('Uploading video file for assessment...');

  try {
    const response = await fetch(`${apiBase}/api/assess/upload_video`, {
      method: 'POST',
      body: form,
    });

    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      const text = await response.text();
      throw new Error(`Upload failed: ${response.status} ${response.statusText} - ${text}`);
    }

    if (!response.ok) {
      throw new Error(data.error || `Upload failed: ${response.status} ${response.statusText}`);
    }

    sessionId = data.session_id;
    setStatus('Video uploaded. Starting voice diagnostics...');
    log('Received session ID: ' + sessionId);
    resultOutput.textContent = JSON.stringify(data.condition_report, null, 2);
    await requestNextQuestion();
  } catch (error) {
    log('Upload failed: ' + error.message);
    setStatus('Video upload failed: ' + error.message, true);
    resultOutput.textContent = `Upload error: ${error.message}`;
  }
}

function seekVideo(time) {
  return new Promise((resolve) => {
    const onSeeked = () => {
      cameraVideo.removeEventListener('seeked', onSeeked);
      resolve();
    };
    cameraVideo.addEventListener('seeked', onSeeked);
    cameraVideo.currentTime = Math.min(time, cameraVideo.duration || time);
  });
}

async function captureFramesFromVideo(count = 5) {
  const canvas = document.createElement('canvas');
  canvas.width = cameraVideo.videoWidth || 640;
  canvas.height = cameraVideo.videoHeight || 360;
  const ctx = canvas.getContext('2d');
  const frames = [];

  if (usingUploadedVideo && cameraVideo.duration) {
    const originalPaused = cameraVideo.paused;
    cameraVideo.pause();

    for (let i = 0; i < count; i += 1) {
      const time = ((i + 0.5) / count) * cameraVideo.duration;
      await seekVideo(time);
      ctx.drawImage(cameraVideo, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      frames.push(dataUrl.split(',')[1]);
    }

    if (!originalPaused) {
      await cameraVideo.play();
    }
  } else {
    for (let i = 0; i < count; i += 1) {
      ctx.drawImage(cameraVideo, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      frames.push(dataUrl.split(',')[1]);
    }
  }

  return frames;
}

async function assessVideo() {
  if (!previewStream && !usingUploadedVideo) {
    setStatus('Start camera first or upload a video.');
    return;
  }

  setStatus('Capturing frames and sending to backend...');
  log('Capturing frames.');
  const frames = await captureFramesFromVideo(5);

  const form = new FormData();
  frames.forEach((frame) => form.append('frames', frame));

  try {
    const response = await fetch(`${apiBase}/api/assess/video`, {
      method: 'POST',
      body: form,
    });

    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      const text = await response.text();
      throw new Error(`Assessment failed: ${response.status} ${response.statusText} - ${text}`);
    }

    if (!response.ok) {
      throw new Error(data.error || `Assessment request failed: ${response.status} ${response.statusText}`);
    }

    sessionId = data.session_id;
    setStatus('Visual assessment complete. Starting voice diagnostics...');
    log('Received session ID: ' + sessionId);
    resultOutput.textContent = JSON.stringify(data.condition_report, null, 2);
    await requestNextQuestion();
  } catch (error) {
    log('Assessment failed: ' + error.message);
    setStatus('Assessment failed: ' + error.message, true);
    resultOutput.textContent = `Assessment error: ${error.message}`;
  }
}

async function requestNextQuestion() {
  if (!sessionId) {
    setStatus('No active session.');
    return;
  }

  setStatus('Requesting next voice question...');
  try {
    const response = await fetch(`${apiBase}/api/voice/question?session_id=${encodeURIComponent(sessionId)}&language_code=en-IN`);
    const result = await response.json();

    if (result.done) {
      setStatus('All questions answered. Finalizing assessment...');
      enableControls({ record: false, text: false });
      await finalizeAssessment();
      return;
    }

    currentQuestion = result;
    setStatus('Playing diagnostic question.');
    log('Question ready: ' + result.question_id);
    textAnswerInput.value = '';
    await playAudioBase64(result.audio_b64, result.question_text);
    enableControls({ record: true, text: true });
  } catch (error) {
    log('Question request failed: ' + error.message);
    setStatus('Failed to get the next voice question.');
  }
}

function playTextToSpeech(text) {
  return new Promise((resolve) => {
    if (!window.speechSynthesis) {
      log('Browser speech synthesis unavailable.');
      resolve();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-IN';
    utterance.onend = resolve;
    utterance.onerror = () => {
      log('Speech synthesis failed.');
      resolve();
    };
    window.speechSynthesis.speak(utterance);
  });
}

function recognizeSpeech() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    log('Browser speech recognition unavailable.');
    return Promise.resolve('');
  }

  return new Promise((resolve) => {
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.trim();
      log('Speech recognition transcript: ' + transcript);
      resolve(transcript);
    };

    recognition.onerror = (event) => {
      log('Speech recognition error: ' + (event.error || 'unknown')); 
      resolve('');
    };

    recognition.onend = () => {
      resolve('');
    };

    try {
      recognition.start();
      setTimeout(() => {
        recognition.stop();
      }, 4000);
    } catch (error) {
      log('Speech recognition failed to start: ' + error.message);
      resolve('');
    }
  });
}

function playAudioBase64(audioBase64, fallbackText = '') {
  if (!audioBase64) {
    if (fallbackText) {
      log('Using browser TTS fallback.');
      return playTextToSpeech(fallbackText);
    }
    log('No audio available for playback.');
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    const audio = new Audio('data:audio/wav;base64,' + audioBase64);
    audio.onended = resolve;
    audio.onerror = async () => {
      log('Audio playback failed. Falling back to text speech.');
      if (fallbackText) {
        await playTextToSpeech(fallbackText);
      }
      resolve();
    };
    audio.play().catch(async () => {
      if (fallbackText) {
        await playTextToSpeech(fallbackText);
      }
      resolve();
    });
  });
}

async function recordAnswer() {
  if (!currentQuestion) {
    setStatus('No question to answer yet.');
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    recordedChunks = [];
    mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
    const transcriptPromise = recognizeSpeech();

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunks.push(event.data);
      }
    };

    mediaRecorder.onstop = async () => {
      const blob = new Blob(recordedChunks, { type: 'audio/webm' });
      const transcript = await transcriptPromise;
      await sendVoiceAnswer(blob, transcript);
      stream.getTracks().forEach((track) => track.stop());
    };

    mediaRecorder.start();
    setStatus('Recording answer for 4 seconds...');
    enableControls({ record: false, text: false });
    recordAnswerBtn.disabled = true;

    setTimeout(() => {
      mediaRecorder.stop();
      setStatus('Processing answer...');
    }, 4000);
  } catch (error) {
    log('Microphone access failed: ' + error.message);
    setStatus('Failed to access microphone. Please allow audio permission.');
  }
}

async function sendVoiceAnswer(audioBlob = null, transcript = '') {
  const form = new FormData();
  form.append('session_id', sessionId);
  if (audioBlob) {
    form.append('audio', audioBlob, 'answer.webm');
  }
  form.append('language_code', 'en-IN');
  if (transcript) {
    form.append('transcript', transcript);
  }

  try {
    const response = await fetch(`${apiBase}/api/voice/answer`, {
      method: 'POST',
      body: form,
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Voice answer failed');
    }

    if (!data.understood) {
      await playAudioBase64(data.retry_audio_b64, currentQuestion?.question_text ? 'Sorry, I did not understand. ' + currentQuestion.question_text : 'Sorry, I did not understand. Please answer again.');
      setStatus('Please answer the question again.');
      enableControls({ record: true });
      return;
    }

    log('Answer recorded: ' + data.transcript);
    if (data.done) {
      setStatus('All questions answered. Finalizing...');
      await finalizeAssessment();
    } else {
      await requestNextQuestion();
    }
  } catch (error) {
    log('Answer submission failed: ' + error.message);
    setStatus('Failed to submit voice answer.');
    enableControls({ record: true, text: true });
  }
}

async function submitTextAnswer() {
  if (!currentQuestion) {
    setStatus('No question to answer yet.');
    return;
  }
  const transcript = textAnswerInput.value.trim();
  if (!transcript) {
    setStatus('Type a short response first.');
    return;
  }
  setStatus('Submitting typed answer...');
  enableControls({ record: false, text: false });
  await sendVoiceAnswer(null, transcript);
  textAnswerInput.value = '';
}

async function reverseGeocode(lat, lon) {
  const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;
  try {
    const response = await fetch(nominatimUrl);
    if (!response.ok) {
      const txt = await response.text().catch(() => '');
      log(`Reverse geocoding HTTP ${response.status}: ${txt}`);
      return { city: 'unknown', state: 'unknown' };
    }

    const data = await response.json();
    return {
      city: (data.address && (data.address.city || data.address.town || data.address.village || data.address.county)) || 'unknown',
      state: (data.address && data.address.state) || 'unknown',
    };
  } catch (error) {
    log('Reverse geocoding failed: ' + (error.message || error));
    return { city: 'unknown', state: 'unknown' };
  }
}

async function finalizeAssessment() {
  if (!sessionId) {
    setStatus('No session available to finalize.');
    return;
  }

  setStatus('Getting location and finalizing assessment...');
  let latitude = 0, longitude = 0, location = { city: 'unknown', state: 'unknown' };
  try {
    if (navigator.geolocation) {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 10000 });
      });
      latitude = position.coords.latitude;
      longitude = position.coords.longitude;
      location = await reverseGeocode(latitude, longitude);
    } else {
      log('Geolocation not available; using unknown location.');
    }
  } catch (geoErr) {
    log('Geolocation denied or failed; using unknown location. (' + (geoErr.message || geoErr) + ')');
  }

  try {
    const form = new FormData();
    form.append('session_id', sessionId);
    form.append('lat', latitude);
    form.append('lng', longitude);
    form.append('city', location.city);
    form.append('state', location.state);
    form.append('language_code', 'en-IN');

    // Start finalize as background job
    const response = await fetch(`${apiBase}/api/assess/finalize`, {
      method: 'POST',
      body: form,
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Finalize failed');
    }

    setStatus('Finalization started; waiting for results...');
    log('Finalize enqueued for session: ' + sessionId);
    // poll for results
    await pollFinalizeStatus(sessionId);
  } catch (error) {
    log('Finalization failed: ' + error.message);
    setStatus('Finalization failed. Please try again.', true);
    resultOutput.textContent = `Finalization failed: ${error.message}`;
  }
}

async function pollFinalizeStatus(sid, interval = 2000, timeout = 120000) {
  const start = Date.now();
  while (true) {
    try {
      const resp = await fetch(`${apiBase}/api/assess/status?session_id=${encodeURIComponent(sid)}`);
      const info = await resp.json();

      if (info.error) {
        throw new Error(info.error);
      }

      log('Finalize status: ' + info.status + ' - ' + (info.progress || ''));
      // update progress bar based on reported timings
      const steps = ['repair', 'value', 'circularity', 'impact', 'action'];
      const timings = info.timings || [];
      const completedSteps = new Set(timings.map(t => t.step));

      // Prefer backend estimated_percent if available (uses historical averages)
      let percent = null;
      if (info.estimated_percent !== undefined && info.estimated_percent !== null) {
        percent = info.estimated_percent;
      } else {
        const completed = completedSteps.size;
        percent = Math.round((completed / steps.length) * 100);
      }

      if (progressFill) progressFill.style.width = percent + '%';
      if (progressText) progressText.textContent = `${percent}% - ${info.progress || 'processing'}`;

      // update steps list
      if (stepsList) {
        stepsList.innerHTML = '';
        for (const s of steps) {
          const li = document.createElement('li');
          li.className = 'step-item';
          const timing = timings.find(t => t.step === s);
          li.textContent = s + (timing ? ` - ${timing.duration_s.toFixed(2)}s` : ' - pending');
          if (completedSteps.has(s)) li.classList.add('done');
          stepsList.appendChild(li);
        }
      }
      if (info.status === 'done') {
        resultOutput.textContent = formatFinalReport(info);
        setStatus('Assessment complete. Play the final summary.');
        lastSummaryAudio = info.summary_audio_b64;
        lastSummaryText = info.summary_text || 'Assessment complete.';
        if (lastSummaryAudio || lastSummaryText) playSummaryBtn.disabled = false;
        enableControls({ summary: true });
        if (progressFill) progressFill.style.width = '100%';
        if (progressText) progressText.textContent = '100% - complete';
        return info;
      }

      if (info.status === 'error') {
        setStatus('Finalization error: ' + (info.error || 'unknown'));
        log('Finalize error: ' + (info.error || 'unknown'));
        enableControls({ summary: false });
        return info;
      }

      if (Date.now() - start > timeout) {
        setStatus('Finalization timed out while waiting for results.');
        log('Finalize polling timed out.');
        return { status: 'timeout' };
      }

      await new Promise((r) => setTimeout(r, interval));
    } catch (e) {
      log('Status poll failed: ' + e.message);
      setStatus('Finalize polling failed: ' + e.message, true);
      resultOutput.textContent = `Finalize polling failed: ${e.message}`;
      await new Promise((r) => setTimeout(r, interval));
    }
  }
}

function formatFinalReport(info) {
  const lines = [];
  lines.push(`Passport ID: ${info.passport_id || 'N/A'}`);
  lines.push(`Status: ${info.status || 'unknown'}`);
  lines.push(`Progress: ${info.progress || 'unknown'}`);
  lines.push(`Recommendation: ${info.recommendation || 'unknown'}`);
  lines.push(`Confidence: ${info.confidence != null ? info.confidence : 'unknown'}`);
  lines.push('');
  lines.push('Summary:');
  lines.push(info.summary_text || 'Assessment complete.');
  lines.push('');
  if (info.error) {
    lines.push('Error: ' + info.error);
    lines.push('');
  }
  if (Array.isArray(info.timings) && info.timings.length) {
    lines.push('Timings:');
    info.timings.forEach((t) => {
      lines.push(`  ${t.step}: ${t.duration_s.toFixed(2)}s`);
    });
  }
  return lines.join('\n');
}

function playSummary() {
  if (lastSummaryAudio) {
    return playAudioBase64(lastSummaryAudio, lastSummaryText);
  }
  if (lastSummaryText) {
    return playTextToSpeech(lastSummaryText);
  }
}

startCameraBtn.addEventListener('click', startCamera);
uploadVideoBtn.addEventListener('click', uploadVideoFile);
captureFramesBtn.addEventListener('click', assessVideo);
recordAnswerBtn.addEventListener('click', recordAnswer);
submitTextAnswerBtn.addEventListener('click', submitTextAnswer);
playSummaryBtn.addEventListener('click', playSummary);

setStatus('Ready to start.');
enableControls({ capture: false, record: false, summary: false });
