"use client"

import { useCallback } from "react"
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  addEdge,
  useNodesState,
  useEdgesState,
  Connection,
} from "reactflow"
import "reactflow/dist/style.css"
import { AgentType } from "@/types/project"
import { AGENTS } from "@/types/agent"

const initialNodes: Node[] = [
  {
    id: "architect",
    type: "default",
    position: { x: 250, y: 50 },
    data: {
      label: `${AGENTS[AgentType.ARCHITECT].icon} ${AGENTS[AgentType.ARCHITECT].name}`,
    },
  },
  {
    id: "backend",
    type: "default",
    position: { x: 100, y: 200 },
    data: {
      label: `${AGENTS[AgentType.BACKEND].icon} ${AGENTS[AgentType.BACKEND].name}`,
    },
  },
  {
    id: "frontend",
    type: "default",
    position: { x: 400, y: 200 },
    data: {
      label: `${AGENTS[AgentType.FRONTEND].icon} ${AGENTS[AgentType.FRONTEND].name}`,
    },
  },
  {
    id: "database",
    type: "default",
    position: { x: 250, y: 350 },
    data: {
      label: `${AGENTS[AgentType.DATABASE].icon} ${AGENTS[AgentType.DATABASE].name}`,
    },
  },
  {
    id: "testing",
    type: "default",
    position: { x: 250, y: 500 },
    data: {
      label: `${AGENTS[AgentType.TESTING].icon} ${AGENTS[AgentType.TESTING].name}`,
    },
  },
  {
    id: "deployment",
    type: "default",
    position: { x: 250, y: 650 },
    data: {
      label: `${AGENTS[AgentType.DEPLOYMENT].icon} ${AGENTS[AgentType.DEPLOYMENT].name}`,
    },
  },
]

const initialEdges: Edge[] = [
  { id: "e1", source: "architect", target: "backend", animated: true },
  { id: "e2", source: "architect", target: "frontend", animated: true },
  { id: "e3", source: "architect", target: "database", animated: true },
  { id: "e4", source: "backend", target: "testing" },
  { id: "e5", source: "frontend", target: "testing" },
  { id: "e6", source: "database", target: "testing" },
  { id: "e7", source: "testing", target: "deployment" },
]

export function WorkflowCanvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  return (
    <div className="w-full h-[600px] border rounded-lg">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  )
}
