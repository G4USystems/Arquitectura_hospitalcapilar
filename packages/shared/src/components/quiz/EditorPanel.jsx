import { useState, useEffect, useRef } from 'react';
import {
  X,
  Save,
  Plus,
  Trash2,
  GripVertical,
  Settings,
  Palette,
  Type,
  Image,
  ChevronDown,
  ChevronRight,
  GitBranch,
  Copy,
  Home,
  FileText,
  RotateCcw,
  Upload,
} from 'lucide-react';
import DecisionTreeEditor from './DecisionTreeEditor';
import QuizFlowEditor from './QuizFlowEditor';

// Editor Panel - Panel lateral para editar el quiz en tiempo real
export default function EditorPanel({
  quiz,
  currentStep,
  onUpdateQuiz,
  onUpdateQuestion,
  onAddQuestion,
  onDeleteQuestion,
  onReorderQuestions,
  onClose,
  onGoToStep,
  // New props for decision tree, flow, and duplicate
  decisionTree,
  onUpdateDecisionTree,
  quizFlow,
  onUpdateFlow,
  onDuplicateQuiz,
  onSaveAll,
}) {
  const [activeTab, setActiveTab] = useState('content'); // content, style, settings
  const [showDecisionTree, setShowDecisionTree] = useState(false);
  const [showFlowEditor, setShowFlowEditor] = useState(false);

  const tabs = [
    { id: 'content', label: 'Contenido', icon: Type },
    { id: 'style', label: 'Estilo', icon: Palette },
    { id: 'settings', label: 'Config', icon: Settings },
  ];

  return (
    <div className="w-96 bg-gray-900 text-white h-full flex flex-col border-l border-gray-700 shadow-2xl shrink-0">
      {/* Header */}
      <div className="p-4 border-b border-gray-700 flex items-center justify-between">
        <h2 className="font-bold text-lg">Editor de Quiz</h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-800 rounded-lg transition"
        >
          <X size={20} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-700">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-3 px-4 text-sm font-medium flex items-center justify-center gap-2 transition ${
              activeTab === tab.id
                ? 'text-white border-b-2 border-emerald-500 bg-gray-800'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'content' && (
          <ContentTab
            quiz={quiz}
            currentStep={currentStep}
            onUpdateQuiz={onUpdateQuiz}
            onUpdateQuestion={onUpdateQuestion}
            onAddQuestion={onAddQuestion}
            onDeleteQuestion={onDeleteQuestion}
            onGoToStep={onGoToStep}
          />
        )}
        {activeTab === 'style' && (
          <StyleTab
            quiz={quiz}
            onUpdateQuiz={onUpdateQuiz}
          />
        )}
        {activeTab === 'settings' && (
          <SettingsTab
            quiz={quiz}
            onUpdateQuiz={onUpdateQuiz}
          />
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700 space-y-2">
        {/* Flow Editor Button - Full Width */}
        <button
          onClick={() => setShowFlowEditor(true)}
          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition"
        >
          <GitBranch size={16} />
          Editor de Flujo Visual
        </button>

        {/* Action Buttons Row */}
        <div className="flex gap-2">
          <button
            onClick={() => setShowDecisionTree(true)}
            className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition"
          >
            <GitBranch size={16} />
            Resultados
          </button>
          <button
            onClick={onDuplicateQuiz}
            className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition"
          >
            <Copy size={16} />
            Duplicar
          </button>
        </div>

        {/* Save Button */}
        <button
          onClick={onSaveAll}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 rounded-lg font-bold flex items-center justify-center gap-2 transition"
        >
          <Save size={18} />
          Guardar Cambios
        </button>
      </div>

      {/* Decision Tree Editor Modal */}
      {showDecisionTree && (
        <DecisionTreeEditor
          decisionTree={decisionTree}
          questions={quiz.questions || []}
          onUpdate={onUpdateDecisionTree}
          onClose={() => setShowDecisionTree(false)}
        />
      )}

      {/* Quiz Flow Editor Modal */}
      {showFlowEditor && (
        <QuizFlowEditor
          questions={quiz.questions || []}
          flow={quizFlow}
          onUpdateFlow={onUpdateFlow}
          onAddQuestion={onAddQuestion}
          onClose={() => setShowFlowEditor(false)}
        />
      )}
    </div>
  );
}

// Tab: Contenido - Redesigned with screen selector
function ContentTab({ quiz, currentStep, onUpdateQuiz, onUpdateQuestion, onAddQuestion, onDeleteQuestion, onGoToStep }) {
  const [editingScreen, setEditingScreen] = useState('intro');

  // Sync editingScreen with currentStep from preview navigation
  useEffect(() => {
    if (currentStep === 0) setEditingScreen('intro');
    else if (currentStep <= (quiz.questions?.length || 0)) setEditingScreen(currentStep - 1);
    else setEditingScreen('lead');
  }, [currentStep, quiz.questions?.length]);

  const handleSelectScreen = (screen) => {
    setEditingScreen(screen);
    if (onGoToStep) {
      if (screen === 'intro') onGoToStep(0);
      else if (screen === 'lead') onGoToStep((quiz.questions?.length || 0) + 1);
      else onGoToStep(screen + 1); // screen is question index, step = index + 1
    }
  };

  return (
    <div className="p-3 space-y-3">
      {/* Screen selector */}
      <div className="space-y-1">
        <label className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold px-1">Pantallas</label>

        {/* Intro */}
        <button
          onClick={() => handleSelectScreen('intro')}
          className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition ${
            editingScreen === 'intro'
              ? 'bg-emerald-600 text-white'
              : 'text-gray-300 hover:bg-gray-800'
          }`}
        >
          <Home size={14} className="shrink-0" />
          <span className="flex-1 truncate">Pantalla de Inicio</span>
        </button>

        {/* Questions */}
        {quiz.questions?.map((q, idx) => (
          <div key={idx} className="flex items-center gap-0.5 group">
            <button
              onClick={() => handleSelectScreen(idx)}
              className={`flex-1 text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition min-w-0 ${
                editingScreen === idx
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                editingScreen === idx ? 'bg-blue-500' : 'bg-gray-700'
              }`}>
                {q.type === 'info' ? '⏱' : `Q${idx + 1}`}
              </span>
              <span className="flex-1 truncate">{q.title || 'Sin título'}</span>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDeleteQuestion(idx); }}
              className="p-1.5 hover:bg-red-600/30 rounded text-red-400 opacity-0 group-hover:opacity-100 transition shrink-0"
            >
              <Trash2 size={12} />
            </button>
          </div>
        ))}

        {/* Add Question */}
        <button
          onClick={onAddQuestion}
          className="w-full p-2 border border-dashed border-gray-600 rounded-lg text-gray-400 hover:text-white hover:border-gray-500 text-sm flex items-center justify-center gap-1.5 transition"
        >
          <Plus size={14} /> Añadir Pregunta
        </button>

        {/* Lead Form */}
        <button
          onClick={() => handleSelectScreen('lead')}
          className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition ${
            editingScreen === 'lead'
              ? 'bg-purple-600 text-white'
              : 'text-gray-300 hover:bg-gray-800'
          }`}
        >
          <FileText size={14} className="shrink-0" />
          <span className="flex-1 truncate">Formulario de Lead</span>
        </button>

        {/* Results / CTA */}
        <button
          onClick={() => handleSelectScreen('result')}
          className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition ${
            editingScreen === 'result'
              ? 'bg-amber-600 text-white'
              : 'text-gray-300 hover:bg-gray-800'
          }`}
        >
          <span className="text-sm shrink-0">🏆</span>
          <span className="flex-1 truncate">Resultados / CTA</span>
        </button>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-700 pt-3">
        <label className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold px-1 block mb-2">
          {editingScreen === 'intro' ? 'Editar Inicio' :
           editingScreen === 'lead' ? 'Editar Formulario' :
           editingScreen === 'result' ? 'Editar Resultados' :
           typeof editingScreen === 'number' ? `Editar Pregunta ${editingScreen + 1}` : 'Editar'}
        </label>

        {/* Intro Editor */}
        {editingScreen === 'intro' && (
          <IntroEditor quiz={quiz} onUpdateQuiz={onUpdateQuiz} />
        )}

        {/* Question Editor */}
        {typeof editingScreen === 'number' && quiz.questions?.[editingScreen] && (
          <QuestionEditor
            question={quiz.questions[editingScreen]}
            questionIndex={editingScreen}
            onUpdate={(data) => onUpdateQuestion(editingScreen, data)}
            onDelete={() => onDeleteQuestion(editingScreen)}
          />
        )}

        {/* Lead Form Editor */}
        {editingScreen === 'lead' && (
          <LeadFormEditor quiz={quiz} onUpdateQuiz={onUpdateQuiz} />
        )}

        {/* Result / CTA Editor */}
        {editingScreen === 'result' && (
          <ResultEditor quiz={quiz} onUpdateQuiz={onUpdateQuiz} />
        )}
      </div>
    </div>
  );
}

// Intro Editor
function IntroEditor({ quiz, onUpdateQuiz }) {
  const fileInputRef = useRef(null);

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Convert to data URL for preview (TODO: upload to Firebase Storage)
    const reader = new FileReader();
    reader.onload = (event) => {
      onUpdateQuiz({ intro: { ...quiz.intro, logoUrl: event.target.result } });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-3">
      {/* Logo upload */}
      <div className="space-y-1">
        <label className="text-xs text-gray-400 uppercase tracking-wider block">Logo</label>
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-600 rounded-lg p-4 text-center cursor-pointer hover:border-gray-500 transition"
        >
          {quiz.intro?.logoUrl ? (
            <img src={quiz.intro.logoUrl} alt="Logo" className="h-12 mx-auto object-contain" />
          ) : (
            <>
              <Upload size={24} className="mx-auto text-gray-500 mb-1" />
              <p className="text-xs text-gray-400">Subir logo (PNG, JPG)</p>
            </>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleLogoUpload}
          className="hidden"
        />
        {quiz.intro?.logoUrl && (
          <button
            onClick={() => onUpdateQuiz({ intro: { ...quiz.intro, logoUrl: null } })}
            className="text-xs text-red-400 hover:text-red-300"
          >
            Quitar logo
          </button>
        )}
      </div>

      {/* Brand text (shown if no logo) */}
      {!quiz.intro?.logoUrl && (
        <div className="grid grid-cols-2 gap-2">
          <InputField
            label="Marca (parte 1)"
            value={quiz.intro?.brandName || ''}
            onChange={(val) => onUpdateQuiz({ intro: { ...quiz.intro, brandName: val } })}
          />
          <InputField
            label="Marca (color)"
            value={quiz.intro?.brandHighlight || ''}
            onChange={(val) => onUpdateQuiz({ intro: { ...quiz.intro, brandHighlight: val } })}
          />
        </div>
      )}

      <InputField
        label="Badge Superior"
        value={quiz.intro?.badge || ''}
        onChange={(val) => onUpdateQuiz({ intro: { ...quiz.intro, badge: val } })}
      />
      <InputField
        label="Título Principal"
        value={quiz.intro?.title || ''}
        onChange={(val) => onUpdateQuiz({ intro: { ...quiz.intro, title: val } })}
        multiline
        hint="Usa *texto* para resaltar en color"
      />
      <InputField
        label="Subtítulo"
        value={quiz.intro?.subtitle || ''}
        onChange={(val) => onUpdateQuiz({ intro: { ...quiz.intro, subtitle: val } })}
        multiline
      />
      <InputField
        label="Texto del Botón"
        value={quiz.intro?.buttonText || ''}
        onChange={(val) => onUpdateQuiz({ intro: { ...quiz.intro, buttonText: val } })}
      />
      <InputField
        label="Texto del Footer"
        value={quiz.intro?.footerText || ''}
        onChange={(val) => onUpdateQuiz({ intro: { ...quiz.intro, footerText: val } })}
      />
    </div>
  );
}

// Result / CTA Editor
function ResultEditor({ quiz, onUpdateQuiz }) {
  return (
    <div className="space-y-3">
      <InputField
        label="Título post-envío"
        value={quiz.result?.title || ''}
        onChange={(val) => onUpdateQuiz({ result: { ...quiz.result, title: val } })}
      />
      <InputField
        label="Subtítulo post-envío"
        value={quiz.result?.subtitle || ''}
        onChange={(val) => onUpdateQuiz({ result: { ...quiz.result, subtitle: val } })}
        multiline
      />

      <div className="border-t border-gray-700 pt-3 mt-3">
        <label className="text-xs text-gray-400 uppercase tracking-wider block mb-2">Acción después del envío (CTA)</label>
        <select
          value={quiz.cta?.type || 'none'}
          onChange={(e) => onUpdateQuiz({ cta: { ...quiz.cta, type: e.target.value } })}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm"
        >
          <option value="none">Solo mostrar resultado</option>
          <option value="calendly">Calendly (Agendar cita embebido)</option>
          <option value="whatsapp">WhatsApp</option>
          <option value="redirect">Botón de redirección</option>
          <option value="link">Link personalizado</option>
        </select>
      </div>

      {quiz.cta?.type && quiz.cta.type !== 'none' && (
        <div className="space-y-3 p-3 bg-gray-800/50 rounded-lg">
          {/* Button Text */}
          {quiz.cta.type !== 'calendly' && (
            <InputField
              label="Texto del botón"
              value={quiz.cta?.buttonText || ''}
              onChange={(val) => onUpdateQuiz({ cta: { ...quiz.cta, buttonText: val } })}
            />
          )}

          {/* Calendly */}
          {quiz.cta.type === 'calendly' && (
            <div className="space-y-2">
              <InputField
                label="URL de Calendly"
                value={quiz.cta?.calendlyUrl || ''}
                onChange={(val) => onUpdateQuiz({ cta: { ...quiz.cta, calendlyUrl: val } })}
              />
              <p className="text-[11px] text-gray-500">
                Ej: https://calendly.com/tu-usuario/consulta
              </p>
              <div className="bg-indigo-900/30 border border-indigo-700 rounded-lg p-3">
                <p className="text-xs text-indigo-300">
                  El widget de Calendly se mostrará directamente en la pantalla de resultados, sin salir de la página.
                </p>
              </div>
            </div>
          )}

          {/* WhatsApp */}
          {quiz.cta.type === 'whatsapp' && (
            <>
              <InputField
                label="Número de WhatsApp"
                value={quiz.cta?.whatsappNumber || ''}
                onChange={(val) => onUpdateQuiz({ cta: { ...quiz.cta, whatsappNumber: val } })}
              />
              <InputField
                label="Mensaje predefinido"
                value={quiz.cta?.whatsappMessage || ''}
                onChange={(val) => onUpdateQuiz({ cta: { ...quiz.cta, whatsappMessage: val } })}
                multiline
              />
            </>
          )}

          {/* Redirect */}
          {quiz.cta.type === 'redirect' && (
            <InputField
              label="URL de destino"
              value={quiz.cta?.redirectUrl || ''}
              onChange={(val) => onUpdateQuiz({ cta: { ...quiz.cta, redirectUrl: val } })}
            />
          )}

          {/* Custom Link */}
          {quiz.cta.type === 'link' && (
            <>
              <InputField
                label="URL del enlace"
                value={quiz.cta?.linkUrl || ''}
                onChange={(val) => onUpdateQuiz({ cta: { ...quiz.cta, linkUrl: val } })}
              />
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={quiz.cta?.openInNewTab ?? true}
                  onChange={(e) => onUpdateQuiz({ cta: { ...quiz.cta, openInNewTab: e.target.checked } })}
                  className="rounded bg-gray-700 border-gray-600"
                />
                Abrir en nueva pestaña
              </label>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// Lead Form Editor
function LeadFormEditor({ quiz, onUpdateQuiz }) {
  const defaultFields = [
    { key: 'name', label: 'Nombre completo', type: 'text', placeholder: 'Ej: Juan Pérez', required: true, removable: false },
    { key: 'phone', label: 'Teléfono', type: 'tel', placeholder: '+34 600 000 000', required: true, removable: false },
    { key: 'email', label: 'Correo electrónico', type: 'email', placeholder: 'juan@ejemplo.com', required: true, removable: false },
  ];

  const fields = quiz.leadForm?.fields || defaultFields;

  const updateFields = (newFields) => {
    onUpdateQuiz({ leadForm: { ...quiz.leadForm, fields: newFields } });
  };

  const toggleField = (index) => {
    const updated = fields.map((f, i) => i === index ? { ...f, enabled: !(f.enabled ?? true) } : f);
    updateFields(updated);
  };

  const addField = () => {
    updateFields([...fields, {
      key: `custom_${Date.now()}`,
      label: 'Nuevo campo',
      type: 'text',
      placeholder: '',
      required: false,
      removable: true,
      enabled: true,
    }]);
  };

  const updateField = (index, updates) => {
    const updated = fields.map((f, i) => i === index ? { ...f, ...updates } : f);
    updateFields(updated);
  };

  const removeField = (index) => {
    updateFields(fields.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <InputField
        label="Título del Formulario"
        value={quiz.leadForm?.formTitle || ''}
        onChange={(val) => onUpdateQuiz({ leadForm: { ...quiz.leadForm, formTitle: val } })}
      />
      <InputField
        label="Subtítulo"
        value={quiz.leadForm?.formSubtitle || ''}
        onChange={(val) => onUpdateQuiz({ leadForm: { ...quiz.leadForm, formSubtitle: val } })}
        multiline
      />
      <InputField
        label="Texto de Consentimiento"
        value={quiz.leadForm?.consentText || ''}
        onChange={(val) => onUpdateQuiz({ leadForm: { ...quiz.leadForm, consentText: val } })}
        multiline
      />
      <InputField
        label="Texto del Botón"
        value={quiz.leadForm?.submitText || ''}
        onChange={(val) => onUpdateQuiz({ leadForm: { ...quiz.leadForm, submitText: val } })}
      />

      {/* Form Fields */}
      <div className="space-y-2">
        <label className="text-xs text-gray-400 uppercase tracking-wider">Campos del Formulario</label>
        <div className="space-y-2">
          {fields.map((field, idx) => (
            <div key={field.key || idx} className="bg-gray-800 rounded-lg p-2 space-y-1.5">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={field.enabled ?? true}
                  onChange={() => toggleField(idx)}
                  className="rounded bg-gray-700 border-gray-600 shrink-0"
                />
                <input
                  type="text"
                  value={field.label}
                  onChange={(e) => updateField(idx, { label: e.target.value })}
                  className="flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm"
                  placeholder="Nombre del campo"
                />
                {field.removable !== false && (
                  <button
                    onClick={() => removeField(idx)}
                    className="p-1 hover:bg-red-600/20 rounded text-red-400"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
              {(field.enabled ?? true) && (
                <div className="flex items-center gap-2 pl-6">
                  <select
                    value={field.type || 'text'}
                    onChange={(e) => updateField(idx, { type: e.target.value })}
                    className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs"
                  >
                    <option value="text">Texto</option>
                    <option value="email">Email</option>
                    <option value="tel">Teléfono</option>
                    <option value="number">Número</option>
                    <option value="textarea">Texto largo</option>
                  </select>
                  <label className="flex items-center gap-1 text-xs text-gray-400">
                    <input
                      type="checkbox"
                      checked={field.required ?? false}
                      onChange={(e) => updateField(idx, { required: e.target.checked })}
                      className="rounded bg-gray-700 border-gray-600"
                    />
                    Requerido
                  </label>
                </div>
              )}
            </div>
          ))}
        </div>
        <button
          onClick={addField}
          className="w-full p-2 border border-dashed border-gray-600 rounded-lg text-gray-400 hover:text-white hover:border-gray-500 text-sm flex items-center justify-center gap-1.5 transition"
        >
          <Plus size={14} /> Añadir Campo
        </button>
      </div>
    </div>
  );
}

// Tab: Estilo
function StyleTab({ quiz, onUpdateQuiz }) {
  const theme = quiz.theme || { primary: '#4CA994', secondary: '#2C3E50' };

  return (
    <div className="p-4 space-y-4">
      <div className="space-y-3">
        <label className="text-xs text-gray-400 uppercase tracking-wider block">Color Principal</label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={theme.primary}
            onChange={(e) => onUpdateQuiz({ theme: { ...theme, primary: e.target.value }})}
            className="w-12 h-12 rounded-lg cursor-pointer border-2 border-gray-700"
          />
          <input
            type="text"
            value={theme.primary}
            onChange={(e) => onUpdateQuiz({ theme: { ...theme, primary: e.target.value }})}
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-xs text-gray-400 uppercase tracking-wider block">Color Secundario</label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={theme.secondary}
            onChange={(e) => onUpdateQuiz({ theme: { ...theme, secondary: e.target.value }})}
            className="w-12 h-12 rounded-lg cursor-pointer border-2 border-gray-700"
          />
          <input
            type="text"
            value={theme.secondary}
            onChange={(e) => onUpdateQuiz({ theme: { ...theme, secondary: e.target.value }})}
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-xs text-gray-400 uppercase tracking-wider block">Presets de Color</label>
        <div className="grid grid-cols-4 gap-2">
          {['#4CA994', '#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#EF4444', '#6366F1'].map(color => (
            <button
              key={color}
              onClick={() => onUpdateQuiz({ theme: { ...theme, primary: color }})}
              className={`w-full aspect-square rounded-lg border-2 transition ${
                theme.primary === color ? 'border-white scale-110' : 'border-transparent hover:scale-105'
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>

      {/* Analysis/Loader config */}
      <div className="border-t border-gray-700 pt-4 space-y-3">
        <label className="text-xs text-gray-400 uppercase tracking-wider block">Pantalla de Análisis</label>
        <select
          value={quiz.analysis?.animationType || 'spinner'}
          onChange={(e) => onUpdateQuiz({ analysis: { ...quiz.analysis, animationType: e.target.value }})}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm"
        >
          <option value="spinner">Círculo Giratorio</option>
          <option value="progress">Barra de Progreso</option>
          <option value="pulse">Pulso</option>
          <option value="dna">ADN + Progreso</option>
        </select>
        <InputField
          label="Título del Análisis"
          value={quiz.analysis?.title || 'Procesando diagnóstico...'}
          onChange={(val) => onUpdateQuiz({ analysis: { ...quiz.analysis, title: val }})}
        />
        <InputField
          label="Subtítulo del Análisis"
          value={quiz.analysis?.subtitle || ''}
          onChange={(val) => onUpdateQuiz({ analysis: { ...quiz.analysis, subtitle: val }})}
        />

        {/* Analysis steps */}
        <label className="text-[10px] text-gray-500 uppercase tracking-wider block mt-3">Pasos del proceso</label>
        {(quiz.analysis?.steps || [
          { threshold: 20, text: 'Verificando patrón de caída...' },
          { threshold: 50, text: 'Calculando unidades foliculares estimadas...' },
          { threshold: 80, text: 'Generando informe médico...' },
        ]).map((step, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <input
              type="text"
              value={step.text}
              onChange={(e) => {
                const steps = [...(quiz.analysis?.steps || [
                  { threshold: 20, text: 'Verificando patrón de caída...' },
                  { threshold: 50, text: 'Calculando unidades foliculares estimadas...' },
                  { threshold: 80, text: 'Generando informe médico...' },
                ])];
                steps[idx] = { ...steps[idx], text: e.target.value };
                onUpdateQuiz({ analysis: { ...quiz.analysis, steps } });
              }}
              className="flex-1 bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-xs"
              placeholder="Texto del paso..."
            />
            <button
              onClick={() => {
                const steps = [...(quiz.analysis?.steps || [
                  { threshold: 20, text: 'Verificando patrón de caída...' },
                  { threshold: 50, text: 'Calculando unidades foliculares estimadas...' },
                  { threshold: 80, text: 'Generando informe médico...' },
                ])].filter((_, i) => i !== idx);
                onUpdateQuiz({ analysis: { ...quiz.analysis, steps } });
              }}
              className="p-1 hover:bg-red-600/20 rounded text-red-400 shrink-0"
            >
              <Trash2 size={12} />
            </button>
          </div>
        ))}
        <button
          onClick={() => {
            const steps = [...(quiz.analysis?.steps || [
              { threshold: 20, text: 'Verificando patrón de caída...' },
              { threshold: 50, text: 'Calculando unidades foliculares estimadas...' },
              { threshold: 80, text: 'Generando informe médico...' },
            ]), { threshold: 90, text: 'Nuevo paso...' }];
            onUpdateQuiz({ analysis: { ...quiz.analysis, steps } });
          }}
          className="w-full p-1.5 border border-dashed border-gray-600 rounded text-gray-400 hover:text-white text-xs flex items-center justify-center gap-1 transition"
        >
          <Plus size={12} /> Añadir paso
        </button>
      </div>
    </div>
  );
}

// Tab: Settings
function SettingsTab({ quiz, onUpdateQuiz }) {
  return (
    <div className="p-4 space-y-4">
      <div className="space-y-3">
        <label className="text-xs text-gray-400 uppercase tracking-wider block">Slug (URL)</label>
        <div className="flex items-center gap-2">
          <span className="text-gray-500 text-sm">/</span>
          <input
            type="text"
            value={quiz.slug || 'hospital-capilar'}
            onChange={(e) => onUpdateQuiz({ slug: e.target.value })}
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <p className="text-xs text-gray-500">La URL será: tudominio.com/{quiz.slug || 'hospital-capilar'}</p>
      </div>

      <div className="space-y-3">
        <label className="text-xs text-gray-400 uppercase tracking-wider block">Dominio Personalizado</label>
        <input
          type="text"
          value={quiz.customDomain || ''}
          onChange={(e) => onUpdateQuiz({ customDomain: e.target.value })}
          placeholder="quiz.tuempresa.com"
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm"
        />
        <p className="text-xs text-gray-500">Configura un CNAME apuntando a nuestros servidores</p>
      </div>

      <div className="border-t border-gray-700 pt-4 space-y-3">
        <label className="text-xs text-gray-400 uppercase tracking-wider block">Opciones</label>

        <label className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
          <span className="text-sm">Mostrar barra de progreso</span>
          <input
            type="checkbox"
            checked={quiz.settings?.showProgressBar ?? true}
            onChange={(e) => onUpdateQuiz({ settings: { ...quiz.settings, showProgressBar: e.target.checked }})}
            className="rounded bg-gray-700 border-gray-600"
          />
        </label>

        <label className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
          <span className="text-sm">Permitir volver atrás</span>
          <input
            type="checkbox"
            checked={quiz.settings?.allowBack ?? true}
            onChange={(e) => onUpdateQuiz({ settings: { ...quiz.settings, allowBack: e.target.checked }})}
            className="rounded bg-gray-700 border-gray-600"
          />
        </label>

        <label className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
          <span className="text-sm">Requerir consentimiento RGPD</span>
          <input
            type="checkbox"
            checked={quiz.settings?.requireConsent ?? true}
            onChange={(e) => onUpdateQuiz({ settings: { ...quiz.settings, requireConsent: e.target.checked }})}
            className="rounded bg-gray-700 border-gray-600"
          />
        </label>
      </div>

    </div>
  );
}

// Question Editor Component
function QuestionEditor({ question, questionIndex, onUpdate, onDelete }) {
  if (!question) return null;

  return (
    <div className="space-y-3">
      <InputField
        label="Pregunta"
        value={question.title}
        onChange={(val) => onUpdate({ ...question, title: val })}
        multiline
      />
      <InputField
        label="Subtítulo (opcional)"
        value={question.subtitle || ''}
        onChange={(val) => onUpdate({ ...question, subtitle: val })}
      />

      <div className="space-y-2">
        <label className="text-xs text-gray-400 uppercase tracking-wider">Tipo</label>
        <select
          value={question.type || 'single'}
          onChange={(e) => onUpdate({ ...question, type: e.target.value })}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm"
        >
          <option value="single">Selección Única</option>
          <option value="visual">Selección Visual</option>
          <option value="multiple">Selección Múltiple</option>
          <option value="info">Informativa (auto-avance)</option>
        </select>

        {question.type === 'info' && (
          <div className="mt-2">
            <label className="text-xs text-gray-400 uppercase tracking-wider">Segundos para avanzar</label>
            <input
              type="number"
              min="1"
              max="30"
              value={question.autoAdvanceSeconds || 4}
              onChange={(e) => onUpdate({ ...question, autoAdvanceSeconds: parseInt(e.target.value) || 4 })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm mt-1"
            />
          </div>
        )}
      </div>

      {question.type !== 'info' && (
        <div className="space-y-2">
          <label className="text-xs text-gray-400 uppercase tracking-wider">Opciones</label>
          {question.options?.map((opt, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input
                type="text"
                value={opt.icon || ''}
                onChange={(e) => {
                  const newOptions = [...question.options];
                  newOptions[idx] = { ...opt, icon: e.target.value };
                  onUpdate({ ...question, options: newOptions });
                }}
                placeholder="Icon"
                className="w-12 bg-gray-800 border border-gray-700 rounded-lg px-2 py-2 text-sm text-center"
              />
              <input
                type="text"
                value={opt.label}
                onChange={(e) => {
                  const newOptions = [...question.options];
                  newOptions[idx] = { ...opt, label: e.target.value };
                  onUpdate({ ...question, options: newOptions });
                }}
                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm"
              />
              <button
                onClick={() => {
                  const newOptions = question.options.filter((_, i) => i !== idx);
                  onUpdate({ ...question, options: newOptions });
                }}
                className="p-2 hover:bg-red-600/20 rounded text-red-400"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          <button
            onClick={() => {
              const newOptions = [...(question.options || []), { label: 'Nueva opción', icon: '' }];
              onUpdate({ ...question, options: newOptions });
            }}
            className="w-full p-2 border border-dashed border-gray-600 rounded-lg text-gray-400 hover:text-white text-sm flex items-center justify-center gap-1"
          >
            <Plus size={14} /> Añadir Opción
          </button>
        </div>
      )}

      <button
        onClick={onDelete}
        className="w-full p-2 bg-red-600/20 text-red-400 rounded-lg text-sm hover:bg-red-600/30 flex items-center justify-center gap-2"
      >
        <Trash2 size={14} /> Eliminar Pregunta
      </button>
    </div>
  );
}

// Input Field Component
function InputField({ label, value, onChange, multiline, hint }) {
  return (
    <div className="space-y-1">
      <label className="text-xs text-gray-400 uppercase tracking-wider block">{label}</label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm resize-none"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm"
        />
      )}
      {hint && <p className="text-xs text-gray-500">{hint}</p>}
    </div>
  );
}
