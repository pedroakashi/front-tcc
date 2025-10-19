import { useState } from 'react';
import { Activity, Camera } from 'lucide-react';
import ModelSelection from './components/ModelSelection';
import Calibration from './components/Calibration';

function App() {
  const [currentView, setCurrentView] = useState<'selection' | 'calibration'>('selection');
  const [selectedModel, setSelectedModel] = useState<'normal' | 'optuna' | null>(null);

  const handleModelSelect = (model: 'normal' | 'optuna') => {
    setSelectedModel(model);
    setCurrentView('calibration');
  };

  return (
    <div className="min-h-screen bg-[#0f1419] text-white">
      <header className="border-b border-gray-800 px-8 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-500 rounded-xl flex items-center justify-center">
              <Activity className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Sistema de Detecção de Fadiga</h1>
              <p className="text-gray-400 text-sm">Monitoramento inteligente em tempo real</p>
            </div>
          </div>
          <button className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors">
            <Activity className="w-5 h-5" />
            <span>{currentView === 'selection' ? 'Configuração' : 'Calibração'}</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-12">
        {currentView === 'selection' && (
          <ModelSelection onSelectModel={handleModelSelect} />
        )}
        {currentView === 'calibration' && selectedModel && (
          <Calibration onBack={() => setCurrentView('selection')} />
        )}
      </main>
    </div>
  );
}

export default App;
