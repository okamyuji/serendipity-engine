import App from '@/App'
import { useAuthStore } from '@/stores/authStore'
import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

describe('App', () => {
    beforeEach(() => {
        localStorage.clear()
        useAuthStore.getState().clearAuth()
    })

    it('redirects to login when not authenticated', () => {
        render(<App />)

        expect(screen.getByRole('heading', { name: 'ログイン' })).toBeInTheDocument()
    })

    it('renders app component', () => {
        const { container } = render(<App />)

        expect(container).toBeTruthy()
    })
})
