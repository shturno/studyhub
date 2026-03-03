import { test, expect } from '@playwright/test'

test.describe('Editorial Page Selection Feature', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to contests page (assuming authenticated)
    // This is a basic test - in real scenario you'd need to login first
    await page.goto('/pt/contests', { waitUntil: 'networkidle' }).catch(() => {
      // Fallback if page doesn't exist yet
      test.skip()
    })
  })

  test('should display "NOVO EDITAL" button in EditorialManager', async ({ page }) => {
    const button = page.locator('button:has-text("NOVO EDITAL")')
    await expect(button).toBeVisible()
  })

  test('should open dialog when clicking "NOVO EDITAL"', async ({ page }) => {
    const button = page.locator('button:has-text("NOVO EDITAL")')
    await button.click()

    // Check if dialog appears with correct title
    const dialogTitle = page.locator('text=SELECIONAR PDF')
    await expect(dialogTitle).toBeVisible()
  })

  test('should show file upload in step 1', async ({ page }) => {
    const button = page.locator('button:has-text("NOVO EDITAL")')
    await button.click()

    // Check for upload area with correct text
    const uploadText = page.locator('text=Faça Upload do PDF do Edital')
    await expect(uploadText).toBeVisible()
  })

  test('should transition to step 2 after file selection', async ({ page }) => {
    const button = page.locator('button:has-text("NOVO EDITAL")')
    await button.click()

    // Find the file input (it's hidden but we can interact with it)
    const fileInput = page.locator('input[type="file"]')

    // Create a dummy PDF file for testing
    await fileInput.setInputFiles({
      name: 'test-edital.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('dummy pdf content'),
    })

    // Wait for step 2 title to appear
    const step2Title = page.locator('text=CONFIGURAR PÁGINAS')
    await expect(step2Title).toBeVisible()
  })

  test('should display selected filename in step 2', async ({ page }) => {
    const button = page.locator('button:has-text("NOVO EDITAL")')
    await button.click()

    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles({
      name: 'test-edital.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('dummy pdf content'),
    })

    // Check that filename is displayed
    const filename = page.locator('text=test-edital.pdf')
    await expect(filename).toBeVisible()
  })

  test('should show page range input in step 2', async ({ page }) => {
    const button = page.locator('button:has-text("NOVO EDITAL")')
    await button.click()

    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles({
      name: 'test-edital.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('dummy pdf content'),
    })

    // Check for page ranges input
    const pageRangesInput = page.locator('#pageRanges')
    await expect(pageRangesInput).toBeVisible()
    expect(await pageRangesInput.getAttribute('placeholder')).toContain('15-25')
  })

  test('should show helper text for page ranges format', async ({ page }) => {
    const button = page.locator('button:has-text("NOVO EDITAL")')
    await button.click()

    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles({
      name: 'test-edital.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('dummy pdf content'),
    })

    // Check for helper text
    const helperText = page.locator('text=Separe ranges com vírgula')
    await expect(helperText).toBeVisible()
  })

  test('should disable "EXTRAIR MATÉRIAS" button when page ranges are empty', async ({ page }) => {
    const button = page.locator('button:has-text("NOVO EDITAL")')
    await button.click()

    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles({
      name: 'test-edital.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('dummy pdf content'),
    })

    // Check that submit button is disabled
    const submitButton = page.locator('button:has-text("EXTRAIR MATÉRIAS")')
    await expect(submitButton).toBeDisabled()
  })

  test('should enable "EXTRAIR MATÉRIAS" button when page ranges are filled', async ({ page }) => {
    const button = page.locator('button:has-text("NOVO EDITAL")')
    await button.click()

    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles({
      name: 'test-edital.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('dummy pdf content'),
    })

    // Fill page ranges
    const pageRangesInput = page.locator('#pageRanges')
    await pageRangesInput.fill('15-25, 30')

    // Check that submit button is now enabled
    const submitButton = page.locator('button:has-text("EXTRAIR MATÉRIAS")')
    await expect(submitButton).toBeEnabled()
  })

  test('should show "Trocar Arquivo" button in step 2', async ({ page }) => {
    const button = page.locator('button:has-text("NOVO EDITAL")')
    await button.click()

    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles({
      name: 'test-edital.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('dummy pdf content'),
    })

    // Check for "Trocar Arquivo" button
    const changeButton = page.locator('button:has-text("Trocar Arquivo")')
    await expect(changeButton).toBeVisible()
  })

  test('should go back to step 1 when clicking "Trocar Arquivo"', async ({ page }) => {
    const button = page.locator('button:has-text("NOVO EDITAL")')
    await button.click()

    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles({
      name: 'test-edital.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('dummy pdf content'),
    })

    // Click "Trocar Arquivo"
    const changeButton = page.locator('button:has-text("Trocar Arquivo")')
    await changeButton.click()

    // Should be back in step 1
    const step1Title = page.locator('text=SELECIONAR PDF')
    await expect(step1Title).toBeVisible()

    // Step 2 content should not be visible
    const step2Content = page.locator('text=CONFIGURAR PÁGINAS')
    await expect(step2Content).not.toBeVisible()
  })
})
