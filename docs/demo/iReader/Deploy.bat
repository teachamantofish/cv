REM Copy to brogersdoc
NET USE "\\brogersdoc\Apache Software Foundation\Tomcat 7.0\webapps\ROOT"
xcopy *.* "\\brogersdoc\Apache Software Foundation\Tomcat 7.0\webapps\ROOT\iReader\" /S /R /Y /D 
