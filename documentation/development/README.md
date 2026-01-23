# Development Documentation

Guides for developing and testing the Blog Platform Backend.

## 📚 Documentation Files

### [TESTING_GUIDE.md](./TESTING_GUIDE.md)
**Testing Guide** - Comprehensive testing instructions:
- Server startup and verification
- Health endpoint testing
- API endpoint testing
- Admin endpoint testing
- Error handling verification
- Postman integration
- Troubleshooting tips

## 🚀 Quick Start

### Local Development Setup

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Configure Environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Setup Database:**
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   ```

4. **Start Development Server:**
   ```bash
   npm run dev
   ```

5. **Run Tests:**
   ```bash
   npm test
   ```

## 🧪 Testing

### Manual Testing

Follow the [TESTING_GUIDE.md](./TESTING_GUIDE.md) for:
- Endpoint verification
- Error handling tests
- Authentication tests
- Rate limiting tests

### Automated Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 📝 Development Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix ESLint errors |
| `npm run type-check` | Type check without building |
| `npm run prisma:studio` | Open Prisma Studio (database GUI) |

## 🔧 Development Tools

### Prisma Studio
Visual database browser:
```bash
npm run prisma:studio
```

### Database Migrations
```bash
# Create and apply migration
npm run prisma:migrate

# Apply existing migrations (production)
npm run prisma:migrate:deploy
```

## 📋 Code Quality

### Linting
```bash
# Check for linting errors
npm run lint

# Auto-fix linting errors
npm run lint:fix
```

### Type Checking
```bash
# Check TypeScript types
npm run type-check
```

## 🐛 Debugging

### Common Issues

1. **Database Connection Errors**
   - Verify `DATABASE_URL` in `.env`
   - Check database is running
   - Verify SSL settings (for Neon)

2. **Port Already in Use**
   - Change `PORT` in `.env`
   - Or kill the process using the port

3. **Prisma Client Not Generated**
   ```bash
   npm run prisma:generate
   ```

## 📖 Best Practices

1. **Environment Variables**
   - Never commit `.env` file
   - Use `.env.example` as template
   - Document all required variables

2. **Database Migrations**
   - Always create migrations for schema changes
   - Test migrations before committing
   - Never edit migration files after applying

3. **Error Handling**
   - Use proper error codes
   - Return meaningful error messages
   - Log errors appropriately

4. **Code Style**
   - Follow TypeScript best practices
   - Use ESLint rules
   - Write descriptive commit messages

## 🔗 Related Documentation

- [API Documentation](../api/README.md) - API endpoints and integration
- [Deployment Guide](../deployment/README.md) - Production deployment
- [Troubleshooting](../troubleshooting/README.md) - Common issues

---

**Last Updated:** January 2025
