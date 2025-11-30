import React, { useRef, useEffect, useState } from 'react';
import { X, Wrench, ArrowRight, CheckCircle } from 'lucide-react';

export default function ARRepairGuide({ onClose, deviceType = 'laptop' }) {
    const videoRef = useRef(null);
    const [step, setStep] = useState(0);

    const repairSteps = {
        laptop: [
            { text: "Locate the 6 screws on the back panel", position: { top: '20%', left: '20%' } },
            { text: "Use a Phillips #0 screwdriver to remove them", position: { top: '50%', left: '50%' } },
            { text: "Gently pry open the case starting from the hinge", position: { top: '80%', left: '50%' } },
            { text: "Disconnect the battery connector first!", position: { top: '40%', left: '60%' } }
        ],
        phone: [
            { text: "Heat the edges to soften the adhesive", position: { top: '10%', left: '50%' } },
            { text: "Use a suction cup to lift the screen", position: { top: '50%', left: '50%' } },
            { text: "Insert a pick to slice through the adhesive", position: { top: '80%', left: '50%' } }
        ]
    };

    const currentSteps = repairSteps[deviceType] || repairSteps['laptop'];

    useEffect(() => {
        startCamera();
        return () => stopCamera();
    }, []);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error('Error accessing camera:', err);
        }
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const tracks = videoRef.current.srcObject.getTracks();
            tracks.forEach(track => track.stop());
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black">
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover opacity-80"
            />

            {/* AR Overlay UI */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Header */}
                <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent pointer-events-auto">
                    <div className="flex justify-between items-center text-white">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-emerald-500/20 rounded-lg backdrop-blur-md">
                                <Wrench className="h-5 w-5 text-emerald-400" />
                            </div>
                            <div>
                                <h3 className="font-bold">AR Repair Assistant</h3>
                                <p className="text-xs text-gray-300">Step {step + 1} of {currentSteps.length}</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 bg-white/10 rounded-full hover:bg-white/20">
                            <X className="h-6 w-6" />
                        </button>
                    </div>
                </div>

                {/* AR Markers (Simulated) */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative w-64 h-64 border-2 border-dashed border-emerald-400/50 rounded-xl animate-pulse">
                        <div className="absolute -top-12 left-0 right-0 bg-emerald-600 text-white text-sm p-3 rounded-lg shadow-lg text-center animate-bounce">
                            {currentSteps[step].text}
                            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-emerald-600"></div>
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 to-transparent pointer-events-auto">
                    <div className="flex justify-between items-center gap-4">
                        <button
                            onClick={() => setStep(Math.max(0, step - 1))}
                            disabled={step === 0}
                            className="px-6 py-3 rounded-xl bg-white/10 text-white backdrop-blur-md disabled:opacity-30"
                        >
                            Back
                        </button>

                        {step < currentSteps.length - 1 ? (
                            <button
                                onClick={() => setStep(step + 1)}
                                className="flex-1 px-6 py-3 rounded-xl bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2"
                            >
                                Next Step <ArrowRight className="h-5 w-5" />
                            </button>
                        ) : (
                            <button
                                onClick={onClose}
                                className="flex-1 px-6 py-3 rounded-xl bg-green-500 text-white font-bold shadow-lg shadow-green-500/30 flex items-center justify-center gap-2"
                            >
                                Complete <CheckCircle className="h-5 w-5" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
