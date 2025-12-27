import { expect, test } from '@playwright/test'

test.describe('Login Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login', { waitUntil: 'networkidle' })
    await page.waitForLoadState('domcontentloaded')
  })

  test('should display login form', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Serendipity Engine' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'ログイン' })).toBeVisible()
    await expect(page.getByLabel('メールアドレス')).toBeVisible()
    await expect(page.getByLabel('パスワード')).toBeVisible()
    await expect(page.getByRole('button', { name: 'ログイン' })).toBeVisible()
  })

  test('should show link to signup page', async ({ page }) => {
    const signupLink = page.getByRole('link', { name: '新規登録' })
    await expect(signupLink).toBeVisible()
    await expect(signupLink).toHaveAttribute('href', '/signup')
  })

  test('should display test account information', async ({ page }) => {
    await expect(page.getByText('💡 テストアカウント')).toBeVisible()
    await expect(page.getByText(/バックエンドで新規ユーザー登録が必要です/)).toBeVisible()
  })

  test('should validate required fields', async ({ page }) => {
    const submitButton = page.getByRole('button', { name: 'ログイン' })
    await submitButton.click()
    
    // HTML5バリデーションが動作することを確認
    const emailInput = page.getByLabel('メールアドレス')
    await expect(emailInput).toHaveAttribute('required', '')
  })

  test('should show loading state when submitting', async ({ page }) => {
    // APIをモック
    await page.route('**/api/v1/auth/login', async (route) => {
      // 遅延を追加してローディング状態を確認
      await new Promise(resolve => setTimeout(resolve, 100))
      await route.fulfill({
        status: 401,
        body: JSON.stringify({ error: 'Invalid credentials' }),
      })
    })

    await page.getByLabel('メールアドレス').fill('test@example.com')
    await page.getByLabel('パスワード').fill('password123')
    
    const submitButton = page.getByRole('button', { name: 'ログイン' })
    await submitButton.click()
    
    // ローディング中の表示を確認
    await expect(page.getByText('ログイン中...')).toBeVisible()
  })

  test('should show error message on failed login', async ({ page }) => {
    // APIをモック
    await page.route('**/api/v1/auth/login', async (route) => {
      await route.fulfill({
        status: 401,
        body: JSON.stringify({ error: 'Invalid credentials' }),
      })
    })

    await page.getByLabel('メールアドレス').fill('wrong@example.com')
    await page.getByLabel('パスワード').fill('wrongpassword')
    await page.getByRole('button', { name: 'ログイン' }).click()
    
    await expect(page.getByRole('alert')).toContainText('ログインに失敗しました')
  })

  test('should navigate to notes page on successful login', async ({ page }) => {
    // APIをモック
    await page.route('**/api/v1/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: {
            id: 1,
            email: 'test@example.com',
            name: 'Test User',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          token: 'test-token-123',
        }),
      })
    })

    // ノート一覧APIもモック
    await page.route('**/api/v1/notes', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      })
    })

    await page.getByLabel('メールアドレス').fill('test@example.com')
    await page.getByLabel('パスワード').fill('password123')
    await page.getByRole('button', { name: 'ログイン' }).click()
    
    // ノートページに遷移することを確認
    await expect(page).toHaveURL('/notes')
  })

  test('should have proper styling and animations', async ({ page }) => {
    // グラデーション背景を確認
    const body = page.locator('body')
    await expect(body).toHaveCSS('background-image', /gradient/)
    
    // カードのスタイルを確認
    const card = page.locator('.card').first()
    await expect(card).toBeVisible()
  })
})
