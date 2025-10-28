
import React, { useState, useCallback } from 'react';
import { generateResume, answerQuestion } from './services/geminiService';
import { DEFAULT_GUIDELINES, DEFAULT_JOB_DESC, DEFAULT_RAW_EXP } from './constants';
import { SparklesIcon, ClipboardIcon, CheckIcon, PaperAirplaneIcon, BotIcon } from './components/icons';

// --- Reusable UI Components ---

interface CustomTextAreaProps {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  rows: number;
  placeholder: string;
}

const CustomTextArea: React.FC<CustomTextAreaProps> = ({ id, label, value, onChange, rows, placeholder }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-indigo-300 mb-2">
      {label}
    </label>
    <textarea
      id={id}
      value={value}
      onChange={onChange}
      rows={rows}
      placeholder={placeholder}
      className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow duration-200 resize-y"
    />
  </div>
);

interface CopyButtonProps {
    textToCopy: string;
}

const CopyButton: React.FC<CopyButtonProps> = ({ textToCopy }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(textToCopy).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <button
            onClick={handleCopy}
            className="absolute top-4 right-4 p-2 bg-gray-700 hover:bg-indigo-600 rounded-lg text-gray-300 hover:text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Copy to clipboard"
        >
            {copied ? <CheckIcon className="w-5 h-5 text-green-400" /> : <ClipboardIcon className="w-5 h-5" />}
        </button>
    );
};


// --- Main App Component ---

export default function App() {
  const [rawExperience, setRawExperience] = useState<string>(DEFAULT_RAW_EXP);
  const [jobDescription, setJobDescription] = useState<string>(DEFAULT_JOB_DESC);
  const [generatedResume, setGeneratedResume] = useState<string>('');
  
  const [question, setQuestion] = useState<string>('');
  const [answer, setAnswer] = useState<string>('');

  const [isLoadingResume, setIsLoadingResume] = useState<boolean>(false);
  const [isLoadingAnswer, setIsLoadingAnswer] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleGenerateResume = useCallback(async () => {
    if (!rawExperience || !jobDescription) {
      setError('Please provide your experience and the job description.');
      return;
    }
    setIsLoadingResume(true);
    setError('');
    setGeneratedResume('');

    try {
      const resume = await generateResume(rawExperience, jobDescription, DEFAULT_GUIDELINES);
      setGeneratedResume(resume);
    } catch (err) {
      setError('Failed to generate resume. Please check your API key and try again.');
      console.error(err);
    } finally {
      setIsLoadingResume(false);
    }
  }, [rawExperience, jobDescription]);

  const handleAskQuestion = useCallback(async () => {
    if (!question) return;
    setIsLoadingAnswer(true);
    setAnswer('');
    setError('');

    try {
      const result = await answerQuestion(question, rawExperience, jobDescription);
      setAnswer(result);
    } catch (err) {
      setError('Failed to get an answer. Please check your API key and try again.');
      console.error(err);
    } finally {
      setIsLoadingAnswer(false);
    }
  }, [question, rawExperience, jobDescription]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans p-4 sm:p-6 lg:p-8">
      <main className="max-w-7xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">
            LatexME - ATS-Optimized Resume Builder
          </h1>
          <p className="mt-2 text-lg text-gray-400">Craft the perfect resume with the power of AI</p>
        </header>

        {error && <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg mb-6 text-center">{error}</div>}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Input Section */}
          <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700 space-y-6 flex flex-col">
            <h2 className="text-2xl font-bold text-white mb-2">Your Details</h2>
            <CustomTextArea id="rawExperience" label="1. Your Raw Experience or Current Resume" value={rawExperience} onChange={(e) => setRawExperience(e.target.value)} rows={16} placeholder="Copy and paste your entire current resume here. Don't worry about formatting; the AI will handle it." />
            <CustomTextArea id="jobDescription" label="2. Target Job Description" value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} rows={16} placeholder="Copy and paste the full job description here for the AI to analyze." />
            <button
              onClick={handleGenerateResume}
              disabled={isLoadingResume}
              className="mt-auto w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-900/50 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg shadow-indigo-900/50"
            >
              {isLoadingResume ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Crafting...</span>
                </>
              ) : (
                <>
                  <SparklesIcon className="w-6 h-6" />
                  Generate Overleaf-Ready Resume
                </>
              )}
            </button>
          </div>

          {/* Output Section */}
          <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700 relative">
            <h2 className="text-2xl font-bold text-white mb-4">Generated Overleaf-Ready LaTeX</h2>
            <div className="h-[calc(100%-4rem)] bg-gray-800 p-4 rounded-lg overflow-y-auto text-gray-300 whitespace-pre-wrap font-mono text-sm leading-relaxed">
              {isLoadingResume ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-400">Generating your Overleaf-ready resume...</p>
                </div>
              ) : generatedResume ? (
                generatedResume
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">Your AI-generated, Overleaf-ready LaTeX code will appear here.</p>
                </div>
              )}
            </div>
            {generatedResume && !isLoadingResume && <CopyButton textToCopy={generatedResume} />}
          </div>
        </div>

        {/* Q&A Section */}
        <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-4">Resume & Job Q&A</h2>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAskQuestion()}
              placeholder="Ask about your resume vs. the job (e.g., 'How can I improve my chances?')"
              className="flex-grow p-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow duration-200"
            />
            <button
              onClick={handleAskQuestion}
              disabled={isLoadingAnswer}
              className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-900/50 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300"
            >
              {isLoadingAnswer ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <PaperAirplaneIcon className="w-5 h-5" />
              )}
              <span>Ask</span>
            </button>
          </div>
          { (isLoadingAnswer || answer) &&
            <div className="bg-gray-800 p-4 rounded-lg">
                {isLoadingAnswer ? (
                    <p className="text-gray-400">Thinking...</p>
                ) : (
                    <div className="flex items-start gap-3">
                      <BotIcon className="w-6 h-6 text-purple-400 flex-shrink-0 mt-1" />
                      <p className="text-gray-300">{answer}</p>
                    </div>
                )}
            </div>
          }
        </div>
      </main>
    </div>
  );
}
