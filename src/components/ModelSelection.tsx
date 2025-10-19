import { Activity, Zap } from 'lucide-react';

interface ModelSelectionProps {
  onSelectModel: (model: 'normal' | 'optuna') => void;
}

interface ModelCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  metrics: Array<{ label: string; value: string; color?: string }>;
  recommended?: boolean;
  onClick: () => void;
}

function ModelCard({ icon, title, description, metrics, recommended, onClick }: ModelCardProps) {
  return (
    <button
      onClick={onClick}
      className="relative bg-[#1a1f2e] border border-gray-700 rounded-xl p-8 text-left hover:border-gray-600 transition-all hover:bg-[#1e2535] group"
    >
      {recommended && (
        <div className="absolute top-6 right-6">
          <span className="bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
            Recomendado
          </span>
        </div>
      )}

      <div className="flex items-start gap-4 mb-6">
        <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 group-hover:text-blue-400 transition-colors">
          {icon}
        </div>
        <div>
          <h3 className="text-xl font-bold mb-1">{title}</h3>
          <p className="text-gray-400 text-sm">{description}</p>
        </div>
      </div>

      <div className="space-y-3">
        {metrics.map((metric, index) => (
          <div key={index} className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">{metric.label}</span>
            <span
              className={`font-semibold ${
                metric.color === 'green'
                  ? 'text-green-400'
                  : metric.color === 'blue'
                  ? 'text-blue-400'
                  : 'text-white'
              }`}
            >
              {metric.value}
            </span>
          </div>
        ))}
      </div>
    </button>
  );
}

export default function ModelSelection({ onSelectModel }: ModelSelectionProps) {
  return (
    <div>
      <div className="mb-12">
        <h2 className="text-3xl font-bold mb-3">Seleção do Modelo</h2>
        <p className="text-gray-400">
          Escolha o modelo de detecção de fadiga que melhor se adequa às suas necessidades
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ModelCard
          icon={<Activity className="w-6 h-6" />}
          title="Modelo Normal"
          description="Modelo padrão com boa performance para uso geral"
          metrics={[{ label: 'Acurácia', value: '87.1%', color: 'green' }]}
          onClick={() => onSelectModel('normal')}
        />

        <ModelCard
          icon={<Zap className="w-6 h-6" />}
          title="Modelo Optuna"
          description="Modelo otimizado com hiperparâmetros ajustados"
          metrics={[
            { label: 'Acurácia', value: '93.9%', color: 'green' },
            { label: 'AUC', value: '0.983', color: 'blue' },
            { label: 'Trials', value: '100' },
          ]}
          recommended
          onClick={() => onSelectModel('optuna')}
        />
      </div>
    </div>
  );
}
