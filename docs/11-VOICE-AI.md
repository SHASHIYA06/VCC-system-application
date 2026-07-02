# VOICE AI SYSTEM
## OpenAI Whisper + TTS Integration

**Version**: 4.0 | **Date**: July 17, 2026

---

## 1. Architecture

```
User Voice Input
    ↓
Web Speech API (Browser)
    ↓
OpenAI Whisper (Speech-to-Text)
    ↓
Text Processing
    ↓
AI Query (Multi-Agent RAG)
    ↓
Response Generation
    ↓
OpenAI TTS (Text-to-Speech)
    ↓
Audio Output
```

## 2. Components

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Speech Recognition | Web Speech API + OpenAI Whisper | Convert voice to text |
| Text Processing | TypeScript | Clean and normalize input |
| AI Query | LangChain + Multi-Agent RAG | Generate response |
| Text-to-Speech | OpenAI TTS | Convert response to audio |
| Audio Playback | Web Audio API | Play response audio |

## 3. Configuration

```typescript
// Environment Variables
WHISPER_MODEL=medium
DEFAULT_LANGUAGE=en
ELEVENLABS_API_KEY=sk_...
ELEVENLABS_VOICE=Brian
ELEVENLABS_MODEL=eleven_multilingual_v2
```

## 4. Features

- Real-time speech recognition
- Multi-language support (95%+ accuracy)
- Voice command parsing
- Context-aware responses
- Natural voice output
- Background noise filtering

## 5. API Integration

```
POST /api/voice/transcribe
  Body: { audio: base64 }
  Response: { text: "What is wire 3001?" }

POST /api/voice/speak
  Body: { text: "Wire 3001 connects..." }
  Response: { audio: base64 }
```

## 6. Frontend Component

```
src/components/voice/VoiceAssistant.tsx
src/app/api/voice/transcribe/route.ts
src/app/api/voice/speak/route.ts
```
