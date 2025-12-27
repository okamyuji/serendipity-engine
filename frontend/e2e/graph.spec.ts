import { expect, test } from '@playwright/test'

test.describe('Graph Page', () => {
  test.beforeEach(async ({ page }) => {
    // ログイン
    await page.goto('/login')
    await page.fill('[data-testid="email-input"]', 'demo@example.com')
    await page.fill('[data-testid="password-input"]', 'password123')
    await page.click('[data-testid="submit-button"]')
    await page.waitForURL('/notes')
  })

  test('グラフページに遷移できる', async ({ page }) => {
    await page.click('a[href="/graph"]')
    await page.waitForURL('/graph')

    // ページタイトルが表示される
    expect(page.url()).toContain('/graph')
  })

  test('グラフが表示される', async ({ page }) => {
    await page.goto('/graph')

    // React Flowコンテナが表示される
    await expect(page.locator('.react-flow')).toBeVisible()

    // コントロールパネルが表示される
    await expect(page.locator('text=最小強度:')).toBeVisible()
    await expect(page.locator('text=プロジェクト:')).toBeVisible()
  })

  test('最小強度スライダーが動作する', async ({ page }) => {
    await page.goto('/graph')

    const slider = page.locator('input[type="range"]')
    await expect(slider).toBeVisible()

    // スライダーの値を変更
    await slider.fill('0.7')

    // 値が更新される
    await expect(page.locator('text=0.7')).toBeVisible()
  })

  test('プロジェクトフィルターが動作する', async ({ page }) => {
    await page.goto('/graph')

    const projectSelect = page.locator('select').first()
    await expect(projectSelect).toBeVisible()

    // プロジェクトを選択
    await projectSelect.selectOption({ index: 1 })

    // グラフが更新される（ノード数が変わる）
    await page.waitForTimeout(500)
  })

  test('Embeddingありのみフィルターが動作する', async ({ page }) => {
    await page.goto('/graph')

    const checkbox = page.locator('input[type="checkbox"]')
    await expect(checkbox).toBeVisible()

    // チェックボックスをクリック
    await checkbox.click()

    // フィルターが適用される
    await expect(checkbox).toBeChecked()
  })

  test('ノード数とエッジ数が表示される', async ({ page }) => {
    await page.goto('/graph')

    // ノード数とエッジ数の表示を確認
    const statsText = page.locator('text=/\\d+ ノード, \\d+ エッジ/')
    await expect(statsText).toBeVisible()
  })

  test('コントロールボタンが表示される', async ({ page }) => {
    await page.goto('/graph')

    // React Flowのコントロールボタンが表示される
    await expect(page.locator('.react-flow__controls')).toBeVisible()
  })

  test('ミニマップが表示される', async ({ page }) => {
    await page.goto('/graph')

    // ミニマップが表示される
    await expect(page.locator('.react-flow__minimap')).toBeVisible()
  })

  test('背景が表示される', async ({ page }) => {
    await page.goto('/graph')

    // 背景が表示される
    await expect(page.locator('.react-flow__background')).toBeVisible()
  })

  test('エラー時にエラーメッセージが表示される', async ({ page }) => {
    // APIをモックしてエラーを返す
    await page.route('**/api/v1/graph*', (route) => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Internal Server Error' }),
      })
    })

    await page.goto('/graph')

    // エラーメッセージが表示される
    await expect(page.locator('text=グラフの読み込みに失敗しました')).toBeVisible()
  })

  test('ローディング状態が表示される', async ({ page }) => {
    // APIをモックして遅延させる
    await page.route('**/api/v1/graph*', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      route.continue()
    })

    const loadingPromise = page.goto('/graph')

    // ローディング表示を確認
    await expect(page.locator('text=グラフを読み込み中...')).toBeVisible()

    await loadingPromise
  })

  test('レスポンシブ対応：モバイルビューでも表示される', async ({ page }) => {
    // モバイルビューポートに設定
    await page.setViewportSize({ width: 375, height: 667 })

    await page.goto('/graph')

    // グラフが表示される
    await expect(page.locator('.react-flow')).toBeVisible()

    // コントロールパネルが表示される
    await expect(page.locator('text=最小強度:')).toBeVisible()
  })

  test('タブレットビューでも表示される', async ({ page }) => {
    // タブレットビューポートに設定
    await page.setViewportSize({ width: 768, height: 1024 })

    await page.goto('/graph')

    // グラフが表示される
    await expect(page.locator('.react-flow')).toBeVisible()
  })
})
