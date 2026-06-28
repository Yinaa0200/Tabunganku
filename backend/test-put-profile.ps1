Write-Host "2.2 Update Profile" -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/profile" -Method PUT `
        -Headers $headers `
        -ContentType "application/json" ` # <--- TAMBAHKAN BARIS INI
        -Body (@{
            name = "Test User"
            username = "testuser"
        } | ConvertTo-Json) -UseBasicParsing
        
    $data = $response.Content | ConvertFrom-Json
    LogTest "PROFILE" "/profile" "PUT" "PASS" "Profile updated"
} catch {
    LogTest "PROFILE" "/profile" "PUT" "FAIL" "$($_.Exception.Message)"
}