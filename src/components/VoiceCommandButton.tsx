import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff } from 'lucide-react';
import { toast } from 'sonner';
import { Task } from '@/types';

interface VoiceCommandButtonProps {
  onAddTask: (task: Task) => void;
}

export default function VoiceCommandButton({ onAddTask }: VoiceCommandButtonProps) {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = false;
      recognitionInstance.lang = 'en-US';
      recognitionInstance.interimResults = false;
      recognitionInstance.maxAlternatives = 1;
      
      recognitionInstance.onresult = (event) => {
        const speechResult = event.results[0][0].transcript;
        processVoiceCommand(speechResult);
      };
      
      recognitionInstance.onend = () => {
        setIsListening(false);
      };
      
      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        toast.error('Error recognizing speech. Please try again.');
        setIsListening(false);
      };
      
      setRecognition(recognitionInstance);
    }
  }, []);

  const toggleListening = () => {
    if (!recognition) {
      toast.error('Speech recognition is not supported in your browser.');
      return;
    }
    
    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
      setIsListening(true);
      toast.info('Listening for voice commands...');
    }
  };

  const processVoiceCommand = (command: string) => {
    // Simple command processing for adding tasks
    // Format: "Add task [title] due [date]" or "Add task [title]"
    const addTaskRegex = /add task (.*?)(?:due (.+))?$/i;
    const match = command.match(addTaskRegex);
    
    if (match) {
      const title = match[1]?.trim();
      const dueDateStr = match[2]?.trim();
      
      if (title) {
        // Parse the due date if provided
        let dueDate: Date | undefined = undefined;
        if (dueDateStr) {
          try {
            // Try to parse natural language dates
            if (dueDateStr.toLowerCase() === "today") {
              dueDate = new Date();
            } else if (dueDateStr.toLowerCase() === "tomorrow") {
              dueDate = new Date();
              dueDate.setDate(dueDate.getDate() + 1);
            } else {
              // Try to parse other date formats
              dueDate = new Date(dueDateStr);
            }
            
            // Check if date is valid
            if (isNaN(dueDate.getTime())) {
              dueDate = undefined;
            }
          } catch (error) {
            console.error("Error parsing date:", error);
            dueDate = undefined;
          }
        }
        
        // Create the task
        const newTask: Task = {
          id: crypto.randomUUID(),
          title,
          description: "",
          completed: false,
          dueDate,
          priority: "medium",
          createdAt: new Date()
        };
        
        onAddTask(newTask);
        toast.success(`Added task: ${title}`);
      }
    } else {
      toast.info('Command not recognized. Try saying "Add task [task name]"');
    }
  };

  return (
    <Button
      variant={isListening ? "destructive" : "secondary"}
      size="icon"
      onClick={toggleListening}
      className="rounded-full h-12 w-12 shadow-md"
      title={isListening ? "Stop listening" : "Voice command"}
    >
      {isListening ? (
        <MicOff className="h-5 w-5" />
      ) : (
        <Mic className="h-5 w-5" />
      )}
    </Button>
  );
}