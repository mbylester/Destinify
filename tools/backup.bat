@echo off
rem Daily database backup for XAMPP on Windows. Schedule this file in Task Scheduler (see README > Backups).
rem If XAMPP is not in C:\xampp, change the path below.
set PHP=C:\xampp\php\php.exe
"%PHP%" "%~dp0backup.php" %*
