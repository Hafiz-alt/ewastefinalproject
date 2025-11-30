import React, { useState } from 'react';
import { Search, Sparkles, AlertTriangle, CheckCircle, Smartphone, Cpu, Battery, Wifi } from 'lucide-react';

export default function AIDiagnostics() {
    const [symptoms, setSymptoms] = useState('');
    const [analyzing, setAnalyzing] = useState(false);
    const [diagnosis, setDiagnosis] = useState(null);

    const handleAnalyze = () => {
        if (!symptoms.trim()) return;

        setAnalyzing(true);
        setDiagnosis(null);

        // Simulate AI analysis
        setTimeout(() => {
            setDiagnosis(generateMockDiagnosis(symptoms));
            setAnalyzing(false);
        }, 1500);
    };

    const generateMockDiagnosis = (text) => {
        const lowerText = text.toLowerCase();

        if (lowerText.includes('screen') || lowerText.includes('cracked') || lowerText.includes('display')) {
            return {
                issue: 'Display Panel Damage',
                confidence: 92,
                severity: 'medium',
                steps: [
                    'Inspect display connector for loose connection',
                    'Check for physical damage to the LCD/OLED panel',
                    'Test touch digitizer responsiveness',
                    'Replace screen assembly if physical damage is confirmed'
                ],
                parts: ['LCD Assembly', 'Adhesive Strips'],
                estimatedTime: '45-60 mins'
            };
        } else if (lowerText.includes('battery') || lowerText.includes('charge') || lowerText.includes('power')) {
            return {
                issue: 'Battery Degradation / Charging Port Failure',
                confidence: 88,
                severity: 'low',
                steps: [
                    'Check battery health cycle count',
                    'Inspect charging port for debris or damage',
                    'Test voltage output of the charging brick',
                    'Replace battery if health < 80%'
                ],
                parts: ['Li-ion Battery', 'Charging Port Module'],
                estimatedTime: '30-45 mins'
            };
        } else if (lowerText.includes('water') || lowerText.includes('liquid') || lowerText.includes('spill')) {
            return {
                issue: 'Liquid Damage',
                confidence: 75,
                severity: 'high',
                steps: [
                    'Immediately disconnect power source',
                    'Disassemble and inspect motherboard for corrosion',
                    'Clean affected areas with isopropyl alcohol',
                    'Test individual components for short circuits'
                ],
                parts: ['Motherboard (Potential)', 'Flex Cables'],
                estimatedTime: '2-3 hours'
            };
        } else {
            return {
                issue: 'General Hardware Malfunction',
                confidence: 60,
                severity: 'medium',
                steps: [
                    'Run full system diagnostics',
                    'Check error logs',
                    'Inspect internal connections',
                    'Test with known good components'
                ],
                parts: ['Diagnostic Tools'],
                estimatedTime: '1-2 hours'
            };
        }
    };

    return (
        <div className="h-full flex flex-col max-w-4xl mx-auto">
            <div className="mb-8 text-center">
                <div className="inline-flex items-center justify-center p-3 bg-indigo-100 rounded-full mb-4 shadow-sm">
                    <Sparkles className="h-8 w-8 text-indigo-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900">AI Diagnostic Assistant</h2>
                <p className="text-gray-500 mt-2">Describe the device symptoms and let AI suggest a repair path.</p>
            </div>

            {/* Input Section */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8 transition-all hover:shadow-xl">
                <div className="relative">
                    <textarea
                        value={symptoms}
                        onChange={(e) => setSymptoms(e.target.value)}
                        placeholder="E.g., iPhone 13 screen is flickering and touch is unresponsive..."
                        className="w-full h-32 p-4 pr-12 text-gray-700 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition-all"
                    />
                    <div className="absolute bottom-4 right-4 flex gap-2">
                        <button
                            onClick={handleAnalyze}
                            disabled={analyzing || !symptoms.trim()}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium text-white shadow-lg shadow-indigo-500/30 transition-all transform active:scale-95 ${analyzing || !symptoms.trim()
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-indigo-600 hover:bg-indigo-700 hover:-translate-y-0.5'
                                }`}
                        >
                            {analyzing ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Analyzing...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="h-4 w-4" />
                                    Analyze Symptoms
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Results Section */}
            {diagnosis && (
                <div className="animate-fade-in-up space-y-6">
                    {/* Top Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                            <div className="p-3 bg-red-50 rounded-lg text-red-600">
                                <AlertTriangle className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Likely Issue</p>
                                <p className="font-bold text-gray-900">{diagnosis.issue}</p>
                            </div>
                        </div>

                        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                            <div className="p-3 bg-green-50 rounded-lg text-green-600">
                                <CheckCircle className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Confidence</p>
                                <p className="font-bold text-gray-900">{diagnosis.confidence}% Match</p>
                            </div>
                        </div>

                        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                            <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                                <Clock className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Est. Time</p>
                                <p className="font-bold text-gray-900">{diagnosis.estimatedTime}</p>
                            </div>
                        </div>
                    </div>

                    {/* Detailed Steps & Parts */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50">
                                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                                    <Cpu className="h-5 w-5 text-indigo-500" />
                                    Recommended Steps
                                </h3>
                            </div>
                            <div className="p-6">
                                <ul className="space-y-4">
                                    {diagnosis.steps.map((step, index) => (
                                        <li key={index} className="flex gap-3">
                                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-bold">
                                                {index + 1}
                                            </span>
                                            <span className="text-gray-600 text-sm">{step}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50">
                                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                                    <Battery className="h-5 w-5 text-emerald-500" />
                                    Required Parts
                                </h3>
                            </div>
                            <div className="p-6">
                                <div className="flex flex-wrap gap-2">
                                    {diagnosis.parts.map((part, index) => (
                                        <span key={index} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium border border-gray-200">
                                            {part}
                                        </span>
                                    ))}
                                </div>
                                <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                                    <div className="flex gap-3">
                                        <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
                                        <p className="text-xs text-yellow-800">
                                            Always verify the device model number before ordering parts. Some components may vary by region.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
