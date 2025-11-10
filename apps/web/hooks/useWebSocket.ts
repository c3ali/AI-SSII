import { useEffect, useRef } from "react"
import { WebSocketMessageType } from "@/types/api"
import { getWebSocketClient } from "@/lib/websocket"
import { useProjectStore } from "@/stores/project-store"

export function useWebSocket(projectId?: string) {
  const wsClient = useRef(getWebSocketClient())
  const handleWebSocketMessage = useProjectStore(
    (state) => state.handleWebSocketMessage
  )

  useEffect(() => {
    if (!projectId) return

    // Connect WebSocket
    wsClient.current.connect(projectId)

    // Subscribe to all messages
    const unsubscribe = wsClient.current.on("*", (message) => {
      handleWebSocketMessage(message)
    })

    // Cleanup
    return () => {
      unsubscribe()
      wsClient.current.disconnect()
    }
  }, [projectId, handleWebSocketMessage])

  return {
    isConnected: wsClient.current.isConnected(),
    send: wsClient.current.send.bind(wsClient.current),
    on: wsClient.current.on.bind(wsClient.current),
  }
}
