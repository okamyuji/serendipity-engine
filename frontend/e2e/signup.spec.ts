import { expect, test } from '@playwright/test'

test.describe('Signup Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/signup', { waitUntil: 'networkidle' })
    await page.waitForLoadState('domcontentloaded')
  })

  test('should display signup form', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Serendipity Engine' })).toBeVisible()
    await expect(page.getByRole('heading', { name: '新規登録' })).toBeVisible()
    await expect(page.getByLabel('名前（任意）')).toBeVisible()
    await expect(page.getByLabel('メールアドレス')).toBeVisible()
    await expect(page.getByLabel('パスワード（8文字以上）')).toBeVisible()
    await expect(page.getByLabel('パスワード（確認）')).toBeVisible()
    await expect(page.getByRole('button', { name: '登録する' })).toBeVisible()
  })

  test('should show link to login page', async ({ page }) => {
    const loginLink = page.getByRole('link', { name: 'ログイン' })
    await expect(loginLink).toBeVisible()
    await expect(loginLink).toHaveAttribute('href', '/login')
  })

  test('should validate password length', async ({ page }) => {
    const passwordInput = page.getByLabel('パスワード（8文字以上）')
    await expect(passwordInput).toHaveAttribute('minlength', '8')
  })

  test('should show error when passwords do not match', async ({ page }) => {
    await page.getByLabel('メールアドレス').fill('test@example.com')
    await page.getByLabel('パスワード（8文字以上）').fill('password123')
    await page.getByLabel('パスワード（確認）').fill('different123')
    await page.getByRole('button', { name: '登録する' }).click()
    
    await expect(page.getByRole('alert')).toContainText('パスワードが一致しません')
  })

  test('should show loading state when submitting', async ({ page }) => {
    await page.route('**/api/v1/auth/signup', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 100))
      await route.fulfill({
        status: 422,
        body: JSON.stringify({ error: 'Validation failed' }),
      })
    })

    await page.getByLabel('メールアドレス').fill('test@example.com')
    await page.getByLabel('パスワード（8文字以上）').fill('password123')
    await page.getByLabel('パスワード（確認）').fill('password123')
    
    const submitButton = page.getByRole('button', { name: '登録する' })
    await submitButton.click()
    
    await expect(page.getByText('登録中...')).toBeVisible()
  })

  test('should show error message on failed signup', async ({ page }) => {
    await page.route('**/api/v1/auth/signup', async (route) => {
      await route.fulfill({
        status: 422,
        body: JSON.stringify({ error: 'Email has already been taken' }),
      })
    })

    await page.getByLabel('メールアドレス').fill('existing@example.com')
    await page.getByLabel('パスワード（8文字以上）').fill('password123')
    await page.getByLabel('パスワード（確認）').fill('password123')
    await page.getByRole('button', { name: '登録する' }).click()
    
    await expect(page.getByRole('alert')).toContainText('登録に失敗しました')
  })

  test('should navigate to notes page on successful signup', async ({ page }) => {
    await page.route('**/api/v1/auth/signup', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: {
            id: 1,
            email: 'newuser@example.com',
            name: 'New User',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          token: 'new-user-token-123',
        }),
      })
    })

    await page.route('**/api/v1/notes', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      })
    })

    await page.getByLabel('名前（任意）').fill('New User')
    await page.getByLabel('メールアドレス').fill('newuser@example.com')
    await page.getByLabel('パスワード（8文字以上）').fill('password123')
    await page.getByLabel('パスワード（確認）').fill('password123')
    await page.getByRole('button', { name: '登録する' }).click()
    
    await expect(page).toHaveURL('/notes')
  })

  test('should allow signup without name', async ({ page }) => {
    await page.route('**/api/v1/auth/signup', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: {
            id: 1,
            email: 'noname@example.com',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          token: 'no-name-token-123',
        }),
      })
    })

    await page.route('**/api/v1/notes', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      })
    })

    // 名前を入力せずに登録
    await page.getByLabel('メールアドレス').fill('noname@example.com')
    await page.getByLabel('パスワード（8文字以上）').fill('password123')
    await page.getByLabel('パスワード（確認）').fill('password123')
    await page.getByRole('button', { name: '登録する' }).click()
    
    await expect(page).toHaveURL('/notes')
  })
})
