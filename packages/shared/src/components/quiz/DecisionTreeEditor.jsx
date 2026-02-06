import { useState, useCallback } from 'react';
import {
  GitBranch,
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  GripVertical,
  Copy,
  Check,
  AlertTriangle,
  Info,
  Zap,
  ArrowRight,
  X,
} from 'lucide-react';

// Visual Decision Tree Editor - Editor visual de árbol de decisión
export default function DecisionTreeEditor({
  decisionTree,
  questions,
  onUpdate,
  onClose
}) {
  const [selectedRule, setSelectedRule] = useState(null);
  const [expandedRules, setExpandedRules] = useState({});

  const rules = decisionTree?.rules || [];
  const scoreRules = decisionTree?.scoreRules || {};
  const defaultResult = decisionTree?.defaultResult;

  // Toggle rule expansion
  const toggleRule = (ruleId) => {
    setExpandedRules(prev => ({
      ...prev,
      [ruleId]: !prev[ruleId]
    }));
  };

  // Add new rule
  const addRule = () => {
    const newRule = {
      id: `rule_${Date.now()}`,
      priority: rules.length + 1,
      conditions: {
        logic: 'AND',
        conditions: [
          { field: questions[0]?.id || 'question', operator: 'equals', value: '' }
        ]
      },
      result: {
        type: 'success',
        title: 'Nuevo Resultado',
        description: 'Descripción del resultado',
        color: 'green',
        cta: { type: 'form', text: 'Continuar' }
      }
    };

    onUpdate({
      ...decisionTree,
      rules: [...rules, newRule]
    });

    setSelectedRule(newRule.id);
    setExpandedRules(prev => ({ ...prev, [newRule.id]: true }));
  };

  // Delete rule
  const deleteRule = (ruleId) => {
    onUpdate({
      ...decisionTree,
      rules: rules.filter(r => r.id !== ruleId)
    });
    if (selectedRule === ruleId) setSelectedRule(null);
  };

  // Duplicate rule
  const duplicateRule = (rule) => {
    const newRule = {
      ...JSON.parse(JSON.stringify(rule)),
      id: `rule_${Date.now()}`,
      priority: rules.length + 1,
    };

    onUpdate({
      ...decisionTree,
      rules: [...rules, newRule]
    });
  };

  // Update rule
  const updateRule = (ruleId, updates) => {
    onUpdate({
      ...decisionTree,
      rules: rules.map(r => r.id === ruleId ? { ...r, ...updates } : r)
    });
  };

  // Update score rules
  const updateScoreRules = (questionId, answerScores) => {
    onUpdate({
      ...decisionTree,
      scoreRules: {
        ...scoreRules,
        [questionId]: answerScores
      }
    });
  };

  // Update default result
  const updateDefaultResult = (updates) => {
    onUpdate({
      ...decisionTree,
      defaultResult: { ...defaultResult, ...updates }
    });
  };

  // Get result type icon
  const getResultIcon = (type) => {
    switch (type) {
      case 'success': return <Check size={16} className="text-green-500" />;
      case 'warning': return <AlertTriangle size={16} className="text-amber-500" />;
      case 'info': return <Info size={16} className="text-blue-500" />;
      default: return <Zap size={16} className="text-gray-500" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 text-white w-full max-w-5xl h-[90vh] rounded-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <GitBranch size={24} className="text-emerald-500" />
            <h2 className="font-bold text-xl">Editor de Árbol de Decisión</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Rules List */}
          <div className="w-80 border-r border-gray-700 flex flex-col">
            <div className="p-4 border-b border-gray-700">
              <h3 className="font-semibold text-sm text-gray-400 uppercase tracking-wider mb-3">Reglas de Resultado</h3>
              <button
                onClick={addRule}
                className="w-full p-3 border-2 border-dashed border-gray-600 rounded-lg text-gray-400 hover:text-white hover:border-emerald-500 flex items-center justify-center gap-2 transition"
              >
                <Plus size={18} />
                Añadir Regla
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {rules.map((rule, index) => (
                <div
                  key={rule.id}
                  className={`rounded-lg border transition cursor-pointer ${
                    selectedRule === rule.id
                      ? 'border-emerald-500 bg-emerald-900/30'
                      : 'border-gray-700 hover:border-gray-600 bg-gray-800'
                  }`}
                  onClick={() => setSelectedRule(rule.id)}
                >
                  <div className="p-3 flex items-center gap-2">
                    <GripVertical size={16} className="text-gray-500" />
                    <span className="text-xs text-gray-500">#{index + 1}</span>
                    {getResultIcon(rule.result?.type)}
                    <span className="flex-1 text-sm font-medium truncate">
                      {rule.result?.title || 'Sin título'}
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); duplicateRule(rule); }}
                      className="p-1 hover:bg-gray-700 rounded"
                      title="Duplicar"
                    >
                      <Copy size={14} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteRule(rule.id); }}
                      className="p-1 hover:bg-red-600/20 rounded text-red-400"
                      title="Eliminar"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="px-3 pb-3">
                    <div className="text-xs text-gray-500">
                      {rule.conditions?.conditions?.length || 0} condición(es) ·
                      Prioridad: {rule.priority}
                    </div>
                  </div>
                </div>
              ))}

              {/* Default Result */}
              <div
                className={`rounded-lg border transition cursor-pointer mt-4 ${
                  selectedRule === 'default'
                    ? 'border-blue-500 bg-blue-900/30'
                    : 'border-gray-700 hover:border-gray-600 bg-gray-800'
                }`}
                onClick={() => setSelectedRule('default')}
              >
                <div className="p-3 flex items-center gap-2">
                  <Info size={16} className="text-blue-500" />
                  <span className="flex-1 text-sm font-medium">
                    Resultado por Defecto
                  </span>
                </div>
                <div className="px-3 pb-3 text-xs text-gray-500">
                  Se muestra si ninguna regla aplica
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Rule Editor */}
          <div className="flex-1 overflow-y-auto p-6">
            {selectedRule === 'default' ? (
              <DefaultResultEditor
                result={defaultResult}
                onUpdate={updateDefaultResult}
              />
            ) : selectedRule ? (
              <RuleEditor
                rule={rules.find(r => r.id === selectedRule)}
                questions={questions}
                onUpdate={(updates) => updateRule(selectedRule, updates)}
              />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-500">
                <GitBranch size={48} className="mb-4 opacity-50" />
                <p className="text-lg">Selecciona una regla para editar</p>
                <p className="text-sm mt-2">O crea una nueva regla para empezar</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer - Score Rules */}
        <div className="border-t border-gray-700 p-4">
          <details className="group">
            <summary className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-gray-400 hover:text-white">
              <ChevronRight size={16} className="group-open:rotate-90 transition-transform" />
              Configurar Puntuación por Respuesta
            </summary>
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              {questions.map(q => (
                <ScoreRulesEditor
                  key={q.id}
                  question={q}
                  scores={scoreRules[q.id] || {}}
                  onUpdate={(scores) => updateScoreRules(q.id, scores)}
                />
              ))}
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}

