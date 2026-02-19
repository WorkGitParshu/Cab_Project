@echo off
echo ==========================================
echo Starting Cab Booking Project
echo ==========================================

echo [1/8] Starting Kafka and Zookeeper (Docker)...
docker-compose up -d
if %errorlevel% neq 0 (
    echo Docker seems to be down or docker-compose failed.
    echo Please make sure Docker Desktop is running.
    pause
    exit /b
)

echo Waiting for Kafka to warm up...
timeout /t 10 /nobreak

echo [2/8] Starting Eureka Server...
start "Eureka Server" cmd /k "cd service && mvn spring-boot:run"
timeout /t 10 /nobreak

echo [3/8] Starting User Service (JWT Auth)...
start "User Service" cmd /k "cd user-service && mvn spring-boot:run"

echo [4/8] Starting Cab Service...
start "Cab Service" cmd /k "cd cab-service && mvn spring-boot:run"

echo [5/8] Starting Booking Service...
start "Booking Service" cmd /k "cd booking-service && mvn spring-boot:run"

echo [6/8] Starting Notification Service...
start "Notification Service" cmd /k "cd notification-service && mvn spring-boot:run"

echo [7/8] Starting Payment Service...
start "Payment Service" cmd /k "cd payment-service && mvn spring-boot:run"

echo Waiting for backend services to initialize...
timeout /t 15 /nobreak

echo [8/8] Starting Frontend (UserProject)...
cd UserProject
start "Frontend" cmd /k "npm run dev"
cd ..

echo ==========================================
echo All services have been triggered!
echo Please check the opened windows for logs.
echo Frontend should be available at http://localhost:5173
echo ==========================================
pause
