# Contributing to Educational Platform

Thank you for your interest in contributing to our educational platform! This document provides guidelines and instructions for contributing.

## Code of Conduct

Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md).

## Development Process

1. Fork the repository
2. Create a new branch for your feature or bug fix
3. Make your changes
4. Write or update tests as needed
5. Ensure all tests pass
6. Submit a pull request

## Pull Request Process

1. Update the README.md with details of changes if needed
2. Update the documentation if needed
3. The PR will be merged once you have the sign-off of at least one other developer

## Development Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
Create a `.env.local` file with the following variables:
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
```

3. Run the development server:
```bash
npm run dev
```

## Coding Standards

- Use TypeScript for all new code
- Follow the existing code style
- Write meaningful commit messages
- Add comments for complex logic
- Keep components small and focused
- Use proper error handling
- Write tests for new features

## Testing

Run tests with:
```bash
npm test
```

## Documentation

- Keep documentation up to date
- Add JSDoc comments for functions and components
- Update README.md when adding new features

## Questions?

Feel free to open an issue for any questions or concerns. 