// Rule Editor Component
function RuleEditor({ rule, questions, onUpdate }) {
  if (!rule) return null;

  const updateConditions = (newConditions) => {
    onUpdate({ conditions: newConditions });
  };

  const updateResult = (resultUpdates) => {
    onUpdate({ result: { ...rule.result, ...resultUpdates } });
  };

  return (
    <div className="space-y-6">
      {/* Result Preview */}
      <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
        <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Configuración del Resultado
        </h4>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-500 block mb-1">Tipo</label>
            <select
              value={rule.result?.type || 'success'}
              onChange={(e) => updateResult({ type: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm"
            >
              <option value="success">Éxito (Verde)</option>
              <option value="warning">Advertencia (Ámbar)</option>
              <option value="info">Información (Azul)</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-500 block mb-1">Prioridad</label>
            <input
              type="number"
              value={rule.priority || 1}
              onChange={(e) => onUpdate({ priority: parseInt(e.target.value) || 1 })}
              min="1"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <div className="col-span-2">
            <label className="text-xs text-gray-500 block mb-1">Título del Resultado</label>
            <input
              type="text"
              value={rule.result?.title || ''}
              onChange={(e) => updateResult({ title: e.target.value })}
              placeholder="Ej: Excelente Candidato"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <div className="col-span-2">
            <label className="text-xs text-gray-500 block mb-1">Descripción</label>
            <textarea
              value={rule.result?.description || ''}
              onChange={(e) => updateResult({ description: e.target.value })}
              rows={3}
              placeholder="Descripción que verá el usuario..."
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm resize-none"
            />
          </div>

          <div>
            <label className="text-xs text-gray-500 block mb-1">Tipo de CTA</label>
            <select
              value={rule.result?.cta?.type || 'form'}
              onChange={(e) => updateResult({ cta: { ...rule.result?.cta, type: e.target.value } })}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm"
            >
              <option value="form">Formulario</option>
              <option value="calendly">Calendly</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="redirect">Redirección</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-500 block mb-1">Texto del Botón</label>
            <input
              type="text"
              value={rule.result?.cta?.text || ''}
              onChange={(e) => updateResult({ cta: { ...rule.result?.cta, text: e.target.value } })}
              placeholder="Ej: Agendar Cita"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Conditions */}
      <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
        <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Condiciones (Si el usuario responde...)
        </h4>

        <ConditionsEditor
          conditions={rule.conditions}
          questions={questions}
          onUpdate={updateConditions}
        />
      </div>
    </div>
  );
}

// Conditions Editor Component
function ConditionsEditor({ conditions, questions, onUpdate }) {
  const logic = conditions?.logic || 'AND';
  const conditionsList = conditions?.conditions || [];

  const updateLogic = (newLogic) => {
    onUpdate({ ...conditions, logic: newLogic });
  };

  const addCondition = () => {
    onUpdate({
      ...conditions,
      conditions: [
        ...conditionsList,
        { field: questions[0]?.id || '', operator: 'equals', value: '' }
      ]
    });
  };

  const updateCondition = (index, updates) => {
    const newConditions = [...conditionsList];
    newConditions[index] = { ...newConditions[index], ...updates };
    onUpdate({ ...conditions, conditions: newConditions });
  };

  const removeCondition = (index) => {
    onUpdate({
      ...conditions,
      conditions: conditionsList.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="space-y-3">
      {/* Logic Toggle */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm text-gray-400">Combinar con:</span>
        <button
          onClick={() => updateLogic('AND')}
          className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
            logic === 'AND'
              ? 'bg-emerald-600 text-white'
              : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
          }`}
        >
          Y (todas)
        </button>
        <button
          onClick={() => updateLogic('OR')}
          className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
            logic === 'OR'
              ? 'bg-emerald-600 text-white'
              : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
          }`}
        >
          O (cualquiera)
        </button>
      </div>

      {/* Conditions List */}
      {conditionsList.map((condition, index) => (
        <div key={index} className="flex items-center gap-2 bg-gray-700/50 p-3 rounded-lg">
          {index > 0 && (
            <span className="text-xs text-emerald-500 font-bold w-8">{logic}</span>
          )}
          {index === 0 && <span className="text-xs text-gray-500 w-8">SI</span>}

          {/* Field (Question) */}
          <select
            value={condition.field || ''}
            onChange={(e) => updateCondition(index, { field: e.target.value })}
            className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">Seleccionar pregunta...</option>
            {questions.map(q => (
              <option key={q.id} value={q.id}>{q.title?.slice(0, 40)}...</option>
            ))}
          </select>

          {/* Operator */}
          <select
            value={condition.operator || 'equals'}
            onChange={(e) => updateCondition(index, { operator: e.target.value })}
            className="w-32 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm"
          >
            <option value="equals">es igual a</option>
            <option value="not_equals">no es igual a</option>
            <option value="in">es uno de</option>
            <option value="not_in">no es uno de</option>
          </select>

          {/* Value */}
          {(condition.operator === 'in' || condition.operator === 'not_in') ? (
            <select
              multiple
              value={Array.isArray(condition.value) ? condition.value : []}
              onChange={(e) => {
                const values = Array.from(e.target.selectedOptions, opt => opt.value);
                updateCondition(index, { value: values });
              }}
              className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm min-h-[80px]"
            >
              {questions.find(q => q.id === condition.field)?.options?.map((opt, i) => (
                <option key={i} value={opt.label}>{opt.label}</option>
              ))}
            </select>
          ) : (
            <select
              value={condition.value || ''}
              onChange={(e) => updateCondition(index, { value: e.target.value })}
              className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">Seleccionar respuesta...</option>
              {questions.find(q => q.id === condition.field)?.options?.map((opt, i) => (
                <option key={i} value={opt.label}>{opt.label}</option>
              ))}
            </select>
          )}

          <button
            onClick={() => removeCondition(index)}
            className="p-2 hover:bg-red-600/20 rounded text-red-400"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ))}

      <button
        onClick={addCondition}
        className="w-full p-2 border border-dashed border-gray-600 rounded-lg text-gray-400 hover:text-white hover:border-gray-500 flex items-center justify-center gap-2 text-sm"
      >
        <Plus size={16} /> Añadir Condición
      </button>
    </div>
  );
}

// Default Result Editor
function DefaultResultEditor({ result, onUpdate }) {
  return (
    <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
      <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
        Resultado por Defecto
      </h4>
      <p className="text-sm text-gray-500 mb-4">
        Este resultado se muestra cuando ninguna de las reglas anteriores se cumple.
      </p>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-gray-500 block mb-1">Tipo</label>
          <select
            value={result?.type || 'info'}
            onChange={(e) => onUpdate({ type: e.target.value })}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm"
          >
            <option value="success">Éxito (Verde)</option>
            <option value="warning">Advertencia (Ámbar)</option>
            <option value="info">Información (Azul)</option>
          </select>
        </div>

        <div>
          <label className="text-xs text-gray-500 block mb-1">Texto del Botón</label>
          <input
            type="text"
            value={result?.cta?.text || ''}
            onChange={(e) => onUpdate({ cta: { ...result?.cta, text: e.target.value } })}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <div className="col-span-2">
          <label className="text-xs text-gray-500 block mb-1">Título</label>
          <input
            type="text"
            value={result?.title || ''}
            onChange={(e) => onUpdate({ title: e.target.value })}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <div className="col-span-2">
          <label className="text-xs text-gray-500 block mb-1">Descripción</label>
          <textarea
            value={result?.description || ''}
            onChange={(e) => onUpdate({ description: e.target.value })}
            rows={3}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm resize-none"
          />
        </div>
      </div>
    </div>
  );
}

// Score Rules Editor for a single question
function ScoreRulesEditor({ question, scores, onUpdate }) {
  return (
    <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
      <h5 className="text-xs font-semibold text-gray-400 mb-2 truncate" title={question.title}>
        {question.title?.slice(0, 30)}...
      </h5>
      <div className="space-y-1">
        {question.options?.map((opt, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-xs text-gray-500 truncate flex-1" title={opt.label}>
              {opt.label?.slice(0, 15)}
            </span>
            <input
              type="number"
              value={scores[opt.label] || 0}
              onChange={(e) => onUpdate({ ...scores, [opt.label]: parseInt(e.target.value) || 0 })}
              className="w-14 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs text-center"
              min="0"
              max="100"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
