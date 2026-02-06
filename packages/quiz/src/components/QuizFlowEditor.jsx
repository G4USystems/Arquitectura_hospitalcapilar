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
  MessageSquare,
  GitBranch,
  CheckCircle,
  Trash2,
  Settings,
} from 'lucide-react';

// ============================================
// CUSTOM NODE COMPONENTS
// ============================================

// Start Node - Punto de inicio del quiz
function StartNode({ data }) {
  return (
    <div className="bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-lg min-w-[150px]">
      <Handle type="source" position={Position.Bottom} className="!bg-emerald-400 !w-3 !h-3" />
      <div className="flex items-center gap-2">
        <Play size={18} />
        <span className="font-bold">Inicio</span>
      </div>
      <div className="text-xs mt-1 opacity-80">{data.label || 'Comenzar Quiz'}</div>
    </div>
  );
}

// Question Node - Nodo de pregunta
function QuestionNode({ data, selected }) {
  return (
    <div className={`bg-white border-2 rounded-xl shadow-lg min-w-[200px] max-w-[280px] ${selected ? 'border-blue-500' : 'border-gray-200'}`}>
      <Handle type="target" position={Position.Top} className="!bg-gray-400 !w-3 !h-3" />

      <div className="bg-blue-500 text-white px-3 py-2 rounded-t-lg flex items-center gap-2">
        <MessageSquare size={16} />
        <span className="font-medium text-sm">Pregunta {data.questionIndex + 1}</span>
      </div>

      <div className="p-3">
        <p className="text-sm font-medium text-gray-800 line-clamp-2">{data.title}</p>

        {/* Options with individual handles */}
        <div className="mt-3 space-y-1">
          {data.options?.map((opt, idx) => (
            <div key={idx} className="relative flex items-center">
              <div className="flex-1 text-xs bg-gray-100 px-2 py-1.5 rounded text-gray-600 truncate">
                {opt.icon && <span className="mr-1">{opt.icon}</span>}
                {opt.label}
              </div>
              <Handle
                type="source"
                position={Position.Right}
                id={`option-${idx}`}
                className="!bg-blue-400 !w-2.5 !h-2.5 !right-[-6px]"
                style={{ top: 'auto' }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Condition Node - Nodo de condición/branch
function ConditionNode({ data, selected }) {
  return (
    <div className={`bg-amber-50 border-2 rounded-xl shadow-lg min-w-[180px] ${selected ? 'border-amber-500' : 'border-amber-200'}`}>
      <Handle type="target" position={Position.Top} className="!bg-amber-400 !w-3 !h-3" />

      <div className="bg-amber-500 text-white px-3 py-2 rounded-t-lg flex items-center gap-2">
        <GitBranch size={16} />
        <span className="font-medium text-sm">Condición</span>
      </div>

      <div className="p-3">
        <p className="text-sm text-gray-700">{data.condition || 'Si cumple...'}</p>

        <div className="mt-3 flex justify-between text-xs">
          <div className="relative">
            <span className="bg-green-100 text-green-700 px-2 py-1 rounded">Sí</span>
            <Handle
              type="source"
              position={Position.Bottom}
              id="yes"
              className="!bg-green-500 !w-2.5 !h-2.5"
              style={{ left: '25%' }}
            />
          </div>
          <div className="relative">
            <span className="bg-red-100 text-red-700 px-2 py-1 rounded">No</span>
            <Handle
              type="source"
              position={Position.Bottom}
              id="no"
              className="!bg-red-500 !w-2.5 !h-2.5"
              style={{ left: '75%' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Result Node - Nodo de resultado final
function ResultNode({ data, selected }) {
  const bgColor = data.type === 'success' ? 'bg-green-50 border-green-200' :
                  data.type === 'warning' ? 'bg-amber-50 border-amber-200' :
                  'bg-blue-50 border-blue-200';
  const headerColor = data.type === 'success' ? 'bg-green-500' :
                      data.type === 'warning' ? 'bg-amber-500' :
                      'bg-blue-500';

  return (
    <div className={`border-2 rounded-xl shadow-lg min-w-[180px] ${bgColor} ${selected ? '!border-purple-500' : ''}`}>
      <Handle type="target" position={Position.Top} className="!bg-gray-400 !w-3 !h-3" />

      <div className={`${headerColor} text-white px-3 py-2 rounded-t-lg flex items-center gap-2`}>
        <CheckCircle size={16} />
        <span className="font-medium text-sm">Resultado</span>
      </div>

      <div className="p-3">
        <p className="text-sm font-medium text-gray-800">{data.title || 'Resultado'}</p>
        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{data.description || 'Descripción...'}</p>
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

export default function QuizFlowEditor({ questions, flow, onUpdateFlow, onClose }) {
  // Convert questions to initial nodes if no flow exists
  const initialNodes = useMemo(() => {
    if (flow?.nodes?.length > 0) return flow.nodes;

    // Create default linear flow from questions
    const nodes = [
      {
        id: 'start',
        type: 'start',
        position: { x: 250, y: 0 },
        data: { label: 'Comenzar Quiz' },
      },
    ];

    questions.forEach((q, idx) => {
      nodes.push({
        id: `question-${q.id}`,
        type: 'question',
        position: { x: 200, y: 120 + (idx * 220) },
        data: {
          questionId: q.id,
          questionIndex: idx,
          title: q.title,
          options: q.options,
        },
      });
    });

    // Add default result at the end
    nodes.push({
      id: 'result-default',
      type: 'result',
      position: { x: 250, y: 120 + (questions.length * 220) },
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

    // Create default linear edges
    const edges = [
      {
        id: 'start-to-q0',
        source: 'start',
        target: `question-${questions[0]?.id}`,
        markerEnd: { type: MarkerType.ArrowClosed },
      },
    ];

    questions.forEach((q, idx) => {
      if (idx < questions.length - 1) {
        // Connect to next question (all options go to same next question by default)
        q.options?.forEach((_, optIdx) => {
          edges.push({
            id: `q${idx}-opt${optIdx}-to-q${idx + 1}`,
            source: `question-${q.id}`,
            sourceHandle: `option-${optIdx}`,
            target: `question-${questions[idx + 1].id}`,
            markerEnd: { type: MarkerType.ArrowClosed },
            style: { stroke: '#94a3b8' },
          });
        });
      } else {
        // Last question connects to result
        q.options?.forEach((_, optIdx) => {
          edges.push({
            id: `q${idx}-opt${optIdx}-to-result`,
            source: `question-${q.id}`,
            sourceHandle: `option-${optIdx}`,
            target: 'result-default',
            markerEnd: { type: MarkerType.ArrowClosed },
            style: { stroke: '#94a3b8' },
          });
        });
      }
    });

    return edges;
  }, [questions, flow]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState(null);

  // Handle new connections
  const onConnect = useCallback((params) => {
    setEdges((eds) => addEdge({
      ...params,
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { stroke: '#94a3b8' },
    }, eds));
  }, [setEdges]);

  // Handle node selection
  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node);
  }, []);

  // Add new result node
  const addResultNode = () => {
    const newNode = {
      id: `result-${Date.now()}`,
      type: 'result',
      position: { x: 500, y: 300 },
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
      position: { x: 500, y: 200 },
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white w-full h-full max-w-[95vw] max-h-[95vh] rounded-2xl flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gray-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <GitBranch size={24} className="text-purple-400" />
            <h2 className="font-bold text-xl">Editor de Flujo del Quiz</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={addConditionNode}
              className="px-3 py-2 bg-amber-600 hover:bg-amber-700 rounded-lg text-sm flex items-center gap-2"
            >
              <GitBranch size={16} />
              Añadir Condición
            </button>
            <button
              onClick={addResultNode}
              className="px-3 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm flex items-center gap-2"
            >
              <Plus size={16} />
              Añadir Resultado
            </button>
            {selectedNode && selectedNode.type !== 'start' && (
              <button
                onClick={deleteSelectedNode}
                className="px-3 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm flex items-center gap-2"
              >
                <Trash2 size={16} />
                Eliminar
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-lg transition ml-4"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Flow Canvas */}
        <div className="flex-1 flex">
          <div className="flex-1">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={onNodeClick}
              nodeTypes={nodeTypes}
              fitView
              className="bg-gray-50"
            >
              <Background color="#ddd" gap={20} />
              <Controls />
            </ReactFlow>
          </div>

          {/* Side Panel for selected node */}
          {selectedNode && (
            <div className="w-80 bg-gray-100 border-l border-gray-200 p-4 overflow-y-auto">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Settings size={18} />
                Configuración
              </h3>

              {selectedNode.type === 'question' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-gray-500 uppercase">Pregunta</label>
                    <p className="text-sm font-medium">{selectedNode.data.title}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase">Opciones</label>
                    <div className="mt-2 space-y-2">
                      {selectedNode.data.options?.map((opt, idx) => (
                        <div key={idx} className="text-sm bg-white p-2 rounded border">
                          <span className="text-blue-500 mr-2">→</span>
                          {opt.label}
                        </div>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-gray-400">
                    Conecta cada opción a diferentes preguntas o resultados arrastrando desde los puntos azules.
                  </p>
                </div>
              )}

              {selectedNode.type === 'result' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-gray-500 uppercase block mb-1">Tipo</label>
                    <select
                      value={selectedNode.data.type}
                      onChange={(e) => {
                        setNodes((nds) => nds.map((n) =>
                          n.id === selectedNode.id
                            ? { ...n, data: { ...n.data, type: e.target.value } }
                            : n
                        ));
                      }}
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                    >
                      <option value="success">Éxito (Verde)</option>
                      <option value="warning">Advertencia (Ámbar)</option>
                      <option value="info">Información (Azul)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase block mb-1">Título</label>
                    <input
                      type="text"
                      value={selectedNode.data.title}
                      onChange={(e) => {
                        setNodes((nds) => nds.map((n) =>
                          n.id === selectedNode.id
                            ? { ...n, data: { ...n.data, title: e.target.value } }
                            : n
                        ));
                      }}
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase block mb-1">Descripción</label>
                    <textarea
                      value={selectedNode.data.description}
                      onChange={(e) => {
                        setNodes((nds) => nds.map((n) =>
                          n.id === selectedNode.id
                            ? { ...n, data: { ...n.data, description: e.target.value } }
                            : n
                        ));
                      }}
                      rows={3}
                      className="w-full border rounded-lg px-3 py-2 text-sm resize-none"
                    />
                  </div>
                </div>
              )}

              {selectedNode.type === 'condition' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-gray-500 uppercase block mb-1">Condición</label>
                    <textarea
                      value={selectedNode.data.condition}
                      onChange={(e) => {
                        setNodes((nds) => nds.map((n) =>
                          n.id === selectedNode.id
                            ? { ...n, data: { ...n.data, condition: e.target.value } }
                            : n
                        ));
                      }}
                      rows={3}
                      placeholder="Ej: Si edad > 25 años"
                      className="w-full border rounded-lg px-3 py-2 text-sm resize-none"
                    />
                  </div>
                  <p className="text-xs text-gray-400">
                    Conecta "Sí" y "No" a diferentes caminos.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-100 p-4 flex justify-between items-center border-t">
          <div className="text-sm text-gray-500">
            <span className="font-medium">{nodes.length}</span> nodos ·
            <span className="font-medium ml-1">{edges.length}</span> conexiones
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={saveFlow}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium"
            >
              Guardar Flujo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
