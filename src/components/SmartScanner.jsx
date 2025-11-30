import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, RefreshCw, CheckCircle, Loader2 } from 'lucide-react';
import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';

export default function SmartScanner({ onClose, onScanComplete }) {
    const videoRef = useRef(null);
    const [model, setModel] = useState(null);
    const [isScanning, setIsScanning] = useState(false);
    const [predictions, setPredictions] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadModel();
        startCamera();
        return () => {
            stopCamera();
        };
    }, []);

    const loadModel = async () => {
        try {
            console.log('Loading MobileNet model...');
            await tf.ready();
            const loadedModel = await mobilenet.load();
            setModel(loadedModel);
            setLoading(false);
            console.log('Model loaded successfully');
        } catch (err) {
            console.error('Failed to load model:', err);
            setError('Failed to load AI model. Please check your connection.');
            setLoading(false);
        }
    };

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
            setError('Could not access camera. Please allow camera permissions.');
        }
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const tracks = videoRef.current.srcObject.getTracks();
            tracks.forEach(track => track.stop());
        }
    };

    const scanImage = async () => {
        if (!model || !videoRef.current) return;

        setIsScanning(true);
        try {
            const predictions = await model.classify(videoRef.current);
            setPredictions(predictions);

            // Heuristic to map generic object names to e-waste categories
            const eWasteKeywords = ['phone', 'laptop', 'computer', 'keyboard', 'mouse', 'monitor', 'screen', 'electronic', 'device', 'battery', 'cable'];
            const relevantPrediction = predictions.find(p =>
                eWasteKeywords.some(keyword => p.className.toLowerCase().includes(keyword))
            );

            if (relevantPrediction) {
                // Auto-select the best match
                setTimeout(() => {
                    onScanComplete(relevantPrediction.className);
                }, 1500);
            }
        } catch (err) {
            console.error('Prediction error:', err);
            setError('Failed to scan object.');
        } finally {
            setIsScanning(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-2xl relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 p-2 bg-black/50 rounded-full text-white hover:bg-black/70"
                >
                    <X className="h-6 w-6" />
                </button>

                <div className="relative aspect-[3/4] bg-gray-900">
                    {error ? (
                        <div className="absolute inset-0 flex items-center justify-center text-white p-6 text-center">
                            <p>{error}</p>
                        </div>
                    ) : (
                        <>
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className="w-full h-full object-cover"
                            />
                            {loading && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white">
                                    <Loader2 className="h-8 w-8 animate-spin mb-2" />
                                    <p>Loading AI Model...</p>
                                </div>
                            )}
                            {!loading && !predictions.length && (
                                <div className="absolute inset-0 pointer-events-none border-2 border-emerald-500/50 m-8 rounded-lg flex items-center justify-center">
                                    <div className="text-white/80 text-sm bg-black/50 px-3 py-1 rounded-full">
                                        Align object within frame
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                <div className="p-6 bg-white dark:bg-gray-800">
                    {predictions.length > 0 ? (
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Detected Items:</h3>
                            <div className="space-y-2">
                                {predictions.map((p, i) => (
                                    <div key={i} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                        <span className="capitalize text-gray-800 dark:text-gray-200">{p.className}</span>
                                        <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                                            {Math.round(p.probability * 100)}%
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <button
                                onClick={() => setPredictions([])}
                                className="w-full py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center"
                            >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Scan Again
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={scanImage}
                            disabled={loading || error}
                            className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold text-lg hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {isScanning ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                    Scanning...
                                </>
                            ) : (
                                <>
                                    <Camera className="h-5 w-5 mr-2" />
                                    Identify Item
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
