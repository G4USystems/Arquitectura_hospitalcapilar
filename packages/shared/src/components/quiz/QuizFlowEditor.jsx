import { useState, useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Handle,
  Position,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  X,
  Plus,
  Play,
  GitBranch,
  Trash2,
  Settings,
  Trophy,
  AlertTriangle,
  Info,
  FileQuestion,
} from 'lucide-react';

// ============================================
// CUSTOM NODE COMPONENTS
// ============================================

// Start Node
function StartNode({ data }) {
  return (
    <div className="bg-emerald-600 text-white rounded-2xl shadow-xl min-w-[200px] overflow-hidden">
      <Handle type="source" position={Position.Bottom} className="!bg-white !w-4 !h-4 !border-2 !border-emerald-600" />
      <div className="px-5 py-4 flex items-center gap-3">
        <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
          <Play size={20} />
        </div>
        <div>
          <div className="font-bold text-base">Inicio</div>
          <div className="text-xs opacity-80">{data.label || 'Comenzar Quiz'}</div>
        </div>
      </div>
    </div>
  );
}

// Option colors for visual distinction
const optionColors = [
  { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', handle: '#3b82f6', dot: '!bg-blue-500' },
  { bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-700', handle: '#8b5cf6', dot: '!bg-violet-500' },
  { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', handle: '#f59e0b', dot: '!bg-amber-500' },
  { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700', handle: '#f43f5e', dot: '!bg-rose-500' },
  { bg: 'bg-teal-50', border: 'border-teal-200', text: 'text-teal-700', handle: '#14b8a6', dot: '!bg-teal-500' },
  { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', handle: '#f97316', dot: '!bg-orange-500' },
];

// Question Node
function QuestionNode({ data, selected }) {
  const isInfo = data.questionType === 'info';
  return (
    <div className={`bg-white rounded-2xl shadow-xl overflow-hidden transition-shadow ${selected ? 'ring-3 ring-blue-400 shadow-blue-200' : ''}`} style={{ minWidth: 280, maxWidth: 400 }}>
      <Handle type="target" position={Position.Top} className="!bg-gray-400 !w-4 !h-4 !border-2 !border-white" />

      {/* Header */}
      <div className={`text-white px-4 py-3 flex items-center gap-3 ${isInfo ? 'bg-gradient-to-r from-teal-600 to-teal-500' : 'bg-gradient-to-r from-blue-600 to-blue-500'}`}>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${isInfo ? 'bg-teal-400/40' : 'bg-blue-400/40'}`}>
          {isInfo ? '⏱' : data.questionIndex + 1}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[11px] uppercase tracking-wider opacity-70 font-medium">
            {isInfo ? 'Pantalla Info' : 'Pregunta'}
          </div>
          <div className="text-sm font-semibold truncate">{data.title}</div>
        </div>
      </div>

      {/* Subtitle */}
      {data.subtitle && (
        <div className="px-4 pt-2 pb-1">
          <p className="text-xs text-gray-400 italic truncate">{data.subtitle}</p>
        </div>
      )}

      {/* Options or auto-advance indicator */}
      <div className="p-3 space-y-1.5">
        {isInfo ? (
          <div className="relative pr-5">
            <div className="bg-teal-50 border border-teal-200 rounded-lg px-3 py-2 text-center">
              <span className="text-xs font-medium text-teal-700">Auto-avance ({data.autoAdvanceSeconds || 4}s)</span>
            </div>
            <Handle
              type="source"
              position={Position.Right}
              id="auto"
              className="!bg-teal-500 !w-3.5 !h-3.5 !border-2 !border-white !right-0"
            />
          </div>
        ) : (
          <>
            <div className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold px-1">
              Opciones ({data.options?.length || 0})
            </div>
            {data.options?.map((opt, idx) => {
              const color = optionColors[idx % optionColors.length];
              return (
                <div key={idx} className="relative pr-5">
                  <div className={`flex items-center gap-2 ${color.bg} ${color.border} border rounded-lg px-3 py-2 overflow-hidden`}>
                    {opt.icon && <span className="text-sm shrink-0">{opt.icon}</span>}
                    <span className={`text-sm font-medium ${color.text} truncate`}>{opt.label}</span>
                  </div>
                  <Handle
                    type="source"
                    position={Position.Right}
                    id={`option-${idx}`}
                    className={`${color.dot} !w-3.5 !h-3.5 !border-2 !border-white !right-0`}
                  />
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}

// Condition Node
function ConditionNode({ data, selected }) {
  return (
    <div className={`bg-white rounded-2xl shadow-xl overflow-hidden transition-shadow ${selected ? 'ring-3 ring-amber-400 shadow-amber-200' : ''}`} style={{ minWidth: 240 }}>
      <Handle type="target" position={Position.Top} className="!bg-gray-400 !w-4 !h-4 !border-2 !border-white" />

      <div className="bg-gradient-to-r from-amber-500 to-amber-400 text-white px-4 py-3 flex items-center gap-2">
        <GitBranch size={18} />
        <span className="font-bold text-sm">Condición</span>
      </div>

      <div className="p-4">
        <p className="text-sm text-gray-700 font-medium">{data.condition || 'Si cumple...'}</p>

        <div className="mt-4 flex gap-3">
          <div className="flex-1 relative">
            <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-center">
              <span className="text-sm font-bold text-green-700">Sí</span>
            </div>
            <Handle
              type="source"
              position={Position.Bottom}
              id="yes"
              className="!bg-green-500 !w-3.5 !h-3.5 !border-2 !border-white"
              style={{ left: '50%' }}
            />
          </div>
          <div className="flex-1 relative">
            <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-center">
              <span className="text-sm font-bold text-red-700">No</span>
            </div>
            <Handle
              type="source"
              position={Position.Bottom}
              id="no"
              className="!bg-red-500 !w-3.5 !h-3.5 !border-2 !border-white"
              style={{ left: '50%' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Result Node
function ResultNode({ data, selected }) {
  const styles = {
    success: {
      gradient: 'from-green-600 to-green-500',
      bg: 'bg-green-50',
      icon: <Trophy size={18} />,
      ring: 'ring-green-400 shadow-green-200',
    },
    warning: {
      gradient: 'from-amber-600 to-amber-500',
      bg: 'bg-amber-50',
      icon: <AlertTriangle size={18} />,
      ring: 'ring-amber-400 shadow-amber-200',
    },
    info: {
      gradient: 'from-blue-600 to-blue-500',
      bg: 'bg-blue-50',
      icon: <Info size={18} />,
      ring: 'ring-blue-400 shadow-blue-200',
    },
  };
  const s = styles[data.type] || styles.success;

  return (
    <div className={`bg-white rounded-2xl shadow-xl overflow-hidden transition-shadow ${selected ? `ring-3 ${s.ring}` : ''}`} style={{ minWidth: 260 }}>
      <Handle type="target" position={Position.Top} className="!bg-gray-400 !w-4 !h-4 !border-2 !border-white" />

      <div className={`bg-gradient-to-r ${s.gradient} text-white px-4 py-3 flex items-center gap-2`}>
        {s.icon}
        <span className="font-bold text-sm">Resultado</span>
      </div>

      <div className={`p-4 ${s.bg}`}>
        <p className="text-base font-bold text-gray-800">{data.title || 'Resultado'}</p>
        <p className="text-sm text-gray-500 mt-1">{data.description || 'Descripción...'}</p>
      </div>
    </div>
  );
}

// Node types mapping
const nodeTypes = {
  start: StartNode,
  question: QuestionNode,
  condition: ConditionNode,
  result: ResultNode,
};

// ============================================
// MAIN FLOW EDITOR COMPONENT
// ============================================

export default function QuizFlowEditor({ questions, flow, onUpdateFlow, onAddQuestion, onClose }) {
  // Convert questions to initial nodes if no flow exists
  const initialNodes = useMemo(() => {
    if (flow?.nodes?.length > 0) return flow.nodes;

    const nodes = [
      {
        id: 'start',
        type: 'start',
        position: { x: 300, y: 0 },
        data: { label: 'Comenzar Quiz' },
      },
    ];

    let yOffset = 120;
    questions.forEach((q, idx) => {
      const isInfo = q.type === 'info';
      const optionCount = isInfo ? 1 : (q.options?.length || 2);
      const nodeHeight = 100 + (optionCount * 40);

      nodes.push({
        id: `question-${q.id}`,
        type: 'question',
        position: { x: 250, y: yOffset },
        data: {
          questionId: q.id,
          questionIndex: idx,
          questionType: q.type,
          title: q.title,
          subtitle: q.subtitle,
          options: q.options,
          autoAdvanceSeconds: q.autoAdvanceSeconds,
        },
      });

      yOffset += nodeHeight + 50;
    });

    nodes.push({
      id: 'result-default',
      type: 'result',
      position: { x: 300, y: yOffset },
      data: {
        type: 'success',
        title: 'Resultado Final',
        description: 'El usuario completó el quiz',
      },
    });

    return nodes;
  }, [questions, flow]);

  const initialEdges = useMemo(() => {
    if (flow?.edges?.length > 0) return flow.edges;

    const edges = [];

    // Connect start to first question
    if (questions.length > 0) {
      edges.push({
        id: 'start-to-q0',
        source: 'start',
        target: `question-${questions[0].id}`,
        markerEnd: { type: MarkerType.ArrowClosed, color: '#6b7280' },
        style: { stroke: '#6b7280', strokeWidth: 2 },
        animated: true,
      });
    }

    // Connect each question's options to the NEXT question (linear flow by default)
    questions.forEach((q, idx) => {
      const targetId = idx < questions.length - 1
        ? `question-${questions[idx + 1].id}`
        : 'result-default';

      if (q.type === 'info') {
        // Info screens: single auto connection
        edges.push({
          id: `q${idx}-auto`,
          source: `question-${q.id}`,
          sourceHandle: 'auto',
          target: targetId,
          markerEnd: { type: MarkerType.ArrowClosed, color: '#14b8a6' },
          style: { stroke: '#14b8a6', strokeWidth: 2 },
          animated: true,
        });
      } else {
        // Connect ALL options to next (user can re-route them)
        q.options?.forEach((_, optIdx) => {
          const color = optionColors[optIdx % optionColors.length];
          edges.push({
            id: `q${idx}-opt${optIdx}`,
            source: `question-${q.id}`,
            sourceHandle: `option-${optIdx}`,
            target: targetId,
            markerEnd: { type: MarkerType.ArrowClosed, color: color.handle },
            style: { stroke: color.handle, strokeWidth: 2 },
          });
        });
      }
    });

    return edges;
  }, [questions, flow]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState(null);

  // Handle new connections - remove old edge from same sourceHandle first
  const onConnect = useCallback((params) => {
    setEdges((eds) => {
      // Remove any existing edge from the same source+sourceHandle
      const filtered = eds.filter(
        (e) => !(e.source === params.source && e.sourceHandle === params.sourceHandle)
      );
      return addEdge({
        ...params,
        markerEnd: { type: MarkerType.ArrowClosed, color: '#6b7280' },
        style: { stroke: '#6b7280', strokeWidth: 2 },
      }, filtered);
    });
  }, [setEdges]);

  const onNodeClick = useCallback((_event, node) => {
    setSelectedNode(node);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  // Add a new question node
  const handleAddQuestion = async () => {
    if (onAddQuestion) {
      await onAddQuestion();
    }
    // Add a placeholder node (real data comes from Firestore on next render)
    const newId = `question-new-${Date.now()}`;
    const newNode = {
      id: newId,
      type: 'question',
      position: { x: 700, y: 200 },
      data: {
        questionId: newId,
        questionIndex: nodes.filter(n => n.type === 'question').length,
        questionType: 'single',
        title: 'Nueva pregunta',
        subtitle: '',
        options: [
          { label: 'Opción 1', icon: '' },
          { label: 'Opción 2', icon: '' },
        ],
      },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  // Add new result node
  const addResultNode = () => {
    const newNode = {
      id: `result-${Date.now()}`,
      type: 'result',
      position: { x: 700, y: 300 },
      data: {
        type: 'success',
        title: 'Nuevo Resultado',
        description: 'Descripción del resultado',
      },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  // Add condition node
  const addConditionNode = () => {
    const newNode = {
      id: `condition-${Date.now()}`,
      type: 'condition',
      position: { x: 700, y: 200 },
      data: {
        condition: 'Si la respuesta es...',
      },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  // Delete selected node
  const deleteSelectedNode = () => {
    if (!selectedNode || selectedNode.type === 'start') return;
    setNodes((nds) => nds.filter((n) => n.id !== selectedNode.id));
    setEdges((eds) => eds.filter((e) => e.source !== selectedNode.id && e.target !== selectedNode.id));
    setSelectedNode(null);
  };

  // Save flow
  const saveFlow = () => {
    onUpdateFlow({ nodes, edges });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white w-full h-full max-w-[96vw] max-h-[96vh] rounded-2xl flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gray-900 text-white px-5 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
              <GitBranch size={20} />
            </div>
            <div>
              <h2 className="font-bold text-lg">Editor de Flujo</h2>
              <p className="text-xs text-gray-400">Arrastra desde los puntos de color de cada opción hacia otra pregunta o resultado</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleAddQuestion}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium flex items-center gap-2 transition"
            >
              <FileQuestion size={16} />
              Pregunta
            </button>
            <button
              onClick={addConditionNode}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 rounded-lg text-sm font-medium flex items-center gap-2 transition"
            >
              <GitBranch size={16} />
              Condición
            </button>
            <button
              onClick={addResultNode}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-medium flex items-center gap-2 transition"
            >
              <Plus size={16} />
              Resultado
            </button>
            {selectedNode && selectedNode.type !== 'start' && (
              <button
                onClick={deleteSelectedNode}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium flex items-center gap-2 transition"
              >
                <Trash2 size={16} />
              </button>
            )}
            <div className="w-px h-8 bg-gray-700 mx-2" />
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-lg transition"
            >
              <X size={22} />
            </button>
          </div>
        </div>

        {/* Flow Canvas */}
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={onNodeClick}
              onPaneClick={onPaneClick}
              nodeTypes={nodeTypes}
              connectionMode="loose"
              fitView
              fitViewOptions={{ padding: 0.2 }}
              className="bg-slate-50"
              defaultEdgeOptions={{
                style: { strokeWidth: 2 },
                markerEnd: { type: MarkerType.ArrowClosed },
              }}
            >
              <Background color="#e2e8f0" gap={24} size={1} />
              <Controls position="bottom-left" />
            </ReactFlow>
          </div>

          {/* Side Panel for selected node */}
          {selectedNode && (
            <div className="w-80 bg-gray-50 border-l border-gray-200 flex flex-col shrink-0">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="font-bold text-base flex items-center gap-2">
                  <Settings size={16} />
                  Propiedades
                </h3>
                <button onClick={() => setSelectedNode(null)} className="p-1 hover:bg-gray-200 rounded">
                  <X size={16} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                {selectedNode.type === 'question' && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs text-gray-500 uppercase font-semibold">Pregunta {selectedNode.data.questionIndex + 1}</label>
                      <p className="text-sm font-medium mt-1">{selectedNode.data.title}</p>
                    </div>
                    {selectedNode.data.questionType === 'info' ? (
                      <div className="bg-teal-50 border border-teal-200 rounded-lg p-3">
                        <p className="text-xs text-teal-700">
                          Pantalla informativa. Avanza automáticamente después de <strong>{selectedNode.data.autoAdvanceSeconds || 4}</strong> segundos. Conecta la salida al siguiente paso.
                        </p>
                      </div>
                    ) : (
                      <>
                        <div>
                          <label className="text-xs text-gray-500 uppercase font-semibold">Opciones</label>
                          <div className="mt-2 space-y-2">
                            {selectedNode.data.options?.map((opt, idx) => {
                              const color = optionColors[idx % optionColors.length];
                              return (
                                <div key={idx} className={`text-sm ${color.bg} ${color.border} border rounded-lg px-3 py-2 flex items-center gap-2`}>
                                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color.handle }} />
                                  {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                                  <span className={`${color.text} font-medium`}>{opt.label}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <p className="text-xs text-blue-700">
                            <strong>Tip:</strong> Arrastra desde el punto de color de cada opción y suéltalo sobre otra pregunta o resultado para crear caminos diferentes.
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {selectedNode.type === 'result' && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs text-gray-500 uppercase font-semibold block mb-1">Tipo</label>
                      <select
                        value={selectedNode.data.type}
                        onChange={(e) => {
                          setNodes((nds) => nds.map((n) =>
                            n.id === selectedNode.id
                              ? { ...n, data: { ...n.data, type: e.target.value } }
                              : n
                          ));
                          setSelectedNode(prev => ({ ...prev, data: { ...prev.data, type: e.target.value } }));
                        }}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      >
                        <option value="success">Éxito (Verde)</option>
                        <option value="warning">Advertencia (Ámbar)</option>
                        <option value="info">Información (Azul)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 uppercase font-semibold block mb-1">Título</label>
                      <input
                        type="text"
                        value={selectedNode.data.title}
                        onChange={(e) => {
                          setNodes((nds) => nds.map((n) =>
                            n.id === selectedNode.id
                              ? { ...n, data: { ...n.data, title: e.target.value } }
                              : n
                          ));
                          setSelectedNode(prev => ({ ...prev, data: { ...prev.data, title: e.target.value } }));
                        }}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 uppercase font-semibold block mb-1">Descripción</label>
                      <textarea
                        value={selectedNode.data.description}
                        onChange={(e) => {
                          setNodes((nds) => nds.map((n) =>
                            n.id === selectedNode.id
                              ? { ...n, data: { ...n.data, description: e.target.value } }
                              : n
                          ));
                          setSelectedNode(prev => ({ ...prev, data: { ...prev.data, description: e.target.value } }));
                        }}
                        rows={3}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none"
                      />
                    </div>
                  </div>
                )}

                {selectedNode.type === 'condition' && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs text-gray-500 uppercase font-semibold block mb-1">Condición</label>
                      <textarea
                        value={selectedNode.data.condition}
                        onChange={(e) => {
                          setNodes((nds) => nds.map((n) =>
                            n.id === selectedNode.id
                              ? { ...n, data: { ...n.data, condition: e.target.value } }
                              : n
                          ));
                          setSelectedNode(prev => ({ ...prev, data: { ...prev.data, condition: e.target.value } }));
                        }}
                        rows={3}
                        placeholder="Ej: Si edad > 25 años"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none"
                      />
                    </div>
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                      <p className="text-xs text-amber-700">
                        Conecta <strong className="text-green-700">Sí</strong> y <strong className="text-red-700">No</strong> a diferentes caminos.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-100 px-5 py-3 flex justify-between items-center border-t shrink-0">
          <div className="text-sm text-gray-500 flex items-center gap-4">
            <span><strong>{nodes.length}</strong> nodos</span>
            <span><strong>{edges.length}</strong> conexiones</span>
            <span className="text-xs text-gray-400">| Ctrl + rueda para zoom | Arrastra puntos para conectar</span>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium text-sm transition"
            >
              Cancelar
            </button>
            <button
              onClick={saveFlow}
              className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium text-sm transition"
            >
              Guardar Flujo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
