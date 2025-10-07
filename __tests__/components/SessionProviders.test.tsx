import { render, screen } from '@testing-library/react'
import SessionProviders from '@/components/SessionProviders'

describe('SessionProviders', () => {
  it('renders children wrapped with SessionProvider', () => {
    render(
      <SessionProviders>
        <div data-testid="test-child">Test Content</div>
      </SessionProviders>
    )

    expect(screen.getByTestId('test-child')).toBeInTheDocument()
    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('applies SessionProvider wrapper correctly', () => {
    const { container } = render(
      <SessionProviders>
        <span>Child Component</span>
      </SessionProviders>
    )

    expect(container.querySelector('span')).toBeInTheDocument()
    expect(container.querySelector('span')).toHaveTextContent('Child Component')
  })
})