# Contributing to Fatwa Search

We welcome contributions to Fatwa Search! Please take a moment to review these guidelines to ensure a smooth and effective contribution process.

## Contribution Guidelines

- Ensure your code adheres to the existing style.
- Make sure your changes are well-tested.
- Update documentation when creating or modifying features.
- Be respectful and constructive in all communications.

## Code of Conduct

All contributors are expected to adhere to the project's [Code of Conduct](CODE_OF_CONDUCT.md). Please read it before contributing.

## Development Setup Process

### Prerequisites

- Node.js (version specified in `.nvmrc` or latest LTS)
- npm or yarn

### Cloning the Repository

```bash
git clone https://github.com/your-username/fatwa-search.git
cd fatwa-search
```

### Installing Dependencies

```bash
npm install
# or
# yarn install
```

### Running the Project

```bash
npm start
# or
# yarn start
```

This will typically start the development server, and you can view the application in your browser at `http://localhost:3000`.

## Coding Standards and Style Guide

- Follow the existing coding style present in the codebase.
- We use Prettier for code formatting (if applicable, check project configuration).
- ESLint is used for linting (if applicable, check project configuration).
- Write clear and concise comments where necessary.

## Pull Request Process

1.  **Fork the repository:** Create your own fork of the project on GitHub.
2.  **Create a branch:** Create a new branch in your fork for your feature or bug fix.
    ```bash
    git checkout -b feature/your-feature-name
    ```
3.  **Commit your changes:** Make your changes and commit them with a clear and descriptive commit message.
    - Follow conventional commit message formats if specified by the project (e.g., `feat: add new search filter`).
4.  **Push to your fork:** Push your changes to your forked repository.
    ```bash
    git push origin feature/your-feature-name
    ```
5.  **Open a Pull Request:** Go to the original repository and open a pull request from your branch to the main development branch (e.g., `main` or `develop`).
    - Provide a clear title and description for your pull request, explaining the changes and why they are needed.
    - Reference any relevant issues.
6.  **Address feedback:** Respond to any feedback or review comments.
7.  **Merge:** Once approved, your pull request will be merged.

## Testing Requirements

- Write unit tests for new features and bug fixes.
- Ensure all existing tests pass before submitting a pull request.
- Run tests using the following command:
  ```bash
  npm test
  # or
  # yarn test
  ```
- Describe any new testing procedures or considerations in your pull request.
