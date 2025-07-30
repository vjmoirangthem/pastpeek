import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward, Volume2, X, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TTSFloaterProps {
  isOpen: boolean;
  onClose: () => void;
  text: string;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onSeek: (seconds: number) => void;
}

export function TTSFloater({ 
  isOpen, 
  onClose, 
  text, 
  isPlaying, 
  onTogglePlay, 
  onSeek 
}: TTSFloaterProps) {
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const loadVoices = () => {
      const voices = speechSynthesis.getVoices();
      setAvailableVoices(voices);
      if (voices.length > 0 && !selectedVoice) {
        setSelectedVoice(voices[0].name);
      }
    };

    loadVoices();
    speechSynthesis.addEventListener('voiceschanged', loadVoices);
    
    return () => {
      speechSynthesis.removeEventListener('voiceschanged', loadVoices);
    };
  }, [selectedVoice]);

  const handleVoiceChange = (voiceName: string) => {
    setSelectedVoice(voiceName);
    // Restart speech with new voice if currently playing
    if (isPlaying) {
      speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const voice = availableVoices.find(v => v.name === voiceName);
      if (voice) {
        utterance.voice = voice;
      }
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 100, scale: 0.8 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 30 
          }}
          className="fixed bottom-6 right-6 z-50 bg-card border border-border rounded-2xl shadow-museum p-4 min-w-[300px]"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-museum-gold/10">
                <Volume2 className="w-4 h-4 text-museum-gold" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">Text to Speech</h3>
                <p className="text-xs text-muted-foreground">Historical narration</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
                className="h-8 w-8 p-0"
              >
                <Settings className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Settings Panel */}
          <AnimatePresence>
            {showSettings && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 p-3 bg-secondary/50 rounded-lg border border-border"
              >
                <label className="text-xs text-muted-foreground mb-2 block">
                  Voice Selection
                </label>
                <Select value={selectedVoice} onValueChange={handleVoiceChange}>
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="Select voice..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableVoices.map((voice) => (
                      <SelectItem key={voice.name} value={voice.name}>
                        {voice.name} ({voice.lang})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Controls */}
          <div className="flex items-center justify-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSeek(-15)}
              className="h-10 w-10 p-0 rounded-full"
              title="Back 15 seconds"
            >
              <SkipBack className="w-4 h-4" />
            </Button>

            <Button
              variant={isPlaying ? "secondary" : "default"}
              size="sm"
              onClick={onTogglePlay}
              className="h-12 w-12 p-0 rounded-full bg-museum-gold hover:bg-museum-gold/90 text-primary-foreground"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5 ml-0.5" />
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onSeek(15)}
              className="h-10 w-10 p-0 rounded-full"
              title="Forward 15 seconds"
            >
              <SkipForward className="w-4 h-4" />
            </Button>
          </div>

          {/* Progress indicator */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>Reading historical content...</span>
              <span>{text.length} chars</span>
            </div>
            <div className="w-full bg-secondary h-1 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-museum-gold"
                initial={{ width: 0 }}
                animate={{ width: isPlaying ? "100%" : "0%" }}
                transition={{ duration: text.length / 10, ease: "linear" }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}