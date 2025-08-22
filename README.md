# API Security Shield  

A backend system designed to **demonstrate protection against the OWASP Top 10 API vulnerabilities**. Built for a demo e-commerce app, this project showcases best practices in **secure API development, cloud deployment, and monitoring**.  

---

## Features  
- **OWASP Top 10 Protection**: Hardened APIs against vulnerabilities like SQL Injection, Mass Assignment, BOLA, etc.  
- **Strict Data Validation & Sanitization**: Enforced with **TypeScript** type safety and server-side checks.  
- **Secure Cloud Deployment**:  
  - **AWS VPC** architecture with public/private subnets  
  - Security Groups & NACLs for layered access control  
  - PostgreSQL in private subnet  
- **Traffic Security**: Configured **Nginx reverse proxy** with SSL/TLS to enforce HTTPS and **rate limiting** to mitigate brute-force/DoS attacks.  
- **Continuous Vulnerability Testing**: Integrated **OWASP ZAP** for scanning; identified & mitigated 15+ vulnerabilities.  
- **Monitoring Dashboard**: Built with **Next.js** to visualize endpoint security status and metrics (demo data from ZAP & CloudWatch).  

---

## Tech Stack  
- **Backend**: NestJS (TypeScript), Prisma ORM, PostgreSQL  
- **Frontend**: Next.js (dashboard)  
- **Security**: OWASP ZAP, Nginx (SSL/TLS, rate limiting)  
- **Cloud**: AWS (EC2, VPC, Security Groups, NACLs, CloudWatch)  
- **Containerization**: Docker  

---

## Getting Started  

### Prerequisites  
- Node.js v18+  
- Docker & Docker Compose  
- PostgreSQL  

### Installation  
```bash
# Clone repo
git clone https://github.com/Ashu463/api-security-shield.git
cd api-security-shield

# Install backend deps
cd backend
npm install

# Run migrations
npx prisma migrate dev

# Start backend
npm run start:dev
```

### Running with Docker  
```bash
docker-compose up --build
```

---

## Security Highlights  
- **Prevention**: SQL Injection, Broken Object Level Authorization, Sensitive Data Exposure  
- **Cloud Hardening**: Isolated DB in private subnet, controlled ingress/egress  
- **Defense in Depth**: Reverse proxy, HTTPS everywhere, input sanitization, rate limiting  

---

## Future Improvements  
- Real-time integration of ZAP scan results into the Next.js dashboard  
- CI/CD security testing pipeline (GitHub Actions + ZAP baseline scan)  
- Multi-user role-based access control (RBAC)  

---

## Acknowledgements  
Inspired by the **OWASP Top 10 API Security Risks** and real-world enterprise security practices.  
