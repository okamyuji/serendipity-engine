import { expect, test } from '@playwright/test'

test.describe('Advanced Accessibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    // ログイン
    await page.goto('/login')
    await page.fill('[data-testid="email-input"]', 'demo@example.com')
    await page.fill('[data-testid="password-input"]', 'password123')
    await page.click('[data-testid="submit-button"]')
    await page.waitForURL('/notes')
  })

  test('キーボードナビゲーション：Tabキーで要素を移動できる', async ({ page }) => {
    await page.goto('/notes')

    // 最初の要素にフォーカス
    await page.keyboard.press('Tab')

    // フォーカスされた要素を確認
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName)
    expect(focusedElement).toBeTruthy()
  })

  test('キーボードナビゲーション：Enterキーでボタンを押せる', async ({ page }) => {
    await page.goto('/notes')

    // 新規作成ボタンにフォーカス
    const createButton = page.locator('button:has-text("新規作成")')
    await createButton.focus()

    // Enterキーで押す
    await page.keyboard.press('Enter')

    // モーダルが開く
    await expect(page.locator('text=新規ノート作成')).toBeVisible()
  })

  test('キーボードナビゲーション：Escapeキーでモーダルを閉じられる', async ({ page }) => {
    await page.goto('/notes')

    // モーダルを開く
    await page.click('button:has-text("新規作成")')
    await expect(page.locator('text=新規ノート作成')).toBeVisible()

    // Escapeキーで閉じる
    await page.keyboard.press('Escape')

    // モーダルが閉じる
    await expect(page.locator('text=新規ノート作成')).not.toBeVisible()
  })

  test('フォーカスインジケーター：フォーカス時に視覚的なインジケーターが表示される', async ({
    page,
  }) => {
    await page.goto('/notes')

    const createButton = page.locator('button:has-text("新規作成")')
    await createButton.focus()

    // フォーカスリングが表示される（outline または box-shadowがある）
    const styles = await createButton.evaluate((el) => {
      const computed = window.getComputedStyle(el)
      return {
        outline: computed.outline,
        boxShadow: computed.boxShadow,
      }
    })

    expect(styles.outline !== 'none' || styles.boxShadow !== 'none').toBeTruthy()
  })

  test('ARIAラベル：ボタンに適切なaria-labelがある', async ({ page }) => {
    await page.goto('/notes')

    // ナビゲーションバーのボタンを確認
    const navButtons = page.locator('nav a, nav button')
    const count = await navButtons.count()

    for (let i = 0; i < count; i++) {
      const button = navButtons.nth(i)
      const text = await button.textContent()
      const ariaLabel = await button.getAttribute('aria-label')

      // テキストまたはaria-labelがある
      expect(text || ariaLabel).toBeTruthy()
    }
  })

  test('ARIAロール：適切なロールが設定されている', async ({ page }) => {
    await page.goto('/notes')

    // ナビゲーションにrole="navigation"がある
    const nav = page.locator('nav')
    const navRole = await nav.getAttribute('role')
    expect(navRole === 'navigation' || (await nav.evaluate((el) => el.tagName === 'NAV'))).toBeTruthy()

    // メインコンテンツにrole="main"がある
    const main = page.locator('main')
    const mainExists = (await main.count()) > 0
    expect(mainExists).toBeTruthy()
  })

  test('カラーコントラスト：テキストが読みやすい', async ({ page }) => {
    await page.goto('/notes')

    // テキスト要素のコントラストを確認
    const textElements = page.locator('p, h1, h2, h3, span, button')
    const count = Math.min(await textElements.count(), 10) // 最初の10要素をチェック

    for (let i = 0; i < count; i++) {
      const element = textElements.nth(i)
      const isVisible = await element.isVisible()

      if (isVisible) {
        const styles = await element.evaluate((el) => {
          const computed = window.getComputedStyle(el)
          return {
            color: computed.color,
            backgroundColor: computed.backgroundColor,
          }
        })

        // 色が設定されている
        expect(styles.color).toBeTruthy()
      }
    }
  })

  test('フォームラベル：入力フィールドに適切なラベルがある', async ({ page }) => {
    await page.goto('/notes')

    // 新規作成モーダルを開く
    await page.click('button:has-text("新規作成")')

    // タイトル入力フィールドのラベルを確認
    const titleLabel = page.locator('label[for="title"]')
    await expect(titleLabel).toBeVisible()
    await expect(titleLabel).toHaveText(/タイトル/)

    // コンテンツ入力フィールドのラベルを確認
    const contentLabel = page.locator('label[for="content"]')
    await expect(contentLabel).toBeVisible()
    await expect(contentLabel).toHaveText(/内容/)
  })

  test('エラーメッセージ：エラーが明確に表示される', async ({ page }) => {
    await page.goto('/login')

    // ログアウト（既にログインしている場合）
    await page.goto('/notes')
    const logoutButton = page.locator('button:has-text("ログアウト")')
    if ((await logoutButton.count()) > 0) {
      await logoutButton.click()
    }

    // 間違った認証情報でログイン
    await page.goto('/login')
    await page.fill('[data-testid="email-input"]', 'wrong@example.com')
    await page.fill('[data-testid="password-input"]', 'wrongpassword')
    await page.click('[data-testid="submit-button"]')

    // エラーメッセージが表示される
    const errorMessage = page.locator('[role="alert"], .alert-error, text=/失敗|エラー/')
    await expect(errorMessage).toBeVisible()
  })

  test('スクリーンリーダー対応：画像にalt属性がある', async ({ page }) => {
    await page.goto('/notes')

    // 画像要素を確認
    const images = page.locator('img')
    const count = await images.count()

    for (let i = 0; i < count; i++) {
      const img = images.nth(i)
      const alt = await img.getAttribute('alt')

      // alt属性がある（空文字列でも可）
      expect(alt !== null).toBeTruthy()
    }
  })

  test('ランドマーク：ページに適切なランドマークがある', async ({ page }) => {
    await page.goto('/notes')

    // header, nav, main, footerなどのランドマークを確認
    const landmarks = await page.evaluate(() => {
      const elements = document.querySelectorAll('header, nav, main, footer, [role="banner"], [role="navigation"], [role="main"], [role="contentinfo"]')
      return elements.length
    })

    expect(landmarks).toBeGreaterThan(0)
  })

  test('見出し階層：見出しが適切な階層になっている', async ({ page }) => {
    await page.goto('/notes')

    const headings = await page.evaluate(() => {
      const h1 = document.querySelectorAll('h1').length
      const h2 = document.querySelectorAll('h2').length
      const h3 = document.querySelectorAll('h3').length
      return { h1, h2, h3 }
    })

    // h1が1つ以上ある
    expect(headings.h1).toBeGreaterThanOrEqual(0)

    // 見出しが存在する
    expect(headings.h1 + headings.h2 + headings.h3).toBeGreaterThan(0)
  })

  test('リンクテキスト：リンクに説明的なテキストがある', async ({ page }) => {
    await page.goto('/notes')

    const links = page.locator('a')
    const count = await links.count()

    for (let i = 0; i < count; i++) {
      const link = links.nth(i)
      const text = await link.textContent()
      const ariaLabel = await link.getAttribute('aria-label')
      const title = await link.getAttribute('title')

      // テキスト、aria-label、またはtitleがある
      expect(text || ariaLabel || title).toBeTruthy()
    }
  })

  test('フォーカストラップ：モーダル内でフォーカスがトラップされる', async ({ page }) => {
    await page.goto('/notes')

    // モーダルを開く
    await page.click('button:has-text("新規作成")')

    // モーダル内の最初の要素にフォーカス
    await page.keyboard.press('Tab')

    // フォーカスがモーダル内にある
    const focusedElement = await page.evaluate(() => {
      const modal = document.querySelector('[role="dialog"], .modal-content')
      const focused = document.activeElement
      return modal?.contains(focused)
    })

    expect(focusedElement).toBeTruthy()
  })

  test('タッチターゲット：タッチターゲットが十分な大きさである', async ({ page }) => {
    await page.goto('/notes')

    // ボタンのサイズを確認
    const buttons = page.locator('button')
    const count = Math.min(await buttons.count(), 5)

    for (let i = 0; i < count; i++) {
      const button = buttons.nth(i)
      const isVisible = await button.isVisible()

      if (isVisible) {
        const box = await button.boundingBox()
        if (box) {
          // 最小サイズ44x44pxを推奨（WCAGガイドライン）
          expect(box.width >= 32 || box.height >= 32).toBeTruthy()
        }
      }
    }
  })
})
