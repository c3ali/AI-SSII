import { WebSocketMessage, WebSocketMessageType } from "@/types/api"

export class WebSocketClient {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private listeners: Map<string, Set<(message: WebSocketMessage) => void>> = new Map()
  private projectId: string | null = null

  connect(projectId: string) {
    this.projectId = projectId
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000"
    const url = `${wsUrl}/ws/${projectId}`

    try {
      this.ws = new WebSocket(url)

      this.ws.onopen = () => {
        console.log("WebSocket connected")
        this.reconnectAttempts = 0
      }

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data)
          this.handleMessage(message)
        } catch (error) {
          console.error("Failed to parse WebSocket message:", error)
        }
      }

      this.ws.onerror = (error) => {
        console.error("WebSocket error:", error)
      }

      this.ws.onclose = () => {
        console.log("WebSocket disconnected")
        this.attemptReconnect()
      }
    } catch (error) {
      console.error("Failed to connect WebSocket:", error)
      this.attemptReconnect()
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    this.projectId = null
    this.reconnectAttempts = 0
  }

  private attemptReconnect() {
    if (
      this.reconnectAttempts < this.maxReconnectAttempts &&
      this.projectId
    ) {
      this.reconnectAttempts++
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)

      console.log(
        `Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms`
      )

      setTimeout(() => {
        if (this.projectId) {
          this.connect(this.projectId)
        }
      }, delay)
    } else {
      console.error("Max reconnection attempts reached")
    }
  }

  private handleMessage(message: WebSocketMessage) {
    // Notify type-specific listeners
    const typeListeners = this.listeners.get(message.type)
    if (typeListeners) {
      typeListeners.forEach((listener) => listener(message))
    }

    // Notify global listeners
    const globalListeners = this.listeners.get("*")
    if (globalListeners) {
      globalListeners.forEach((listener) => listener(message))
    }
  }

  on(type: WebSocketMessageType | "*", callback: (message: WebSocketMessage) => void) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set())
    }
    this.listeners.get(type)!.add(callback)

    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(type)
      if (listeners) {
        listeners.delete(callback)
      }
    }
  }

  send(type: WebSocketMessageType, payload: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const message: WebSocketMessage = {
        type,
        payload,
        timestamp: new Date().toISOString(),
      }
      this.ws.send(JSON.stringify(message))
    } else {
      console.warn("WebSocket is not connected")
    }
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN
  }
}

// Singleton instance
let wsClient: WebSocketClient | null = null

export function getWebSocketClient(): WebSocketClient {
  if (!wsClient) {
    wsClient = new WebSocketClient()
  }
  return wsClient
}
