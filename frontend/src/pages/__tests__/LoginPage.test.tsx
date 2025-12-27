import { authApi } from '@/api/auth'
import { LoginPage } from '@/pages/LoginPage'
import { createMockUser } from '@/test/factories'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/api/auth')
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom')
    return {
        ...actual,
        useNavigate: () => vi.fn(),
    }
})

describe('LoginPage', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        localStorage.clear()
    })

    const renderLoginPage = () => {
        return render(
            <BrowserRouter>
                <LoginPage />
            </BrowserRouter>
        )
    }

    it('renders login form', () => {
        renderLoginPage()

        expect(screen.getByRole('heading', { name: 'ログイン' })).toBeInTheDocument()
        expect(screen.getByLabelText('メールアドレス')).toBeInTheDocument()
        expect(screen.getByLabelText('パスワード')).toBeInTheDocument()
        expect(screen.getByTestId('submit-button')).toBeInTheDocument()
    })

    it('submits form with email and password', async () => {
        const user = userEvent.setup()
        const mockUser = createMockUser({ email: 'test@example.com' })
        const mockResponse = { user: mockUser, token: 'test-token' }

        vi.mocked(authApi.login).mockResolvedValue(mockResponse)

        renderLoginPage()

        await user.type(screen.getByTestId('email-input'), 'test@example.com')
        await user.type(screen.getByTestId('password-input'), 'password123')
        await user.click(screen.getByTestId('submit-button'))

        await waitFor(() => {
            expect(authApi.login).toHaveBeenCalledWith({
                email: 'test@example.com',
                password: 'password123',
            })
        })
    })

    it('displays error message on login failure', async () => {
        const user = userEvent.setup()
        vi.mocked(authApi.login).mockRejectedValue(new Error('Login failed'))

        renderLoginPage()

        await user.type(screen.getByTestId('email-input'), 'test@example.com')
        await user.type(screen.getByTestId('password-input'), 'wrong-password')
        await user.click(screen.getByTestId('submit-button'))

        await waitFor(() => {
            expect(screen.getByRole('alert')).toHaveTextContent('ログインに失敗しました')
        })
    })

    it('disables submit button while loading', async () => {
        const user = userEvent.setup()
        vi.mocked(authApi.login).mockImplementation(
            () => new Promise((resolve) => setTimeout(resolve, 100))
        )

        renderLoginPage()

        await user.type(screen.getByTestId('email-input'), 'test@example.com')
        await user.type(screen.getByTestId('password-input'), 'password123')

        const submitButton = screen.getByTestId('submit-button')
        await user.click(submitButton)

        expect(submitButton).toBeDisabled()
        expect(submitButton).toHaveTextContent('ログイン中...')
    })
})
