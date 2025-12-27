import { expect, test } from '@playwright/test'

test.describe('Navigation', () => {
  test('should redirect root to notes page when authenticated', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })
    await page.waitForLoadState('domcontentloaded')
    await page.evaluate(() => {
      localStorage.setItem('auth_token', 'test-token')
    })

    await page.route('**/api/v1/notes', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      })
    })

    await page.goto('/')
    await expect(page).toHaveURL('/notes')
  })

  test('should redirect root to login page when not authenticated', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })
    await page.waitForLoadState('domcontentloaded')
    await page.evaluate(() => {
      localStorage.removeItem('auth_token')
    })

    await page.goto('/', { waitUntil: 'networkidle' })
    await expect(page).toHaveURL('/login')
  })

  test('should navigate from login to signup', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'networkidle' })
    await page.getByRole('link', { name: '新規登録' }).click()
    await expect(page).toHaveURL('/signup')
  })

  test('should navigate from signup to login', async ({ page }) => {
    await page.goto('/signup', { waitUntil: 'networkidle' })
    await page.getByRole('link', { name: 'ログイン' }).click()
    await expect(page).toHaveURL('/login')
  })

  test('should maintain authentication state across page reloads', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })
    await page.waitForLoadState('domcontentloaded')
    await page.evaluate(() => {
      localStorage.setItem('auth_token', 'test-token')
    })

    await page.route('**/api/v1/notes', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      })
    })

    await page.goto('/notes')
    await expect(page).toHaveURL('/notes')

    // ページをリロード
    await page.reload()
    
    // 認証状態が維持されていることを確認
    await expect(page).toHaveURL('/notes')
  })

  test('should clear authentication on logout', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })
    await page.waitForLoadState('domcontentloaded')
    await page.evaluate(() => {
      localStorage.setItem('auth_token', 'test-token')
    })

    await page.route('**/api/v1/notes', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      })
    })

    await page.goto('/notes')
    
    // ログアウトボタンをクリック
    await page.getByRole('button', { name: 'ログアウト' }).click()
    
    // ログインページにリダイレクトされることを確認
    await expect(page).toHaveURL('/login')
    
    // localStorageからトークンが削除されていることを確認
    const token = await page.evaluate(() => localStorage.getItem('auth_token'))
    expect(token).toBeNull()
  })
})
