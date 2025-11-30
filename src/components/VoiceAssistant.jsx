import React, { useState, useEffect } from 'react';
import { Mic, MicOff, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function VoiceAssistant() {
    const [showHelp, setShowHelp] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [feedback, setFeedback] = useState('');
    const navigate = useNavigate();
    const [recognition, setRecognition] = useState(null);

    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognitionInstance = new SpeechRecognition();
            recognitionInstance.continuous = false;
            recognitionInstance.interimResults = false;
            recognitionInstance.lang = 'en-US';

            recognitionInstance.onresult = (event) => {
                const text = event.results[0][0].transcript;
                setTranscript(text);
                processCommand(text);
                setIsListening(false);
            };

            recognitionInstance.onerror = (event) => {
                console.error('Speech recognition error', event.error);
                setIsListening(false);
                setFeedback('Sorry, I didn\'t catch that.');
            };

            recognitionInstance.onend = () => {
                setIsListening(false);
            };

            setRecognition(recognitionInstance);
        } else {
            setFeedback('Voice commands not supported in this browser.');
        }
    }, []);

    const toggleListening = () => {
        if (!recognition) return;

        if (isListening) {
            recognition.stop();
            setIsListening(false);
        } else {
            recognition.start();
            setIsListening(true);
            setFeedback('Listening...');
            setTranscript('');
        }
    };

    const processCommand = (text) => {
        const command = text.toLowerCase();

        if (command.includes('dashboard') || command.includes('home')) {
            navigate('/dashboard/user'); // Default to user dashboard for now
            setFeedback('Navigating to Dashboard');
        } else if (command.includes('pickup') || command.includes('schedule')) {
            setFeedback('Opening Pickup Section');
        } else if (command.includes('reward') || command.includes('points')) {
            setFeedback('Showing Rewards');
        } else if (command.includes('market') || command.includes('shop')) {
            navigate('/marketplace');
            setFeedback('Navigating to Marketplace');
        } else if (command.includes('profile')) {
            navigate('/profile');
            setFeedback('Opening Profile');
        } else {
            setFeedback(`Command not recognized: "${text}"`);
        }

        setTimeout(() => {
            setFeedback('');
            setTranscript('');
        }, 3000);
    };

    if (!recognition) return null;

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
            {/* Help Guide Modal */}
            {showHelp && (
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 mb-2 animate-fade-in-up w-64">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Mic className="h-4 w-4 text-emerald-500" />
                            Voice Commands
                        </h3>
                        <button onClick={() => setShowHelp(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                    <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                        <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            "Go to Dashboard"
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            "Open Marketplace"
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            "Schedule Pickup"
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            "Show Profile"
                        </li>
                    </ul>
                </div>
            )}

            {(feedback || transcript) && (
                <div className="bg-white dark:bg-gray-800 p-3 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 mb-2 animate-fade-in-up max-w-xs">
                    {transcript && <p className="text-sm text-gray-500 dark:text-gray-400 italic">"{transcript}"</p>}
                    {feedback && <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">{feedback}</p>}
                </div>
            )}

            <div className="flex items-center gap-2">
                <button
                    onClick={() => setShowHelp(!showHelp)}
                    className="p-3 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                    title="Voice Commands Help"
                >
                    <span className="font-bold text-lg">?</span>
                </button>

                <button
                    onClick={toggleListening}
                    className={`p-4 rounded-full shadow-xl transition-all duration-300 transform hover:scale-105 ${isListening
                        ? 'bg-red-500 text-white animate-pulse ring-4 ring-red-200'
                        : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:shadow-emerald-500/30'
                        }`}
                >
                    {isListening ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
                </button>
            </div>
        </div>
    );
}
