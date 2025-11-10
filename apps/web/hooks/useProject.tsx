'use client'

import { useState, useCallback } from 'react'
import { initProject, getProjectStatus, type InitProjectRequest, type ProjectStatusResponse } from '@/lib/api'
import { toast } from 'sonner'

export function useProject() {
  const [loading, setLoading] = useState(false)
  const [project, setProject] = useState<ProjectStatusResponse | null>(null)
  const [projectId, setProjectId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const createProject = useCallback(async (data: InitProjectRequest) => {
    setLoading(true)
    setError(null)

    try {
      const response = await initProject(data)
      setProjectId(response.project_id)
      toast.success('Projet créé avec succès !')

      // Start polling project status
      pollProjectStatus(response.project_id)

      return response
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create project'
      setError(message)
      toast.error(message)
      setLoading(false)
      throw err
    }
  }, [])

  const pollProjectStatus = useCallback(async (id: string) => {
    try {
      const status = await getProjectStatus(id)
      setProject(status)

      // Continue polling if not complete
      if (!['deployed', 'failed'].includes(status.status)) {
        setTimeout(() => pollProjectStatus(id), 3000)
      } else {
        setLoading(false)
        if (status.status === 'deployed') {
          toast.success('Projet déployé avec succès !', {
            description: 'Votre application est maintenant en ligne',
          })
        } else {
          toast.error('Le déploiement a échoué')
        }
      }
    } catch (err) {
      console.error('Error polling project status:', err)
      setLoading(false)
    }
  }, [])

  const refreshStatus = useCallback(async () => {
    if (!projectId) return
    try {
      const status = await getProjectStatus(projectId)
      setProject(status)
    } catch (err) {
      console.error('Error refreshing status:', err)
    }
  }, [projectId])

  return {
    loading,
    project,
    projectId,
    error,
    createProject,
    refreshStatus,
  }
}
