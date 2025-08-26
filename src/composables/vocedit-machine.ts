import { provide, inject } from 'vue'
import { useMachine } from '@xstate/vue'
import { voceditMachine } from '@/vocedit-machine'

type UseMachineReturn = ReturnType<typeof useMachine<typeof voceditMachine>>

const VOCEDIT_MACHINE_KEY = Symbol('vocedit-machine')

export function createVocEditMachine() {
  const machine = useMachine(voceditMachine)
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
