import React, { useState } from 'react';
import { Book, PlayCircle, FileText, CheckCircle, HelpCircle, ChevronDown, ChevronRight, Award } from 'lucide-react';

interface Resource {
  type: string;
  title: string;
  url: string;
}

interface Topic {
  topic_name: string;
  difficulty: string;
  subtopics: string[];
  resources: Resource[];
}

interface Module {
  module_title: string;
  description: string;
  topics: Topic[];
}

interface Course {
  course_name: string;
  difficulty: string;
  estimated_duration: string;
  modules: Module[];
}

interface Question {
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
  difficulty: string;
}

interface MockTest {
  test_name: string;
  questions: Question[];
}

interface PipelineResponse {
  id?: string;
  status: string;
  data: {
     course?: Course;
     mock_test?: MockTest;
  };
  cached?: boolean;
  warning?: string;
  meta?: {
     generation_time?: string;
     retry_count?: number;
  };
}

interface UnifiedLearningViewProps {
  pipelineResponse: PipelineResponse | null;
  onRegenerate?: () => void;
}

const UnifiedLearningView: React.FC<UnifiedLearningViewProps> = ({ pipelineResponse, onRegenerate }) => {
  const course = pipelineResponse?.data?.course;
  const mockTest = pipelineResponse?.data?.mock_test;
  const meta = pipelineResponse?.meta;
  const isCached = pipelineResponse?.cached;
  const warnings = pipelineResponse?.warning ? pipelineResponse.warning.split(' | ') : [];

  // 🧠 Visual Intelligence: Confidence & Health Logic
  const retryCount = meta?.retry_count || 0;
  const hasWarnings = warnings.length > 0;
  const confidenceScore = Math.max(0, 100 - (retryCount * 15) - (hasWarnings ? 15 : 0));
  
  const getHealthStatus = () => {
    if (pipelineResponse?.status === 'error') return { label: 'CRITICAL', color: 'bg-red-500', text: 'text-red-600' };
    if (hasWarnings || confidenceScore < 85) return { label: 'DEGRADED', color: 'bg-yellow-500', text: 'text-yellow-600' };
    return { label: 'HEALTHY', color: 'bg-green-500', text: 'text-green-600' };
  };
  const health = getHealthStatus();
  const [expandedModules, setExpandedModules] = useState<Record<number, boolean>>({ 0: true });
  const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>({});
  
  // Mock Test State
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);

  const toggleModule = (index: number) => {
    setExpandedModules(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const toggleTopic = (mIndex: number, tIndex: number) => {
    const key = `${mIndex}-${tIndex}`;
    setExpandedTopics(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleAnswer = (qIndex: number, answer: string) => {
    if (!showResults) {
      setUserAnswers(prev => ({ ...prev, [qIndex]: answer }));
    }
  };

  const calculateScore = () => {
    if (!mockTest?.questions) return 0;
    let score = 0;
    mockTest.questions.forEach((q, i) => {
      if (userAnswers[i] === q.correct_answer) score++;
    });
    return score;
  };

  // Learning Progress State
  const [completedItems, setCompletedItems] = useState<Record<string, boolean>>({});
  const [showConfidenceExpl, setShowConfidenceExpl] = useState(false);
  
  const totalItems = course?.modules.reduce((acc, m) => acc + m.topics.length, 0) || 0;
  const completedCount = Object.values(completedItems).filter(v => v).length;
  const progressPercent = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;

  const toggleItemCompletion = (key: string) => {
    setCompletedItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCopyCourse = () => {
    if (!pipelineResponse) return;
    const textToCopy = JSON.stringify(pipelineResponse.data, null, 2);
    navigator.clipboard.writeText(textToCopy);
    alert('Course details copied to clipboard!');
  };

  const handleDownloadJson = () => {
    if (!pipelineResponse) return;
    const jsonString = JSON.stringify(pipelineResponse, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `curriculum-${pipelineResponse.id || 'export'}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 w-full">
      {/* Analytics Dashboard Header */}
      {pipelineResponse && (
         <div className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-wrap items-center justify-between shadow-xl ring-1 ring-black/5 animate-in zoom-in-95 duration-500">
            <div className="flex items-center space-x-6">
              {/* Health Indicator */}
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">System Health</span>
                <div className="flex items-center space-x-2">
                   <div className={`w-3 h-3 rounded-full ${health.color} animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.4)]`}></div>
                   <span className={`text-sm font-black ${health.text}`}>{health.label}</span>
                </div>
              </div>

            {/* Confidence Score */}
              <div className="hidden sm:flex flex-col border-l border-gray-100 pl-6 relative">
                <div className="flex items-center space-x-1 mb-1">
                   <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">AI Confidence</span>
                   <button 
                     onMouseEnter={() => setShowConfidenceExpl(true)}
                     onMouseLeave={() => setShowConfidenceExpl(false)}
                     className="text-gray-300 hover:text-indigo-400 transition"
                   >
                      <HelpCircle className="w-3 h-3" />
                   </button>
                </div>
                <div className="flex items-center space-x-2">
                   <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500" style={{ width: `${confidenceScore}%` }}></div>
                   </div>
                   <span className="text-sm font-bold text-blue-600">{confidenceScore}%</span>
                </div>
                
                {showConfidenceExpl && (
                   <div className="absolute top-12 left-6 z-50 w-48 p-3 bg-slate-900 text-[10px] text-indigo-100 rounded-xl shadow-2xl border border-white/10 animate-in fade-in zoom-in-95 duration-200">
                      <div className="font-bold mb-1 border-b border-white/10 pb-1">Confidence Calculation</div>
                      <div>Base: 100%</div>
                      <div>-15% per agent retry ({retryCount})</div>
                      <div>-15% if heuristic warnings present</div>
                      <div className="mt-1 text-yellow-400 italic">Total: {confidenceScore}% accuracy projection.</div>
                   </div>
                )}
              </div>

              {/* Course Completion Progress */}
              <div className="hidden md:flex flex-col border-l border-gray-100 pl-6">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Material Mastery</span>
                <div className="flex items-center space-x-2">
                   <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500" style={{ width: `${progressPercent}%` }}></div>
                   </div>
                   <span className="text-sm font-bold text-green-600">{progressPercent}%</span>
                </div>
              </div>

              {/* Cached Indicator */}
              {isCached && (
                <div className="flex flex-col border-l border-gray-100 pl-6">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Retrieval</span>
                  <span className="flex items-center text-xs font-bold text-green-600">
                     <Zap className="w-3 h-3 mr-1 fill-green-600" /> Instant
                  </span>
                </div>
              )}
              
              {meta?.generation_time && (
                <div className="flex flex-col border-l border-gray-100 pl-6">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Latency</span>
                  <span className="text-sm font-bold text-gray-700">{meta.generation_time}</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-2 mt-4 lg:mt-0">
               {course && <span className="flex items-center text-[10px] font-black uppercase tracking-tight bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg border border-blue-100 shadow-sm"><CheckCircle className="w-3 h-3 mr-1" /> Course Sync</span>}
               {mockTest && <span className="flex items-center text-[10px] font-black uppercase tracking-tight bg-purple-50 text-purple-700 px-3 py-1.5 rounded-lg border border-purple-100 shadow-sm"><Award className="w-3 h-3 mr-1" /> Quiz Engine</span>}
            </div>

            {hasWarnings && (
               <div className="mt-4 flex items-start p-3 bg-amber-50 text-amber-800 text-xs rounded-xl border border-amber-100 w-full animate-in slide-in-from-left-4">
                 <HelpCircle className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5 text-amber-600" />
                 <div>
                   <span className="font-bold">Heuristic Warnings: </span>
                   {pipelineResponse.warning}
                 </div>
               </div>
            )}
         </div>
      )}

      {/* Course Section */}
      {course && course?.modules?.length > 0 && (
        <div className="bg-white rounded-xl shadow-md border overflow-hidden">
          <div className="border-b bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
            <h2 className="text-2xl font-bold">{course.course_name}</h2>
            <div className="flex space-x-4 mt-2 opacity-90">
              <span className="text-sm border border-blue-300 rounded px-2 py-1">Mode: {course.difficulty}</span>
              <span className="text-sm border border-blue-300 rounded px-2 py-1">Est. Duration: {course.estimated_duration}</span>
            </div>
          </div>
          
          <div className="p-4 space-y-4">
            {course.modules?.map((module, mIndex) => (
              <div key={mIndex} className="border rounded-lg overflow-hidden shadow-sm">
                <button 
                  onClick={() => toggleModule(mIndex)}
                  className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition"
                >
                  <div className="flex items-center space-x-3 text-left">
                    {expandedModules[mIndex] ? <ChevronDown className="h-5 w-5 text-gray-500" /> : <ChevronRight className="h-5 w-5 text-gray-500" />}
                    <div>
                      <h3 className="font-bold text-gray-800">Module {mIndex + 1}: {module.module_title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{module.description}</p>
                    </div>
                  </div>
                </button>
                
                {expandedModules[mIndex] && module.topics?.length > 0 && (
                  <div className="p-4 bg-white border-t space-y-3">
                    {module.topics?.map((topic, tIndex) => {
                      const tKey = `${mIndex}-${tIndex}`;
                      return (
                        <div key={tIndex} className="border border-gray-100 rounded-md">
                           <button 
                            onClick={() => toggleTopic(mIndex, tIndex)}
                            className="w-full flex items-center justify-between p-3 hover:bg-blue-50 transition"
                           >
                            <div className="flex items-center space-x-3">
                                  <input 
                                    type="checkbox" 
                                    checked={!!completedItems[tKey]}
                                    onChange={() => toggleItemCompletion(tKey)}
                                    className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                  <div className="flex items-center space-x-2">
                                     <Book className="h-4 w-4 text-blue-500" />
                                     <h4 className={`font-semibold transition-colors ${completedItems[tKey] ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                                       {topic.topic_name}
                                     </h4>
                                  </div>
                               </div>
                               {expandedTopics[tKey] ? <ChevronDown className="h-4 w-4 text-gray-400" /> : <ChevronRight className="h-4 w-4 text-gray-400" />}
                            </button>
                           
                           {expandedTopics[tKey] && (
                             <div className="p-4 bg-gray-50 border-t">
                               {/* Subtopics */}
                               {topic?.subtopics?.length > 0 && (
                                 <div className="mb-4">
                                   <div className="text-sm font-semibold text-gray-600 mb-2">Key Concepts:</div>
                                   <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                     {topic.subtopics.map((sub, sIndex) => (
                                       <li key={sIndex} className="flex items-center space-x-2 text-sm text-gray-600">
                                          <div className="h-1.5 w-1.5 bg-blue-400 rounded-full"></div>
                                          <span>{sub}</span>
                                       </li>
                                     ))}
                                   </ul>
                                 </div>
                               )}
                               
                               {/* Resources */}
                               {topic?.resources?.length > 0 && (
                                 <div>
                                   <div className="text-sm font-semibold text-gray-600 mb-2">Learning Resources:</div>
                                   <div className="space-y-2">
                                     {topic.resources.map((res, rIndex) => (
                                       <a 
                                          key={rIndex} 
                                          href={res.url} 
                                          target="_blank" 
                                          rel="noreferrer"
                                          className="flex items-center space-x-2 p-2 bg-white border rounded hover:border-blue-400 hover:shadow-sm transition"
                                       >
                                         {res.type.toLowerCase() === 'video' ? <PlayCircle className="h-4 w-4 text-red-500"/> : <FileText className="h-4 w-4 text-blue-500"/>}
                                         <span className="text-sm text-blue-600 hover:underline">{res.title}</span>
                                       </a>
                                     ))}
                                   </div>
                                 </div>
                               )}
                             </div>
                           )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mock Test Section */}
      {mockTest && mockTest.questions && mockTest.questions.length > 0 && (
        <div id="mock-quiz-section" className="bg-white rounded-xl shadow-md border overflow-hidden">
          <div className="border-b bg-gray-800 p-6 text-white flex items-center justify-between">
            <div className="flex flex-col">
              <h2 className="text-2xl font-bold flex items-center">
                <Target className="h-6 w-6 mr-3 text-purple-400" />
                Knowledge Verification
              </h2>
              <span className="text-[10px] text-gray-400 uppercase tracking-widest font-black mt-1">Assessment Engine Active</span>
            </div>
            <div className="bg-white/10 px-4 py-2 rounded-full border border-white/10 text-xs font-bold">
               {mockTest.questions.length} Items
            </div>
          </div>
          
          <div className="p-6 space-y-8">
            {mockTest.questions.map((q, qIndex) => (
              <div key={qIndex} className="bg-gray-50 rounded-lg p-5 border">
                <div className="font-semibold text-lg text-gray-800 mb-4 flex items-start">
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-3 mt-1">Q{qIndex + 1}</span>
                  {q.question}
                </div>
                
                <div className="space-y-2 pl-10">
                  {q.options?.map((opt, oIndex) => {
                    const isSelected = userAnswers[qIndex] === opt;
                    const isCorrect = showResults && opt === q.correct_answer;
                    const isWrongSelection = showResults && isSelected && opt !== q.correct_answer;
                    
                    let bgClass = "bg-white hover:bg-gray-50 border-gray-200 cursor-pointer";
                    if (showResults) {
                       bgClass = "bg-white border-gray-200 opacity-70 cursor-not-allowed";
                       if (isCorrect) bgClass = "bg-green-50 border-green-400 text-green-800 font-medium";
                       if (isWrongSelection) bgClass = "bg-red-50 border-red-400 text-red-800 text-decoration-line-through";
                    } else if (isSelected) {
                       bgClass = "bg-blue-50 border-blue-400 text-blue-800";
                    }

                    return (
                      <div 
                        key={oIndex}
                        onClick={() => handleAnswer(qIndex, opt)}
                        className={`p-3 border rounded-lg transition-colors ${bgClass} flex items-center`}
                      >
                        <div className={`w-4 h-4 rounded-full border flex-shrink-0 mr-3 flex items-center justify-center
                           ${isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}
                           ${isCorrect ? '!bg-green-500 !border-green-500' : ''}
                           ${isWrongSelection ? '!bg-red-500 !border-red-500' : ''}
                        `}>
                           {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                        </div>
                        {opt}
                      </div>
                    )
                  })}
                </div>
                
                {showResults && (
                  <div className={`mt-4 p-4 rounded-lg text-sm border pl-10 ${userAnswers[qIndex] === q.correct_answer ? 'bg-green-50 border-green-200 text-green-800' : 'bg-yellow-50 border-yellow-200 text-yellow-800'}`}>
                    <div className="flex items-start">
                      <HelpCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">Explanation: </span>
                        {q.explanation}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            <div className="flex justify-center mt-8 pt-4 border-t">
              {!showResults ? (
                <button 
                  onClick={() => setShowResults(true)}
                  disabled={Object.keys(userAnswers).length !== mockTest.questions.length}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit Answers
                </button>
              ) : (
                <button 
                  onClick={() => {
                     setShowResults(false);
                     setUserAnswers({});
                  }}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-8 rounded-lg shadow-md transition"
                >
                  Retake Test
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Deep Recall Engagement Loop */}
      {pipelineResponse && (
         <div className="bg-white border-2 border-dashed border-indigo-200 rounded-3xl p-8 flex flex-col items-center text-center animate-in slide-in-from-bottom-8 duration-1000">
            <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
               <Lightbulb className="w-6 h-6 text-indigo-500 animate-bounce" />
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2">Investor-Grade Engagement: Deep Recall</h3>
            <p className="text-sm text-gray-500 max-w-sm mb-6">
               Research shows immediate recall increases retention by 40%. Ready for your first micro-challenge?
            </p>
            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 w-full max-w-md">
               <div className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-3 text-left">Quick Question</div>
               <div className="text-sm font-bold text-gray-800 text-left mb-4">
                  Which fundamental concept of {course?.course_name || 'this topic'} are you most excited to master first?
               </div>
               <div className="grid grid-cols-1 gap-2">
                  <button className="p-3 bg-white border border-gray-100 rounded-xl text-xs font-bold text-gray-600 hover:border-indigo-500 hover:text-indigo-600 transition text-left">
                     The theoretical foundations
                  </button>
                  <button className="p-3 bg-white border border-gray-100 rounded-xl text-xs font-bold text-gray-600 hover:border-indigo-500 hover:text-indigo-600 transition text-left">
                     Practical implementation details
                  </button>
               </div>
            </div>
         </div>
      )}

      {/* Smart Actions Section */}

      {pipelineResponse && (
         <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
               <Sparkles className="w-32 h-32" />
            </div>
            
            <div className="relative z-10">
               <h3 className="text-2xl font-black mb-2 flex items-center">
                  <Lightbulb className="w-6 h-6 mr-3 text-yellow-400" />
                  What's your next move?
               </h3>
               <p className="text-indigo-200 mb-8 max-w-lg">
                  The AI has identified several high-impact actions to accelerate your learning journey. Choose one to continue.
               </p>
               
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button 
                    onClick={() => document.getElementById('mock-quiz-section')?.scrollIntoView({ behavior: 'smooth' })}
                    className="flex flex-col items-start p-4 bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl transition group/btn text-left"
                  >
                     <Award className="w-6 h-6 mb-3 text-purple-400 group-hover/btn:scale-110 transition" />
                     <span className="font-bold text-sm">Take Verification Quiz</span>
                     <span className="text-[10px] text-indigo-300 mt-1 uppercase">Measure your baseline</span>
                  </button>
                  
                  <button 
                    onClick={onRegenerate}
                    className="flex flex-col items-start p-4 bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl transition group/btn text-left"
                  >
                     <Zap className="w-6 h-6 mb-3 text-yellow-400 group-hover/btn:scale-110 transition" />
                     <span className="font-bold text-sm">Regenerate Advanced</span>
                     <span className="text-[10px] text-indigo-300 mt-1 uppercase">Push your boundaries</span>
                  </button>
                  
                  <button 
                    onClick={() => window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(course?.course_name || 'Learning')}+best+tutorials`, '_blank')}
                    className="flex flex-col items-start p-4 bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl transition group/btn text-left"
                  >
                     <Youtube className="w-6 h-6 mb-3 text-red-400 group-hover/btn:scale-110 transition" />
                     <span className="font-bold text-sm">Explore Video Vault</span>
                     <span className="text-[10px] text-indigo-300 mt-1 uppercase">Visual saturation</span>
                  </button>
               </div>
            </div>
         </div>
      )}

      {/* Feedback & Actions */}
      {pipelineResponse && (
         <div className="flex flex-col sm:flex-row items-center justify-between p-6 bg-white border border-gray-100 rounded-2xl shadow-sm gap-6">
           <div className="flex items-center space-x-4">
             <div className="flex items-center -space-x-2">
                {[1, 2, 3].map(i => (
                   <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center overflow-hidden">
                      <Users className="w-4 h-4 text-gray-400" />
                   </div>
                ))}
             </div>
             <div>
                <span className="block text-sm font-bold text-gray-800 tracking-tight">Was this helpful?</span>
                <span className="text-[10px] text-gray-400 uppercase font-black">Help us improve the LLM responses</span>
             </div>
             <div className="flex space-x-2">
               <button className="px-4 py-2 bg-gray-50 hover:bg-green-100 text-gray-600 hover:text-green-600 rounded-xl border border-gray-100 transition font-bold text-sm">
                  👍 
               </button>
               <button className="px-4 py-2 bg-gray-50 hover:bg-red-100 text-gray-600 hover:text-red-600 rounded-xl border border-gray-100 transition font-bold text-sm">
                  👎
               </button>
             </div>
           </div>
           
           <div className="flex items-center flex-wrap gap-3">
             <button 
               onClick={handleCopyCourse}
               className="p-3 bg-white text-gray-500 hover:text-gray-900 border border-gray-200 font-bold rounded-xl shadow-sm hover:bg-gray-50 transition text-xs"
               title="Copy to Clipboard"
             >
               <FileText className="w-4 h-4" />
             </button>
             <button 
               onClick={handleDownloadJson}
               className="px-5 py-3 bg-white text-gray-700 border border-gray-200 font-bold rounded-xl shadow-sm hover:bg-gray-50 transition text-xs"
             >
               Download JSON
             </button>
             <button 
               onClick={onRegenerate}
               className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl shadow-[0_4px_12px_rgba(79,70,229,0.3)] transition transform hover:-translate-y-0.5"
             >
               Regenerate Pipeline
             </button>
           </div>
         </div>
      )}
    </div>
  );
};

export default UnifiedLearningView;
