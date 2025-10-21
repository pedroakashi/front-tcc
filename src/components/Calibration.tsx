import { useState, useEffect } from 'react';
import { Camera, ArrowLeft, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { startCalibration, subscribeToCalibrationSession } from '../lib/api';
import type { CalibrationSession } from '../lib/supabase';

interface CalibrationProps {
  modelId: string;
  onBack: () => void;
}

export default function Calibration({ modelId, onBack }: CalibrationProps) {
  const [jupyterUrl, setJupyterUrl] = useState('http://localhost:8888/api/calibrate');
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [session, setSession] = useState<CalibrationSession | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.id) return;

    const unsubscribe = subscribeToCalibrationSession(session.id, (updatedSession) => {
      setSession(updatedSession);

      if (updatedSession.status === 'completed' || updatedSession.status === 'failed') {
        setIsCalibrating(false);
      }
    });

    return unsubscribe;
  }, [session?.id]);

  const handleStartCalibration = async () => {
    setIsCalibrating(true);
    setError(null);

    try {
      const result = await startCalibration(modelId, jupyterUrl);
      setSession({
        id: result.sessionId,
        model_id: modelId,
        status: 'running',
        jupyter_notebook_url: jupyterUrl,
        created_at: new Date().toISOString(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start calibration');
      setIsCalibrating(false);
    }
  };

  return (
    <div>
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Voltar</span>
      </button>

      <div className="bg-[#1a1f2e] border border-gray-700 rounded-xl p-12">
        <div className="flex items-start gap-6 mb-12">
          <div className="w-16 h-16 bg-blue-500 bg-opacity-20 rounded-xl flex items-center justify-center">
            <Camera className="w-8 h-8 text-blue-400" />
          </div>
          <div>
            <h2 className="text-3xl font-bold mb-2">Calibração do Sistema</h2>
            <p className="text-gray-400">Configure o sistema para reconhecer seus padrões faciais</p>
          </div>
        </div>

        {session?.status === 'completed' && (
          <div className="bg-green-500 bg-opacity-10 border border-green-500 rounded-lg p-4 mb-8 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
            <div className="text-green-400">
              <p className="font-semibold">Calibração concluída com sucesso!</p>
              <p className="text-sm text-green-300 mt-1">O sistema está pronto para monitoramento.</p>
            </div>
          </div>
        )}

        {session?.status === 'failed' && (
          <div className="bg-red-500 bg-opacity-10 border border-red-500 rounded-lg p-4 mb-8 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <div className="text-red-400">
              <p className="font-semibold">Erro na calibração</p>
              <p className="text-sm text-red-300 mt-1">{session.error_message || 'Tente novamente.'}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-500 bg-opacity-10 border border-red-500 rounded-lg p-4 mb-8 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-red-400">{error}</p>
          </div>
        )}

        <div className="bg-[#0f1419] border border-gray-700 rounded-lg p-8 mb-8">
          <h3 className="font-semibold mb-6 text-lg">Instruções de calibração:</h3>
          <ul className="space-y-4">
            <li className="flex items-start gap-3 text-gray-300">
              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
              <span>Posicione-se em frente à câmera com boa iluminação</span>
            </li>
            <li className="flex items-start gap-3 text-gray-300">
              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
              <span>Mantenha uma postura natural durante 20-25 segundos</span>
            </li>
            <li className="flex items-start gap-3 text-gray-300">
              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
              <span>Olhe diretamente para a tela</span>
            </li>
            <li className="flex items-start gap-3 text-gray-300">
              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
              <span>Evite movimentos bruscos durante a calibração</span>
            </li>
          </ul>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Jupyter Notebook URL
          </label>
          <input
            type="text"
            value={jupyterUrl}
            onChange={(e) => setJupyterUrl(e.target.value)}
            disabled={isCalibrating}
            placeholder="http://localhost:8888/api/calibrate"
            className="w-full bg-[#0f1419] border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <p className="text-gray-500 text-xs mt-2">
            URL do endpoint do seu Jupyter notebook que receberá a requisição de calibração
          </p>
        </div>

        <button
          onClick={handleStartCalibration}
          disabled={isCalibrating || !jupyterUrl}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isCalibrating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Calibrando...</span>
            </>
          ) : (
            <>
              <Camera className="w-5 h-5" />
              <span>Iniciar Calibração</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
