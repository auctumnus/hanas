import { debouncedWatch, get, set } from '@vueuse/core'
import { computed, readonly, ref, Ref, watch } from 'vue'

type validationReturnValue = void | boolean | string

/**
 * Creates a validated input.
 * @param inputRef The input ref to validate.
 * @param validationFn A function which validates the input ref's value.
 * It should return true (or not return) on a valid input, and false
 * (or a string to set the validation error message) on an invalid input.
 * @param debouncedTimer If the validation should be debounced, debounce by
 * this value.
 */
export const useValidation = <T>(
  inputRef: Ref<T>,
  validationFn: (
    value: T,
    oldValue: T,
    setError: (message: string) => void
  ) => validationReturnValue | Promise<validationReturnValue>,
  debouncedTimer?: number
) => {
  const hasError = ref(false)
  const errorMessage = ref('')

  const setError = (message: string) => {
    set(errorMessage, message)
    set(hasError, true)
  }

  const hasValidationError = ref(false)
  const validationErrorMessage = ref('')

  const update = async (newValue: T, oldValue: T) => {
    const validation = await validationFn(newValue, oldValue, setError)
    if (typeof validation === 'string') {
      set(validationErrorMessage, validation)
      set(hasValidationError, true)
    } else if (validation === false) {
      set(validationErrorMessage, '')
      set(hasValidationError, true)
    } else {
      set(validationErrorMessage, '')
      set(hasValidationError, false)
    }
  }

  if (debouncedTimer) {
    debouncedWatch(inputRef, update, { debounce: debouncedTimer })
  } else {
    watch(inputRef, update)
  }

  return {
    ref: inputRef,

    setError,
    clearError() {
      set(errorMessage, '')
      set(hasError, false)
    },

    hasValidationError: readonly(hasValidationError),

    hasError: computed(() => get(hasError) || get(hasValidationError)),

    errorMessage: computed(
      () => get(errorMessage) || get(validationErrorMessage) || ''
    ),
  }
}
