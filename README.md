# API Security Shield 🔐

A security-focused backend system built as a **demo e-commerce API** and hardened against the **OWASP Top 10 API Security Risks**.  
Implements **multi-layered protection** covering application, network, and cloud security — from **TypeScript type safety** to **AWS VPC isolation**, **Nginx reverse proxy with SSL/TLS**, and **rate limiting**.

---

## 📌 Highlights
- **Mitigated 15+ vulnerabilities** detected by OWASP ZAP.
- Covers **all OWASP Top 10 API security risks** with layered defenses.
- Deployed in **AWS VPC** using best practices for public/private subnet segregation.
- Includes **interactive Next.js dashboard** for security visualization.

---

## 🚀 Features

### **1. Application-Level Security**
- **TypeScript strict typing** to enforce input formats.
- **Class-validator** & sanitization to block malicious payloads.
- **SQL injection prevention** by disallowing open-ended queries.
- OWASP-compliant API design with security headers.

### **2. Cloud & Network Security**
- **AWS VPC** architecture:
  - Backend in **public subnet**
  - Database in **private subnet**
  - Internet Gateway, **NACLs**, and **Security Groups** for access control.
- **Nginx reverse proxy** with SSL/TLS to enforce HTTPS.
- **Rate limiting** to mitigate brute-force & DoS attacks.

### **3. Vulnerability Scanning & Monitoring**
- Integrated **OWASP ZAP** for automated vulnerability scanning.
- **Next.js dashboard** visualizing endpoint mitigation status.
- Real-time logs with **AWS CloudWatch** *(demo data in current build)*.

---

## 🛠 Tech Stack
**Backend:** NestJS, Prisma ORM, PostgreSQL  
**Frontend Dashboard:** Next.js, Tailwind CSS  
**Security Tools:** OWASP ZAP, Nginx  
**Cloud:** AWS (VPC, EC2, RDS, CloudWatch)  
**DevOps:** Docker, GitHub Actions

---

## 📂 File Structure
api-security-shield/
├── backend/ # NestJS backend application
├── dashboard/ # Next.js dashboard for vulnerability visualization
├── docker-compose.yml
└── README.md


---

## ⚡ Getting Started

### 1. Clone Repository
```bash
git clone https://github.com/<your-username>/api-security-shield.git
cd api-security-shield

