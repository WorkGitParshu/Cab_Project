@echo off
echo Starting Cab Booking System...

:: Create a logs directory if it doesn't exist
if not exist logs mkdir logs

echo Starting Service Registry (Eureka)...
start "Eureka Server" cmd /k "cd service && mvn spring-boot:run"
timeout /t 10

echo Starting Cab Service...
start "Cab Service" cmd /k "cd cab-service && mvn spring-boot:run"

echo Starting Booking Service...
start "Booking Service" cmd /k "cd booking-service && mvn spring-boot:run"

echo Starting User Service...
start "User Service" cmd /k "cd user-service && mvn spring-boot:run"

echo Starting Frontend...
start "Frontend" cmd /k "cd UserProject && npm run dev"

echo All services attempt to start. Please check the individual windows for logs.
pause
