import { Camera, ArrowLeft } from 'lucide-react';

interface CalibrationProps {
  onBack: () => void;
}

export default function Calibration({ onBack }: CalibrationProps) {
  const handleStartCalibration = () => {
    console.log('Starting calibration...');
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

        <button
          onClick={handleStartCalibration}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-3"
        >
          <Camera className="w-5 h-5" />
          <span>Iniciar Calibração</span>
        </button>
      </div>
    </div>
  );
}
