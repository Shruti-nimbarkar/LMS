# Script to copy remaining lab management files
$source = "c:\Users\shrey\OneDrive\Desktop\Projects\Combined\240Kw"
$dest = "c:\Users\shrey\OneDrive\Desktop\Projects\Combined\LMS"

# Copy all page files
Write-Host "Copying page files..."
Get-ChildItem -Path "$source\src\pages\lab\management" -File | ForEach-Object {
    Copy-Item $_.FullName -Destination "$dest\src\pages\lab\management\$($_.Name)" -Force
    Write-Host "  Copied: $($_.Name)"
}

# Copy all component files recursively
Write-Host "`nCopying component files..."
Get-ChildItem -Path "$source\src\components\labManagement" -Recurse -File | ForEach-Object {
    $relPath = $_.FullName.Substring("$source\src\components\labManagement".Length + 1)
    $destPath = Join-Path "$dest\src\components\labManagement" $relPath
    $destDir = Split-Path $destPath -Parent
    if (-not (Test-Path $destDir)) {
        New-Item -ItemType Directory -Path $destDir -Force | Out-Null
    }
    Copy-Item $_.FullName -Destination $destPath -Force
    Write-Host "  Copied: $relPath"
}

Write-Host "`nCopy complete!"
Write-Host "Pages: $((Get-ChildItem -Path '$dest\src\pages\lab\management' -File).Count) files"
Write-Host "Components: $((Get-ChildItem -Path '$dest\src\components\labManagement' -Recurse -File).Count) files"
