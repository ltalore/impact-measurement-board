import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { PriorityAreaBoard } from './components/PriorityAreaBoard';
import { Target, ChevronRight, Download, Upload, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info.tsx';

export interface Comment {
  id: string;
  author: string;
  text: string;
  timestamp: string;
}

export interface Response {
  id: string;
  author: string;
  timestamp: string;
  content: string;
  questionId: number;
  areaId: number;
  comments: Comment[];
}

export interface PriorityArea {
  id: number;
  title: string;
  description: string;
  color: string;
}

const priorityAreas: PriorityArea[] = [
  {
    id: 1,
    title: "Priority Area 1: Win Proactive Ballot Measures",
    description: "Win proactive ballot measures that secure policy victories and grow local leadership and infrastructure, leaving it stronger to protect wins and build community power to organize future change.",
    color: "indigo"
  },
  {
    id: 2,
    title: "Priority Area 2: Defend and Expand Direct Democracy",
    description: "Defend, protect, and expand direct democracy while resisting authoritarian threats, safeguarding the ballot measure process, and advancing reforms that make direct democracy more accessible, inclusive, and effective for communities.",
    color: "purple"
  },
  {
    id: 3,
    title: "Priority Area 3: Strengthen the Ballot Measure Ecosystem",
    description: "Strengthen, unify, and align the ballot measure ecosystem by championing the power of direct democracy and embedding the BISC Gold Standard as the field's guiding approach to running ballot measures.",
    color: "blue"
  },
  {
    id: 4,
    title: "Priority Area 4: Expand Public Understanding",
    description: "Expand public understanding of ballot measures as a driver of a thriving democracy, empowering more people to see themselves as agents of change in their communities.",
    color: "emerald"
  },
  {
    id: 5,
    title: "Priority Area 5: Increase Wins Through Sustained Funding",
    description: "There are increased wins in ballot measures due to early and sustained funding throughout the ballot measure lifecycle, allowing communities to wield power and build readiness for future wins.",
    color: "amber"
  },
  {
    id: 6,
    title: "Priority Area 6: Build Sustainable Organization",
    description: "BISC is a sustainable and equitable organization that doubles down on its rigor and responsiveness, ensuring that we have the support, organizational strength, and excellence needed to succeed in our work.",
    color: "rose"
  }
];

// Create Supabase client (singleton to avoid multiple instances)
let supabaseClient: ReturnType<typeof createClient> | null = null;
const getSupabaseClient = () => {
  if (!supabaseClient) {
    const supabaseUrl = `https://${projectId}.supabase.co`;
    supabaseClient = createClient(supabaseUrl, publicAnonKey);
  }
  return supabaseClient;
};

export default function App() {
  const [selectedAreaId, setSelectedAreaId] = useState(1);
  const [allResponses, setAllResponses] = useState<Response[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [pollInterval, setPollInterval] = useState<NodeJS.Timeout | null>(null);

  const selectedArea = priorityAreas.find(area => area.id === selectedAreaId) || priorityAreas[0];
  const supabase = getSupabaseClient();

  // Fetch responses from Supabase database
  const fetchResponses = async (silent = false) => {
    try {
      if (!silent) console.log('Checking database connection...');
      
      // Query the kv_store_a7563e12 table directly
      const { data, error } = await supabase
        .from('kv_store_a7563e12')
        .select('value')
        .eq('key', 'responses')
        .single();

      if (error) {
        // If no data exists yet OR table doesn't exist, work in offline mode
        if (error.code === 'PGRST116' || error.code === 'PGRST205') {
          if (!silent) console.log('Working in offline mode (database not set up)');
          
          // Load from localStorage
          const savedData = localStorage.getItem('impact_measurement_responses');
          if (savedData) {
            try {
              setAllResponses(JSON.parse(savedData));
            } catch (e) {
              setAllResponses([]);
            }
          } else {
            setAllResponses([]);
          }
          
          setIsOnline(false);
          setSyncError(null); // Don't show error in offline mode
          setLastSync(null);
          
          // Stop polling when offline to prevent repeated errors
          if (pollInterval) {
            clearInterval(pollInterval);
            setPollInterval(null);
          }
        } else {
          throw error;
        }
      } else {
        const responses = data?.value || [];
        if (!silent) console.log('Connected to database, syncing...');
        setAllResponses(responses);
        setIsOnline(true);
        setSyncError(null);
        setLastSync(new Date());
        // Backup to localStorage
        localStorage.setItem('impact_measurement_responses', JSON.stringify(responses));
      }
    } catch (error) {
      if (!silent) console.log('Connection failed, working offline');
      setIsOnline(false);
      setSyncError(null); // Don't show error in offline mode
      
      // Load from localStorage as fallback
      const savedData = localStorage.getItem('impact_measurement_responses');
      if (savedData) {
        try {
          setAllResponses(JSON.parse(savedData));
        } catch (e) {
          console.error('Error loading from localStorage:', e);
        }
      }
      
      // Stop polling when offline
      if (pollInterval) {
        clearInterval(pollInterval);
        setPollInterval(null);
      }
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchResponses();
  }, []);

  // Poll for updates every 3 seconds for real-time sync
  useEffect(() => {
    const interval = setInterval(() => {
      fetchResponses(true);
    }, 3000);

    setPollInterval(interval);

    return () => clearInterval(interval);
  }, []);

  const handleAddResponse = async (areaId: number, questionId: number, response: { author: string; content: string }) => {
    const newResponse: Response = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      areaId,
      questionId,
      author: response.author.trim(),
      content: response.content.trim(),
      timestamp: new Date().toISOString(),
      comments: [],
    };

    const updatedResponses = [...allResponses, newResponse];

    // Always update local state and localStorage immediately
    setAllResponses(updatedResponses);
    localStorage.setItem('impact_measurement_responses', JSON.stringify(updatedResponses));

    // Try to sync with Supabase if online
    try {
      const { error } = await supabase
        .from('kv_store_a7563e12')
        .upsert({ 
          key: 'responses', 
          value: updatedResponses 
        });

      if (error) {
        // If it's a table doesn't exist error, just work offline
        if (error.code !== 'PGRST205') {
          throw error;
        } else {
          console.log('Working in offline mode - response saved locally');
        }
      } else {
        setIsOnline(true);
        setSyncError(null);
        console.log('Response synced to database');
      }
    } catch (error) {
      console.error('Error syncing response:', error);
      // Don't show error to user if offline mode is working
      console.log('Response saved locally only');
    }
  };

  const handleAddComment = async (responseId: string, comment: { author: string; text: string }) => {
    const newComment = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      author: comment.author.trim(),
      text: comment.text.trim(),
      timestamp: new Date().toISOString(),
    };
    
    const updatedResponses = allResponses.map(response => {
      if (response.id === responseId) {
        return {
          ...response,
          comments: [...response.comments, newComment],
        };
      }
      return response;
    });

    // Always update local state and localStorage immediately
    setAllResponses(updatedResponses);
    localStorage.setItem('impact_measurement_responses', JSON.stringify(updatedResponses));

    // Try to sync with Supabase if online
    try {
      const { error } = await supabase
        .from('kv_store_a7563e12')
        .upsert({ 
          key: 'responses', 
          value: updatedResponses 
        });

      if (error) {
        // If it's a table doesn't exist error, just work offline
        if (error.code !== 'PGRST205') {
          throw error;
        } else {
          console.log('Working in offline mode - comment saved locally');
        }
      } else {
        setIsOnline(true);
        setSyncError(null);
        console.log('Comment synced to database');
      }
    } catch (error) {
      console.error('Error syncing comment:', error);
      // Don't show error to user if offline mode is working
      console.log('Comment saved locally only');
    }
  };

  const getResponsesForArea = (areaId: number) => {
    return allResponses.filter(r => r.areaId === areaId);
  };

  // Export data as JSON file
  const handleExport = () => {
    const dataStr = JSON.stringify(allResponses, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `impact-measurement-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Import data from JSON file
  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        if (Array.isArray(imported)) {
          // Update Supabase
          const { error } = await supabase
            .from('kv_store_a7563e12')
            .upsert({ 
              key: 'responses', 
              value: imported 
            });

          if (error) throw error;

          setAllResponses(imported);
          localStorage.setItem('impact_measurement_responses', JSON.stringify(imported));
          alert('Data imported successfully!');
        } else {
          alert('Invalid file format');
        }
      } catch (error) {
        alert('Error importing file');
        console.error(error);
      }
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset input
  };

  const handleClearAll = async () => {
    if (confirm('Are you sure you want to clear all responses? This will affect ALL users and cannot be undone.')) {
      try {
        // Clear in Supabase
        const { error } = await supabase
          .from('kv_store_a7563e12')
          .upsert({ 
            key: 'responses', 
            value: [] 
          });

        if (error) throw error;

        setAllResponses([]);
        localStorage.removeItem('impact_measurement_responses');
        alert('All data cleared successfully.');
      } catch (error) {
        console.error('Error clearing data:', error);
        alert('Failed to clear data from server.');
      }
    }
  };

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; border: string; text: string; hover: string; active: string }> = {
      indigo: { bg: 'bg-indigo-50', border: 'border-indigo-500', text: 'text-indigo-700', hover: 'hover:bg-indigo-100', active: 'bg-indigo-600 text-white' },
      purple: { bg: 'bg-purple-50', border: 'border-purple-500', text: 'text-purple-700', hover: 'hover:bg-purple-100', active: 'bg-purple-600 text-white' },
      blue: { bg: 'bg-blue-50', border: 'border-blue-500', text: 'text-blue-700', hover: 'hover:bg-blue-100', active: 'bg-blue-600 text-white' },
      emerald: { bg: 'bg-emerald-50', border: 'border-emerald-500', text: 'text-emerald-700', hover: 'hover:bg-emerald-100', active: 'bg-emerald-600 text-white' },
      amber: { bg: 'bg-amber-50', border: 'border-amber-500', text: 'text-amber-700', hover: 'hover:bg-amber-100', active: 'bg-amber-600 text-white' },
      rose: { bg: 'bg-rose-50', border: 'border-rose-500', text: 'text-rose-700', hover: 'hover:bg-rose-100', active: 'bg-rose-600 text-white' },
    };
    return colors[color] || colors.indigo;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-30">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Target className="w-6 h-6 text-indigo-600" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Impact Measurement Board</h1>
            </div>
            
            {/* Connection Status - Small indicator */}
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs ${
              isOnline ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}>
              {isOnline ? (
                <>
                  <Wifi className="w-3 h-3" />
                  <span>Live</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3 h-3" />
                  <span>Offline</span>
                </>
              )}
            </div>
          </div>
          
          {/* Priority Area Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {priorityAreas.map((area) => {
              const isSelected = area.id === selectedAreaId;
              const colors = getColorClasses(area.color);
              const responseCount = getResponsesForArea(area.id).length;
              
              return (
                <button
                  key={area.id}
                  onClick={() => setSelectedAreaId(area.id)}
                  className={`flex-shrink-0 px-4 py-2 rounded-lg transition-all text-sm font-medium whitespace-nowrap ${
                    isSelected 
                      ? `${colors.active} shadow-md` 
                      : `${colors.bg} ${colors.text} ${colors.hover}`
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>Priority Area {area.id}</span>
                    {responseCount > 0 && (
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        isSelected ? 'bg-white/20' : 'bg-white/50'
                      }`}>
                        {responseCount}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content - Full Width */}
      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <Target className="w-12 h-12 text-indigo-600 animate-pulse mx-auto mb-4" />
              <p className="text-gray-600">Loading boards...</p>
            </div>
          </div>
        ) : (
          <PriorityAreaBoard
            area={selectedArea}
            responses={getResponsesForArea(selectedArea.id)}
            onAddResponse={(questionId, response) => handleAddResponse(selectedArea.id, questionId, response)}
            onAddComment={(responseId, comment) => handleAddComment(responseId, comment)}
          />
        )}
      </div>
    </div>
  );
}
