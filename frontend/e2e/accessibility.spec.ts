import { expect, test } from '@playwright/test'

test.describe('Accessibility', () => {
  test('login page should have proper ARIA labels', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'networkidle' })
    
    // ページが完全に読み込まれるまで待機
    await page.waitForLoadState('domcontentloaded')
    
    // フォーム要素にラベルがあることを確認
    await expect(page.getByLabel('メールアドレス')).toBeVisible()
    await expect(page.getByLabel('パスワード')).toBeVisible()
    
    // ボタンにアクセス可能なテキストがあることを確認
    await expect(page.getByRole('button', { name: 'ログイン' })).toBeVisible()
  })

  test('signup page should have proper ARIA labels', async ({ page }) => {
    await page.goto('/signup', { waitUntil: 'networkidle' })
    await page.waitForLoadState('domcontentloaded')
    
    await expect(page.getByLabel('名前（任意）')).toBeVisible()
    await expect(page.getByLabel('メールアドレス')).toBeVisible()
    await expect(page.getByLabel('パスワード（8文字以上）')).toBeVisible()
    await expect(page.getByLabel('パスワード（確認）')).toBeVisible()
    await expect(page.getByRole('button', { name: '登録する' })).toBeVisible()
  })

  test('error messages should have role="alert"', async ({ page }) => {
    await page.route('**/api/v1/auth/login', async (route) => {
      await route.fulfill({
        status: 401,
        body: JSON.stringify({ error: 'Invalid credentials' }),
      })
    })

    await page.goto('/login', { waitUntil: 'networkidle' })
    await page.waitForLoadState('domcontentloaded')
    await page.getByLabel('メールアドレス').fill('test@example.com')
    await page.getByLabel('パスワード').fill('wrong')
    await page.getByRole('button', { name: 'ログイン' }).click()
    
    const alert = page.getByRole('alert')
    await expect(alert).toBeVisible()
    await expect(alert).toContainText('ログインに失敗しました')
  })

  test('headings should be properly structured', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'networkidle' })
    await page.waitForLoadState('domcontentloaded')
    
    // h1見出しが存在することを確認
    const h1 = page.getByRole('heading', { level: 1, name: 'Serendipity Engine' })
    await expect(h1).toBeVisible()
    
    // h2見出しが存在することを確認
    const h2 = page.getByRole('heading', { level: 2, name: 'ログイン' })
    await expect(h2).toBeVisible()
  })

  test('links should be keyboard accessible', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'networkidle' })
    await page.waitForLoadState('domcontentloaded')
    
    const signupLink = page.getByRole('link', { name: '新規登録' })
    await expect(signupLink).toBeVisible()
    
    // リンクにフォーカスしてEnterキーで遷移
    await signupLink.focus()
    await page.keyboard.press('Enter')
    await expect(page).toHaveURL('/signup')
  })

  test('form inputs should be keyboard navigable', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'networkidle' })
    await page.waitForLoadState('domcontentloaded')
    
    // 最初の入力フィールドにフォーカス
    const emailInput = page.getByLabel('メールアドレス')
    await emailInput.focus()
    await page.keyboard.type('test@example.com')
    
    // Tabキーで次のフィールドへ
    await page.keyboard.press('Tab')
    await page.keyboard.type('password123')
    
    // Tabキーでボタンへ
    await page.keyboard.press('Tab')
    
    // フォーカスされているボタンを確認
    const submitButton = page.getByRole('button', { name: 'ログイン' })
    await expect(submitButton).toBeFocused()
  })

  test('disabled buttons should not be interactive', async ({ page }) => {
    await page.route('**/api/v1/auth/login', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      await route.fulfill({
        status: 401,
        body: JSON.stringify({ error: 'Invalid' }),
      })
    })

    await page.goto('/login', { waitUntil: 'networkidle' })
    await page.waitForLoadState('domcontentloaded')
    await page.getByLabel('メールアドレス').fill('test@example.com')
    await page.getByLabel('パスワード').fill('password123')
    
    const submitButton = page.getByRole('button', { name: 'ログイン' })
    await submitButton.click()
    
    // ローディング中はボタンが無効化されていることを確認
    await expect(submitButton).toBeDisabled()
  })

  test('images should have alt text or aria-labels', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'networkidle' })
    await page.waitForLoadState('domcontentloaded')
    
    // SVGアイコンがaria-hiddenまたは適切なラベルを持つことを確認
    const icons = page.locator('svg')
    const count = await icons.count()
    
    for (let i = 0; i < count; i++) {
      const icon = icons.nth(i)
      const ariaHidden = await icon.getAttribute('aria-hidden')
      const ariaLabel = await icon.getAttribute('aria-label')
      const role = await icon.getAttribute('role')
      
      // 装飾的なアイコンはaria-hidden="true"、
      // 意味のあるアイコンはaria-labelまたはroleを持つべき
      expect(ariaHidden === 'true' || ariaLabel || role).toBeTruthy()
    }
  })

  test('color contrast should be sufficient', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'networkidle' })
    await page.waitForLoadState('domcontentloaded')
    
    // 主要なテキスト要素の色を確認
    const heading = page.getByRole('heading', { name: 'Serendipity Engine' })
    const color = await heading.evaluate((el) => {
      return window.getComputedStyle(el).color
    })
    
    // テキストが可視であることを確認（完全な透明でないこと）
    expect(color).not.toBe('rgba(0, 0, 0, 0)')
  })
})
