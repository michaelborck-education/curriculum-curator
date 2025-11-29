import { useState, useCallback, ChangeEvent } from 'react';

export type FormErrors<T> = Partial<Record<keyof T, string>>;

export interface UseFormReturn<T extends Record<string, unknown>> {
  values: T;
  errors: FormErrors<T>;
  touched: Partial<Record<keyof T, boolean>>;
  isValid: boolean;
  isDirty: boolean;
  setValue: (name: keyof T, value: T[keyof T]) => void;
  setValues: (values: Partial<T>) => void;
  setError: (name: keyof T, error: string) => void;
  setErrors: (errors: FormErrors<T>) => void;
  clearError: (name: keyof T) => void;
  clearErrors: () => void;
  handleChange: (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
  handleBlur: (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
  reset: (newValues?: T) => void;
  getFieldProps: (name: keyof T) => {
    name: string;
    value: T[keyof T];
    onChange: (
      e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => void;
    onBlur: (
      e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => void;
  };
}

/**
 * Custom hook for form state management.
 * Handles values, errors, touched state, and provides helper functions.
 *
 * @param initialValues - Initial form values
 * @param validate - Optional validation function
 *
 * @example
 * const { values, errors, handleChange, handleBlur, getFieldProps } = useForm({
 *   email: '',
 *   password: ''
 * });
 *
 * <input {...getFieldProps('email')} type="email" />
 */
export function useForm<T extends Record<string, unknown>>(
  initialValues: T,
  validate?: (values: T) => FormErrors<T>
): UseFormReturn<T> {
  const [values, setValuesState] = useState<T>(initialValues);
  const [errors, setErrorsState] = useState<FormErrors<T>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isDirty, setIsDirty] = useState(false);

  const setValue = useCallback((name: keyof T, value: T[keyof T]) => {
    setValuesState(prev => ({ ...prev, [name]: value }));
    setIsDirty(true);
    // Clear error when value changes
    setErrorsState(prev => {
      if (prev[name]) {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      }
      return prev;
    });
  }, []);

  const setValues = useCallback((newValues: Partial<T>) => {
    setValuesState(prev => ({ ...prev, ...newValues }));
    setIsDirty(true);
  }, []);

  const setError = useCallback((name: keyof T, error: string) => {
    setErrorsState(prev => ({ ...prev, [name]: error }));
  }, []);

  const setErrors = useCallback((newErrors: FormErrors<T>) => {
    setErrorsState(newErrors);
  }, []);

  const clearError = useCallback((name: keyof T) => {
    setErrorsState(prev => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
  }, []);

  const clearErrors = useCallback(() => {
    setErrorsState({});
  }, []);

  const handleChange = useCallback(
    (
      e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
      const { name, value, type } = e.target;
      const finalValue =
        type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
      setValue(name as keyof T, finalValue as T[keyof T]);
    },
    [setValue]
  );

  const handleBlur = useCallback(
    (
      e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
      const { name } = e.target;
      setTouched(prev => ({ ...prev, [name]: true }));

      // Run validation on blur if validate function provided
      if (validate) {
        const validationErrors = validate(values);
        if (validationErrors[name as keyof T]) {
          setError(name as keyof T, validationErrors[name as keyof T]!);
        }
      }
    },
    [validate, values, setError]
  );

  const reset = useCallback(
    (newValues?: T) => {
      setValuesState(newValues ?? initialValues);
      setErrorsState({});
      setTouched({});
      setIsDirty(false);
    },
    [initialValues]
  );

  const getFieldProps = useCallback(
    (name: keyof T) => ({
      name: name as string,
      value: values[name],
      onChange: handleChange,
      onBlur: handleBlur,
    }),
    [values, handleChange, handleBlur]
  );

  const isValid = Object.keys(errors).length === 0;

  return {
    values,
    errors,
    touched,
    isValid,
    isDirty,
    setValue,
    setValues,
    setError,
    setErrors,
    clearError,
    clearErrors,
    handleChange,
    handleBlur,
    reset,
    getFieldProps,
  };
}

export default useForm;
