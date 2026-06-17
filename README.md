# Talks-Dev: Real-Time Chat Application and DevOps Showcase

A modern, full-stack real-time chat application built with a focus on robust DevOps practices, automated CI/CD pipelines, and scalable cloud infrastructure.

---

## Technical Stack

### Frontend
- **Framework:** React 18 with Vite
- **Styling:** Tailwind CSS and Shadcn UI
- **Animations:** Framer Motion
- **State Management:** React Context API
- **Networking:** Axios for REST API and native WebSockets for real-time communication

### Backend
- **Runtime:** Node.js and Express
- **Database:** MongoDB Atlas (Cloud-hosted NoSQL)
- **Real-time Engine:** WebSocket (ws library) for event-driven messaging and presence tracking
- **Authentication:** JSON Web Tokens (JWT) with secure, HttpOnly cookie storage
- **Security:** Argon2/Bcrypt for cryptographic password hashing

### DevOps and Infrastructure
- **Containerization:** Docker for application isolation and Docker Compose for local orchestration
- **CI/CD Orchestration:** Jenkins using Pipeline-as-Code (Jenkinsfile)
- **Infrastructure as Code (IaC):** Terraform for declarative AWS resource provisioning
- **Configuration Management:** Ansible for automated remote server configuration and deployment
- **Web Server:** Nginx as a reverse proxy for load distribution and path routing
- **Cloud Infrastructure:** Amazon Web Services (AWS EC2, VPC Security Groups)

---

## Architecture and End-to-End DevOps Flow

This project implements a complete DevOps lifecycle, ensuring that code changes are automatically tested, built, and deployed to a production-grade environment.

### 1. Infrastructure Provisioning (Terraform)
The foundation of the deployment is managed via Terraform. It defines the desired state of the AWS infrastructure, including:
- **Compute:** AWS EC2 (t3.micro) instances tailored for the application load.
- **Security:** Security Groups with strict ingress/egress rules, allowing only necessary traffic (SSH on 22, HTTP on 80, and API traffic on 4040).
- **Automation:** Terraform ensures infrastructure is reproducible and avoids configuration drift.

### 2. Continuous Integration (Jenkins)
The CI pipeline is defined in a `Jenkinsfile`, providing a transparent and versioned build process.
- **Source Control Management:** Jenkins monitors the GitHub repository for new commits.
- **Environment Injection:** Build arguments (e.g., `REACT_APP_API_URL`) are injected during the image creation phase to ensure the frontend is correctly pointed to the backend environment.
- **Automated Building:** Docker images are built using multi-stage-like patterns to ensure small, optimized production footprints.
- **Artifact Management:** Successfully built images are tagged and pushed to Docker Hub, serving as a single source of truth for deployment artifacts.

### 3. Continuous Deployment and Configuration (Ansible)
Once artifacts are ready, Jenkins triggers an Ansible playbook to manage the deployment on the target EC2 instance.
- **Host Preparation:** Ansible ensures the remote system has the correct Docker engine version and Python dependencies installed.
- **Dynamic Orchestration:** The playbook pulls the latest images from Docker Hub, manages Docker networks for inter-container communication, and handles container lifecycle (stopping old versions and starting new ones).
- **Secret Management:** Sensitive credentials, such as `MONGO_URL`, are securely retrieved from Jenkins' credential store and injected into the backend container at runtime.

### 4. Traffic Routing (Nginx)
In the production environment, Nginx acts as the entry point.
- **Reverse Proxy:** It intercepts traffic on port 80 and routes it based on the URL path—directing API requests to the Node.js backend and serving the React frontend.
- **Abstraction:** This setup masks the internal container ports and provides a unified interface for the end-user.

---

## Key Features

- **Real-Time Messaging:** Event-driven architecture using WebSockets for sub-millisecond message delivery.
- **Presence Detection:** Real-time online/offline status tracking of all registered users.
- **Binary Data Handling:** Support for file uploads and sharing integrated within the chat flow.
- **State Persistence:** Messages and user data are persisted in MongoDB with optimized indexing for retrieval.
- **Production Automation:** A fully hands-off deployment process where a single git push updates the entire cloud environment.

---

## Project Structure

```text
├── api/                # Express backend and WebSocket server
├── client/             # React frontend (Vite-optimized)
├── terraform/          # HCL scripts for AWS provisioning
├── ansible/            # YAML playbooks for deployment and config
├── JenkinsFile         # Declarative CI/CD pipeline
├── docker-compose.yml  # Local developer environment orchestration
└── nginx.conf          # Reverse proxy and routing configuration
```

---

## Getting Started

### Local Development
1. Clone the repository: `git clone https://github.com/GiharaNavindu/talks-dev.git`
2. Execute the local environment: `docker-compose up --build`
3. Access the application:
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:4040`

### Deployment Configuration
To replicate the automated deployment:
1. Initialize infrastructure: `cd terraform && terraform init && terraform apply`
2. Configure Jenkins: Create a pipeline job referencing the `JenkinsFile`.
3. Required Jenkins Credentials:
   - `Dockerpwd`: Docker Hub authentication
   - `MONGO_URL`: Connection string for MongoDB Atlas
   - `chat-app-key.pem`: SSH private key for AWS EC2 access

---

## Engineering Skills Demonstrated
- **Cloud Engineering:** Designing and managing AWS resources (EC2, SG).
- **CI/CD Implementation:** Building complex, multi-stage pipelines with Jenkins.
- **Automation and IaC:** Utilizing Terraform and Ansible to eliminate manual intervention.
- **System Architecture:** Designing microservice-style containerized applications.
- **Full-Stack Development:** Implementing modern reactive UIs and scalable backend servers.
- **Cybersecurity:** Implementing JWT-based authentication and secure environmental variable management.
