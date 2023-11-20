Get-ChildItem "." -Filter *.dll | 
Foreach-Object {
    $file = $_.Name
    
    Move-Item .\$file .\unused\$file

    .\vvp .\a.out
    
    if (Test-Path .\test.vcd){
        Remove-Item .\test.vcd 
    } else {
        Write-Output "DLL $file is required"
        Move-Item .\unused\$file .\$file
    }
}