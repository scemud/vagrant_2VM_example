$sharePath = Split-Path -Parent $PSScriptRoot
$netShares = net share

# collapse into single dimension array
$netShares = $netShares -join "" -split "\s+"

# pull out just share names
$smbShares = $netShares |
    % {$i=0}{ if ($_ -like "$sharePath") { $netShares[$i-1] }; $i++ }

# delete shares
$smbShares | % { net share $_ /delete }