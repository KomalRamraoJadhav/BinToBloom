# BinToBloom - Waste Management System

A comprehensive waste management platform with dual backend implementations (.NET & Spring Boot) and React frontends.

## 🏗️ Project Structure
```
BinToBloom-FullStack/
├── dotnet-project/
│   ├── BinToBloom Backend/     # .NET 8 Web API
│   └── client/                 # React Frontend for .NET
├── springboot-project/
│   ├── bintobloom-backend/     # Spring Boot API
│   └── client/                 # React Frontend for Spring Boot
├── .gitignore
└── README.md
```

## 🚀 Features
- **Multi-Role Authentication** (Household, Business, Collector, NGO, Admin)
- **Pickup Scheduling & Tracking** with real-time location
- **Payment Integration** with Razorpay
- **Eco-Points & Leaderboard System**
- **Admin Dashboard & Analytics**
- **Waste Management Analytics**

## 🛠️ Technologies

### Backend Options
- **.NET 8**: Entity Framework Core, MySQL, JWT Authentication
- **Spring Boot**: JPA/Hibernate, MySQL, Spring Security

### Frontend
- **React 18+** with Vite
- **Custom CSS** with responsive design
- **Razorpay** payment integration
- **Google Maps API** for location services

## 📋 Prerequisites
- **For .NET**: .NET 8 SDK
- **For Spring Boot**: Java 17+, Maven
- **Frontend**: Node.js 18+
- **Database**: MySQL Server
- **Tools**: Git

## ⚙️ Setup Instructions

### Option 1: .NET Backend Setup
```bash
# Navigate to .NET project
cd dotnet-project/BinToBloom\ Backend

# Copy configuration
cp appsettings.example.json appsettings.json

# Update appsettings.json with your credentials
# - Database connection string
# - JWT secret key
# - Razorpay API keys
# - Email SMTP settings

# Install and run
dotnet restore
dotnet run
```

### Option 2: Spring Boot Backend Setup
```bash
# Navigate to Spring Boot project
cd springboot-project/bintobloom-backend

# Copy configuration
cp application.example.properties application.properties

# Update application.properties with your credentials
# - Database connection
# - JWT secret
# - Razorpay keys
# - Email settings

# Install and run
mvn clean install
mvn spring-boot:run
```

### Frontend Setup (Choose corresponding frontend)

#### For .NET Frontend:
```bash
cd dotnet-project/client
cp .env.example .env.local
# Update .env.local with API URL: http://localhost:5000/api
npm install
npm run dev
```

#### For Spring Boot Frontend:
```bash
cd springboot-project/client
cp .env.example .env.local
# Update .env.local with API URL: http://localhost:8080/api
npm install
npm run dev
```

## 🔐 Environment Variables to Configure

### Backend (.NET)
- Database connection string
- JWT secret key
- Razorpay KeyId & KeySecret
- Email SMTP credentials

### Backend (Spring Boot)
- Database URL, username, password
- JWT secret
- Razorpay API keys
- Email configuration

### Frontend
- API base URL
- Google Maps API key (optional)

## 🌐 API Endpoints
Both backends provide identical REST APIs:
- `/api/auth` - Authentication
- `/api/pickup` - Pickup management
- `/api/payment` - Payment processing
- `/api/user` - User management
- `/api/admin` - Admin operations

## 🏃‍♂️ Quick Start
1. Clone repository
2. Choose backend (.NET or Spring Boot)
3. Setup database (MySQL)
4. Configure environment variables
5. Run backend
6. Run corresponding frontend
7. Access application at `http://localhost:5173`
