# Getting Started Guide

This wiki page guides you through setting up CineVerse on your local machine.

---

## 🛠️ Step-by-Step Instructions

1. **Clone the Repo**:
   ```bash
   git clone https://github.com/shouryapratap132006/cineverse.git
   cd cineverse
   ```

2. **Install Node Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment**:
   ```bash
   cp .env.example .env
   ```

4. **Initialize Prisma Database**:
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   ```

5. **Start Dev Server**:
   ```bash
   npm run dev
   ```
   Navigate to [http://localhost:3000](http://localhost:3000).
