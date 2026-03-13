@echo off
curl -X POST http://localhost:5000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"rajuchaswik@gmail.com\",\"password\":\"Raju@2006\"}"
pause
