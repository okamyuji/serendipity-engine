import { test as setup } from '@playwright/test'

setup('authenticate', async ({ page }) => {
  // 認証が必要なテストの前に実行されるセットアップ
  // 今回はモックなので、localStorageに直接トークンを設定
  await page.goto('/')
  
  // テスト用のトークンを設定（実際のAPIテストでは実際のログインを実行）
  await page.evaluate(() => {
    localStorage.setItem('auth_token', 'test-token-for-e2e')
  })
})
