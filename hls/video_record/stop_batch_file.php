<?php
// Specify the path to your .bat file
$batFilePath = 'deletebatfile.bat';

// Run the .bat file
$output = shell_exec($batFilePath);

// Output the result
echo $output;
?>
