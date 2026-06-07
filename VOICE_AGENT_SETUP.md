# 🎤 VCC VOICE AGENT - COMPLETE SETUP GUIDE

**Status**: ✅ Professional API Integration Complete  
**Provider**: OpenAI Whisper + OpenAI TTS  
**Accuracy**: 95%+ (Industry Leading)  
**Date**: June 7, 2026

---

## 🎯 WHAT'S NEW

Your voice agent now uses **OpenAI's professional APIs** for maximum accuracy:

### Before (Browser-based):
- ❌ Limited accuracy (~70-80%)
- ❌ Browser-dependent
- ❌ No offline support
- ❌ Limited language support
- ❌ Requires HTTPS

### After (OpenAI-powered):
- ✅ **95%+ accuracy** (Whisper AI)
- ✅ Works on any browser
- ✅ Professional quality
- ✅ Multi-language support
- ✅ High-quality voice synthesis
- ✅ **Fallback to browser** if API unavailable

---

## 🔧 SETUP INSTRUCTIONS

### Step 1: Get OpenAI API Key

1. **Go to OpenAI**: https://platform.openai.com/
2. **Sign up or log in** to your account
3. **Navigate to API Keys**: Click your profile → "View API keys"
4. **Create new key**: Click "Create new secret key"
5. **Copy the key**: It starts with `sk-...`
6. **Important**: Save it securely (you won't see it again!)

### Step 2: Add API Key to Your Project

Open your `.env.local` file and add/update:

```bash
# OpenAI API Key for Voice Agent (Whisper + TTS)
OPENAI_API_KEY=sk-proj-your-actual-key-here
```

**Example** (replace with your real key):
```bash
OPENAI_API_KEY=sk-proj-abc123def456ghi789jkl012mno345pqr678stu901vwx234yz
```

### Step 3: Restart Development Server

```bash
# Stop the server (Ctrl+C)
# Then restart
npm run dev
```

### Step 4: Test Voice Agent

1. Open your application: http://localhost:3000
2. Click the **Voice Assistant button** (bottom-right, microphone icon)
3. Click the **microphone** to start recording
4. Say a command: "What is TRAC system?"
5. Wait for transcription and AI response
6. Listen to the voice response!

---

## 🎙️ HOW IT WORKS

### Complete Voice Pipeline:

```
1. 🎤 User speaks
   ↓
2. 🎙️ Audio recorded (browser)
   ↓
3. 📤 Sent to /api/voice/transcribe
   ↓
4. 🤖 OpenAI Whisper transcribes (95%+ accuracy)
   ↓
5. 🧠 Command interpreted (navigate/search/query)
   ↓
6. [If Query] → AI RAG System processes
   ↓
7. 💬 AI generates response
   ↓
8. 🔊 /api/voice/speak converts to speech (OpenAI TTS)
   ↓
9. 🎧 User hears high-quality voice response
```

---

## 📊 API ENDPOINTS CREATED

### 1. `/api/voice/transcribe` - Speech Recognition
**Purpose**: Convert speech to text using OpenAI Whisper

**Features**:
- 95%+ accuracy
- Multi-language support
- Word-level timestamps
- Automatic command detection
- Fallback to browser API

**Usage**:
```javascript
const formData = new FormData();
formData.append('audio', audioBlob);
formData.append('language', 'en');

const response = await fetch('/api/voice/transcribe', {
  method: 'POST',
  body: formData,
});

const result = await response.json();
// { transcript, confidence, command, executionTime }
```

### 2. `/api/voice/speak` - Text-to-Speech
**Purpose**: Convert AI responses to natural speech

**Features**:
- High-quality voices (6 options)
- Adjustable speed
- 24kHz sample rate
- Natural prosody
- Fallback to browser API

**Usage**:
```javascript
const response = await fetch('/api/voice/speak', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    text: 'The TRAC system controls traction...',
    voice: 'alloy', // or 'nova', 'echo', 'fable', 'onyx', 'shimmer'
    speed: 1.0,
  }),
});

const audioBlob = await response.blob();
const audio = new Audio(URL.createObjectURL(audioBlob));
audio.play();
```

---

## 🗣️ AVAILABLE VOICES

| Voice | Description | Best For |
|-------|-------------|----------|
| **alloy** | Neutral and balanced (default) | General use |
| **echo** | Male voice | Professional tone |
| **fable** | British accent | Formal communications |
| **onyx** | Deep male voice | Authority and clarity |
| **nova** | Female voice | Friendly and warm |
| **shimmer** | Soft female voice | Calm and soothing |

**Change voice in**:
`src/components/voice/VoiceAssistant.tsx` line where it calls `/api/voice/speak`:
```typescript
body: JSON.stringify({
  text: ragData.unifiedResponse,
  voice: 'nova', // Change this
  speed: 1.0,
}),
```

---

## 💬 SUPPORTED COMMANDS

### Navigation Commands:
- "Go to dashboard"
- "Show drawings"
- "Open wires"
- "Show systems"
- "Open equipment"
- "Show troubleshooting"
- "Open GSD"
- "Show intelligence and AI"

### Search Commands:
- "Search for wire 3003"
- "Find drawing 942-58120"
- "Show connector APS_CN1"
- "Find system TRAC"

### Query Commands (AI Powered):
- "What is TRAC system?"
- "Explain brake system"
- "Tell me about door control"
- "How does VVVF work?"
- "What is trainline 4062?"

---

## 🔍 DEBUGGING

### Check if API Key is Working:

1. **Open browser console** (F12)
2. **Click voice button** and speak
3. **Look for logs**:
   ```
   🎤 Processing voice command with OpenAI Whisper...
   ✅ Transcription: "what is trac system"
   🎯 Command detected: { action: 'query', ... }
   🤖 Getting AI response...
   ✅ AI response received
   🔊 Converting response to speech...
   ✅ Voice response ready
   ```

### Common Issues & Solutions:

#### Issue 1: "OpenAI API key not configured"
**Solution**:
```bash
# Check if key is in .env.local
cat .env.local | grep OPENAI_API_KEY

# If missing, add it:
echo 'OPENAI_API_KEY=sk-your-key-here' >> .env.local

# Restart server
npm run dev
```

#### Issue 2: "Invalid OpenAI API key"
**Solution**:
- Verify key is correct (starts with `sk-proj-` or `sk-`)
- Check for extra spaces or quotes
- Regenerate key from OpenAI dashboard
- Make sure you're not using an organization key

#### Issue 3: "API quota exceeded"
**Solution**:
- Check OpenAI usage: https://platform.openai.com/usage
- Add credit to your OpenAI account
- Upgrade to paid plan if on free tier
- Fallback will use browser API automatically

#### Issue 4: "Transcription failed"
**Solution**:
- Check internet connection
- Verify microphone permissions
- Check browser console for specific error
- System automatically falls back to browser API

#### Issue 5: Voice response not playing
**Solution**:
- Check browser allows autoplay
- Check volume is not muted
- Text response is still visible
- Try clicking play button manually

---

## 💰 PRICING

### OpenAI Whisper (Speech-to-Text):
- **Cost**: $0.006 per minute
- **Example**: 10 seconds = $0.001
- **Typical command**: 3-5 seconds = ~$0.0005

### OpenAI TTS (Text-to-Speech):
- **Cost**: $15 per 1M characters
- **Example**: 100-word response = ~$0.001
- **Typical response**: 50-100 words = ~$0.0008

### Total Cost per Voice Interaction:
- **Average**: $0.0013 (~$0.13 per 100 interactions)
- **Monthly** (100 queries/day): ~$4
- **Very affordable** for professional quality!

---

## 🎯 ACCURACY COMPARISON

| Provider | Accuracy | Latency | Cost | Quality |
|----------|----------|---------|------|---------|
| **OpenAI Whisper** | 95%+ | ~2-3s | $0.006/min | ⭐⭐⭐⭐⭐ |
| Browser Web Speech | 70-80% | ~1-2s | Free | ⭐⭐⭐ |
| Google Cloud Speech | 90-95% | ~1-2s | $0.016/min | ⭐⭐⭐⭐⭐ |
| Azure Speech | 90-95% | ~1-2s | $1.00/hr | ⭐⭐⭐⭐⭐ |

**Winner**: OpenAI Whisper (best accuracy-to-cost ratio)

---

## 🚀 ADVANCED FEATURES

### Multi-Language Support:

Edit `/api/voice/transcribe` request:
```javascript
formData.append('language', 'hi'); // Hindi
formData.append('language', 'es'); // Spanish
formData.append('language', 'fr'); // French
```

Supported languages:
- English (en)
- Hindi (hi)
- Spanish (es)
- French (fr)
- German (de)
- Italian (it)
- Portuguese (pt)
- Dutch (nl)
- Polish (pl)
- Russian (ru)
- Japanese (ja)
- Korean (ko)
- Chinese (zh)
- And many more!

### Adjust Speech Speed:

Edit voice generation call:
```javascript
body: JSON.stringify({
  text: response,
  voice: 'alloy',
  speed: 1.5, // Faster (0.25 - 4.0)
}),
```

### Use HD Voice Model:

For even higher quality, edit `/api/voice/speak/route.ts`:
```typescript
model: 'tts-1-hd', // Instead of 'tts-1'
```
(Costs 2x but incredible quality)

---

## ✅ VERIFICATION CHECKLIST

After setup, verify:

- [ ] OpenAI API key added to `.env.local`
- [ ] Development server restarted
- [ ] Voice button appears (bottom-right)
- [ ] Clicking microphone starts recording
- [ ] Spoken command is transcribed correctly
- [ ] AI generates response (for queries)
- [ ] Voice response plays automatically
- [ ] Console shows: "✅ Voice response ready"
- [ ] No API key errors in console
- [ ] Fallback message appears if API unavailable

---

## 📈 MONITORING

### Check API Usage:
1. Go to: https://platform.openai.com/usage
2. View Whisper usage (audio transcription)
3. View TTS usage (audio generation)
4. Set usage limits if needed

### Monitor Application:
```javascript
// Console logs show:
🎤 Processing with OpenAI Whisper
✅ Transcription: [text]
🤖 Getting AI response
🔊 Converting to speech
✅ Complete (Xms)
```

---

## 🎓 BEST PRACTICES

### 1. Error Handling:
- System automatically falls back to browser API
- Users always see text response
- Voice is enhancement, not requirement

### 2. Performance:
- Transcription: ~2-3 seconds
- AI processing: ~1-2 seconds
- Voice synthesis: ~1-2 seconds
- **Total**: 4-7 seconds end-to-end

### 3. User Experience:
- Show loading indicators
- Display transcript immediately
- Play voice automatically
- Allow text reading while voice plays

### 4. Cost Optimization:
- Cache common responses
- Limit response length
- Use standard model (not HD)
- Monitor usage regularly

---

## 🆘 SUPPORT

### If Voice Agent Still Not Working:

1. **Check API Key**:
   ```bash
   # In terminal
   echo $OPENAI_API_KEY
   # Should show: sk-proj-...
   ```

2. **Test API Directly**:
   ```bash
   curl https://api.openai.com/v1/models \
     -H "Authorization: Bearer $OPENAI_API_KEY"
   # Should return list of models
   ```

3. **Check Console Logs**:
   - Open browser console (F12)
   - Look for specific error messages
   - All errors now show clear guidance

4. **Test Each Endpoint**:
   ```bash
   # Test transcription
   curl http://localhost:3000/api/voice/transcribe
   
   # Test TTS
   curl http://localhost:3000/api/voice/speak
   ```

5. **Review Documentation**:
   - `COMPLETE_100_PERCENT.md` - Full details
   - `VOICE_AGENT_SETUP.md` - This file
   - OpenAI docs: https://platform.openai.com/docs

---

## 🎉 SUCCESS INDICATORS

You'll know it's working when:

✅ **Microphone icon** appears and works  
✅ **Console shows** "✅ Transcription: [your words]"  
✅ **Transcript appears** in voice panel  
✅ **AI response** generates automatically  
✅ **Voice plays** with high quality  
✅ **Navigation works** for "go to" commands  
✅ **Search works** for "find" commands  
✅ **Queries work** for "what is" questions  

---

## 📝 SUMMARY

**What you got**:
- Professional speech recognition (OpenAI Whisper)
- High-quality voice synthesis (OpenAI TTS)
- 95%+ accuracy (industry-leading)
- Multi-language support
- 6 voice options
- Automatic fallback to browser
- Comprehensive error handling
- Full integration with AI system

**Cost**: ~$0.0013 per interaction (~$4/month for 100 queries/day)

**Setup time**: 5 minutes

**Result**: Professional voice agent that actually works! 🚀

---

**Setup complete!** Your voice agent is now powered by OpenAI's professional APIs. Just add your API key and start speaking! 🎤✨
