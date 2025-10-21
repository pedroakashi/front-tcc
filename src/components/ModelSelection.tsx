import { useState, useEffect } from 'react';
import { Activity, Zap, Loader2 } from 'lucide-react';
import { getModels } from '../lib/api';
import type { Model } from '../lib/supabase';

interface ModelSelectionProps {
  onSelectModel: (modelId: string, modelName: string) => void;
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
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchModels() {
      try {
        const data = await getModels();
        setModels(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load models');
      } finally {
        setLoading(false);
      }
    }

    fetchModels();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500 bg-opacity-10 border border-red-500 rounded-lg p-4 text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-12">
        <h2 className="text-3xl font-bold mb-3">Seleção do Modelo</h2>
        <p className="text-gray-400">
          Escolha o modelo de detecção de fadiga que melhor se adequa às suas necessidades
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {models.map((model) => {
          const metrics = [
            { label: 'Acurácia', value: `${model.accuracy}%`, color: 'green' },
          ];

          if (model.auc) {
            metrics.push({ label: 'AUC', value: model.auc.toFixed(3), color: 'blue' });
          }

          if (model.trials) {
            metrics.push({ label: 'Trials', value: model.trials.toString() });
          }

          const icon = model.name === 'optuna' ?
            <Zap className="w-6 h-6" /> :
            <Activity className="w-6 h-6" />;

          return (
            <ModelCard
              key={model.id}
              icon={icon}
              title={model.display_name}
              description={model.description}
              metrics={metrics}
              recommended={model.is_recommended}
              onClick={() => onSelectModel(model.id, model.name)}
            />
          );
        })}
      </div>
    </div>
  );
}
