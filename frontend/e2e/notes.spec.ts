import { expect, test } from '@playwright/test'

test.describe('Notes Page', () => {
  test.beforeEach(async ({ page }) => {
    // 認証済み状態をセットアップ
    await page.goto('/', { waitUntil: 'networkidle' })
    await page.waitForLoadState('domcontentloaded')
    await page.evaluate(() => {
      localStorage.setItem('auth_token', 'test-token')
    })
  })

  test('should redirect to login when not authenticated', async ({ page }) => {
    // トークンをクリア
    await page.evaluate(() => {
      localStorage.removeItem('auth_token')
    })
    
    await page.goto('/notes')
    await expect(page).toHaveURL('/login')
  })

  test('should display notes page header', async ({ page }) => {
    await page.route('**/api/v1/notes', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      })
    })

    await page.goto('/notes')
    
    await expect(page.getByRole('heading', { name: 'Serendipity Engine' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'ノート一覧' })).toBeVisible()
    await expect(page.getByText('あなたのナレッジを探索しましょう')).toBeVisible()
  })

  test('should display logout button', async ({ page }) => {
    await page.route('**/api/v1/notes', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      })
    })

    await page.goto('/notes')
    
    const logoutButton = page.getByRole('button', { name: 'ログアウト' })
    await expect(logoutButton).toBeVisible()
  })

  test('should show loading state', async ({ page }) => {
    await page.route('**/api/v1/notes', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 100))
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      })
    })

    await page.goto('/notes')
    
    await expect(page.getByText('読み込み中...')).toBeVisible()
  })

  test('should display empty state when no notes', async ({ page }) => {
    await page.route('**/api/v1/notes', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      })
    })

    await page.goto('/notes')
    
    await expect(page.getByText('ノートがありません')).toBeVisible()
    await expect(page.getByText('最初のノートを作成してみましょう')).toBeVisible()
    await expect(page.getByRole('button', { name: 'ノートを作成' })).toBeVisible()
  })

  test('should display notes in grid layout', async ({ page }) => {
    const mockNotes = [
      {
        id: 1,
        user_id: 1,
        title: 'テストノート1',
        content: 'これはテストノート1の内容です。',
        content_html: '<p>これはテストノート1の内容です。</p>',
        access_count: 5,
        last_accessed_at: new Date().toISOString(),
        pinned: false,
        archived: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 2,
        user_id: 1,
        title: 'テストノート2',
        content: 'これはテストノート2の内容です。',
        content_html: '<p>これはテストノート2の内容です。</p>',
        access_count: 10,
        last_accessed_at: new Date().toISOString(),
        pinned: true,
        archived: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ]

    await page.route('**/api/v1/notes', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockNotes),
      })
    })

    await page.goto('/notes')
    
    await expect(page.getByText('テストノート1')).toBeVisible()
    await expect(page.getByText('テストノート2')).toBeVisible()
  })

  test('should display note card with correct information', async ({ page }) => {
    const mockNote = {
      id: 1,
      user_id: 1,
      title: '詳細テストノート',
      content: 'これは詳細テストノートの内容です。長いコンテンツをテストするための文章です。',
      content_html: '<p>これは詳細テストノートの内容です。</p>',
      access_count: 15,
      last_accessed_at: '2024-01-15T10:00:00Z',
      pinned: true,
      archived: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    await page.route('**/api/v1/notes', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([mockNote]),
      })
    })

    await page.goto('/notes')
    
    await expect(page.getByText('詳細テストノート')).toBeVisible()
    await expect(page.getByText(/これは詳細テストノートの内容です/)).toBeVisible()
    await expect(page.getByText('📌 ピン留め')).toBeVisible()
    await expect(page.getByText(/15回/)).toBeVisible()
  })

  test('should show error state on API failure', async ({ page }) => {
    await page.route('**/api/v1/notes', async (route) => {
      await route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Internal Server Error' }),
      })
    })

    await page.goto('/notes')
    
    await expect(page.getByText('エラーが発生しました')).toBeVisible()
    await expect(page.getByText('ノートの読み込みに失敗しました')).toBeVisible()
    await expect(page.getByRole('button', { name: '再読み込み' })).toBeVisible()
  })

  test('should have responsive grid layout', async ({ page }) => {
    const mockNotes = Array.from({ length: 6 }, (_, i) => ({
      id: i + 1,
      user_id: 1,
      title: `ノート${i + 1}`,
      content: `内容${i + 1}`,
      content_html: `<p>内容${i + 1}</p>`,
      access_count: i,
      pinned: false,
      archived: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }))

    await page.route('**/api/v1/notes', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockNotes),
      })
    })

    await page.goto('/notes')
    
    // グリッドレイアウトを確認
    const grid = page.locator('.notes-grid, [class*="grid"]').first()
    await expect(grid).toBeVisible()
  })

  test('should display note cards with hover effects', async ({ page }) => {
    const mockNote = {
      id: 1,
      user_id: 1,
      title: 'ホバーテスト',
      content: 'ホバーエフェクトのテスト',
      content_html: '<p>ホバーエフェクトのテスト</p>',
      access_count: 1,
      pinned: false,
      archived: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    await page.route('**/api/v1/notes', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([mockNote]),
      })
    })

    await page.goto('/notes')
    
    const noteCard = page.locator('[data-testid="note-card-1"]')
    await expect(noteCard).toBeVisible()
    
    // カードにcard-hoverクラスがあることを確認
    await expect(noteCard).toHaveClass(/card-hover/)
  })
})
