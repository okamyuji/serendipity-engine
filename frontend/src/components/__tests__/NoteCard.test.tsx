import { NoteCard } from '@/components/NoteCard'
import { createMockNote } from '@/test/factories'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

describe('NoteCard', () => {
    it('displays note title and content', () => {
        const note = createMockNote({
            title: 'Test Note Title',
            content: 'This is the test content for the note.',
        })

        render(<NoteCard note={note} />)

        expect(screen.getByText('Test Note Title')).toBeInTheDocument()
        expect(screen.getByText(/This is the test content/)).toBeInTheDocument()
    })

    it('displays access count', () => {
        const note = createMockNote({ access_count: 5 })

        render(<NoteCard note={note} />)

        expect(screen.getByText(/5回/)).toBeInTheDocument()
    })

    it('displays pinned badge when note is pinned', () => {
        const note = createMockNote({ pinned: true })

        render(<NoteCard note={note} />)

        expect(screen.getByText(/ピン留め/)).toBeInTheDocument()
    })

    it('does not display pinned badge when note is not pinned', () => {
        const note = createMockNote({ pinned: false })

        render(<NoteCard note={note} />)

        expect(screen.queryByText(/ピン留め/)).not.toBeInTheDocument()
    })

    it('calls onClick when clicked', async () => {
        const note = createMockNote()
        const onClick = vi.fn()
        const user = userEvent.setup()

        render(<NoteCard note={note} onClick={onClick} />)

        await user.click(screen.getByTestId(`note-card-${note.id}`))

        expect(onClick).toHaveBeenCalledTimes(1)
    })
})
