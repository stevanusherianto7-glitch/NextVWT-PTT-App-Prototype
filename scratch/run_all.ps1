Write-Host "=== 1. test:integration ==="
npm run test:integration

Write-Host "`n=== 2. test:e2e:playwright ==="
npm run test:e2e:playwright

Write-Host "`n=== 3. test:e2e:cypress ==="
$env:CYPRESS_VERIFY_TIMEOUT=120000
npm run test:e2e:cypress

Write-Host "`n=== 4. test ==="
npm test

Write-Host "`n=== 5. lint ==="
npm run lint

Write-Host "`n=== 6. format ==="
npm run format

Write-Host "`n=== 7. clean ==="
npm run clean
