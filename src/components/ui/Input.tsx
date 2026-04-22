import styled from 'styled-components'

interface InputWrapperProps {
  hasError?: boolean
}

export const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  width: 100%;
`

export const InputLabel = styled.label`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  color: ${({ theme }) => theme.colors.navy};
`

export const StyledInput = styled.input<InputWrapperProps>`
  width: 100%;
  padding: 10px 14px;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.md};
  color: ${({ theme }) => theme.colors.navy};
  background-color: ${({ theme }) => theme.colors.white};
  border: 2px solid
    ${({ theme, hasError }) =>
      hasError ? theme.colors.error : theme.colors.gray[200]};
  border-radius: ${({ theme }) => theme.radii.md};
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
  outline: none;

  &::placeholder {
    color: ${({ theme }) => theme.colors.gray[400]};
  }

  &:focus {
    border-color: ${({ theme, hasError }) =>
      hasError ? theme.colors.error : theme.colors.primary};
    box-shadow: 0 0 0 3px
      ${({ hasError }) =>
        hasError
          ? 'rgba(211, 47, 47, 0.15)'
          : 'rgba(255, 192, 0, 0.25)'};
  }

  &:disabled {
    background-color: ${({ theme }) => theme.colors.gray[100]};
    color: ${({ theme }) => theme.colors.gray[400]};
    cursor: not-allowed;
  }
`

export const InputError = styled.span`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.error};
`

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, id, ...props }: InputFieldProps) {
  return (
    <InputWrapper>
      {label && <InputLabel htmlFor={id}>{label}</InputLabel>}
      <StyledInput id={id} hasError={!!error} {...props} />
      {error && <InputError role="alert">{error}</InputError>}
    </InputWrapper>
  )
}
