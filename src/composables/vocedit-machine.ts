import { provide, inject } from 'vue'
import { useMachine } from '@xstate/vue'
import { voceditMachine } from '@/state/vocedit-machine'
import type { CreateResourceManagerReturn } from '@/types'
import type { Router } from 'vue-router'

type VocEditMachine = ReturnType<typeof voceditMachine>
type UseMachineReturn = ReturnType<typeof useMachine<VocEditMachine>>

const VOCEDIT_MACHINE_KEY = Symbol('vocedit-machine')

export function createVocEditMachine(resourceManager: CreateResourceManagerReturn, router: Router) {
  const machine = useMachine(
    voceditMachine({
      resourceManager,
      fileHandle: null,
      resourceToDelete: null,
      router,
      githubUser: null,
      github: null,
    }),
  )
  provide(VOCEDIT_MACHINE_KEY, machine)

  return machine
}

export const useVocEditMachine = (): UseMachineReturn => {
  const machine = inject(VOCEDIT_MACHINE_KEY) as UseMachineReturn

  if (!machine) {
    throw new Error('VocEdit machine not found')
  }

  return machine
}
