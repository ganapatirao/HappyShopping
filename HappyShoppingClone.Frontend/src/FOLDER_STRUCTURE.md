# Frontend Folder Structure

This document outlines the folder structure for the HappyShopping Clone frontend, following industry best practices used by companies like Airbnb, Vercel, and Netflix.

## Overview

The project uses a **unified feature-based architecture** where all UI components and features are organized under a single `features/` directory. This approach:
- **Simplifies navigation**: All feature-related code is in one place
- **Reduces cognitive load**: No need to switch between components and features folders
- **Follows domain-driven design**: Each feature is self-contained with its own shared components
- **Scales easily**: New features can be added without restructuring

## Directory Structure

```
src/
├── assets/                  # Static assets (images, fonts, icons)
├── features/               # All features and shared components
│   ├── auth/               # Authentication feature
│   │   ├── ForgotPassword.jsx
│   │   ├── Login.jsx
│   │   └── Register.jsx
│   ├── admin/              # Admin dashboard feature
│   │   ├── Dashboard.jsx
│   │   ├── OrdersSection.jsx
│   │   ├── OverviewStats.jsx
│   │   ├── ProductModal.jsx
│   │   ├── ProductsSection.jsx
│   │   ├── ReviewsSection.jsx
│   │   ├── SettingsSection.jsx
│   │   ├── VendorModal.jsx
│   │   ├── VendorsSection.jsx
│   │   ├── categories/     # Admin category management
│   │   │   ├── CategoriesSection.jsx
│   │   │   └── CategoryModal.jsx
│   │   ├── site-config/    # Site configuration
│   │   │   └── SiteConfiguration.jsx
│   │   ├── subcategories/  # Admin subcategory management
│   │   │   ├── SubCategoriesSection.jsx
│   │   │   └── SubCategoryModal.jsx
│   │   └── users/          # Admin user management
│   │       ├── UserModal.jsx
│   │       └── UsersSection.jsx
│   ├── shopping/           # Shopping feature
│   │   ├── Cart.jsx
│   │   ├── Home.jsx
│   │   ├── ProductDetail.jsx
│   │   └── Shopping.jsx
│   ├── user/               # User dashboard feature
│   │   └── Dashboard.jsx
│   └── shared/             # Shared components across features
│       ├── common/         # Common reusable components
│       │   ├── DeleteConfirmationModal.jsx
│       │   ├── ProductCard.jsx
│       │   ├── SearchAutocomplete.jsx
│       │   └── Toast.jsx
│       └── layout/         # Layout components
│           ├── Footer.jsx
│           └── Header.jsx
├── context/                # React Context providers
│   ├── AuthContext.jsx
│   └── CartContext.jsx
├── hooks/                  # Custom React hooks
│   ├── useCategoryOperations.js
│   ├── useProductOperations.js
│   ├── useSubCategoryOperations.js
│   └── useVendorOperations.js
├── services/               # API services and external integrations
│   └── api.js
├── styles/                 # Global styles
│   ├── App.css
│   └── index.css
├── utils/                  # Utility functions and helpers
│   ├── validation.js
│   └── validationConfig.js
├── App.jsx                 # Main application component with routing
└── main.jsx               # Application entry point
```

## Key Principles

### 1. Unified Feature-Based Organization
- All UI components and features are under a single `features/` directory
- Shared components live in `features/shared/` with subdirectories for organization
- Each feature (auth, shopping, admin, user) is self-contained
- Promotes code reusability and maintainability

### 2. Clear Separation of Concerns
- **features/**: All feature-specific code and shared components
- **context/**: React Context providers for global state
- **hooks/**: Custom React hooks for reusable logic
- **services/**: API services and external integrations
- **utils/**: Utility functions and helpers

### 3. Flat Where Possible
- Avoid excessive nesting
- Keep related files close together
- Make navigation intuitive

### 4. Consistent Naming
- Use PascalCase for components (e.g., `ProductCard.jsx`)
- Use camelCase for utilities and hooks (e.g., `useCart.js`)
- Descriptive names that indicate purpose

## Import Path Guidelines

### Importing from the same feature:
```jsx
// Inside features/admin/Dashboard.jsx
import OverviewStats from './OverviewStats';
import CategoriesSection from './categories/CategoriesSection';
```

### Importing from shared components:
```jsx
// Inside any feature
import Header from '../shared/layout/Header';
import ProductCard from '../shared/common/ProductCard';
```

### Importing from core utilities:
```jsx
// Inside any feature
import { useAuth } from '../../context/AuthContext';
import { productAPI } from '../../services/api';
```


## Adding New Features

When adding a new feature:

1. Create a new directory in `features/`:
   ```
   features/
   └── your-feature/
   ```

2. Add feature-specific components and pages within that directory

3. Import reusable components from `components/` when needed

4. Update `App.jsx` routing to include new feature routes

5. Use existing services from `services/` or create new ones if needed

## Best Practices

1. **Keep features self-contained**: Each feature should work independently
2. **Share components wisely**: Only move truly reusable components to `components/common/`
3. **Use absolute imports when beneficial**: Consider setting up path aliases for cleaner imports
4. **Document complex components**: Add comments for components with complex logic
5. **Maintain consistent styling**: Use shared styles and design systems

## File Naming Conventions

- **Components**: PascalCase (e.g., `ProductCard.jsx`, `UserDashboard.jsx`)
- **Hooks**: camelCase with 'use' prefix (e.g., `useCategoryOperations.js`)
- **Utilities**: camelCase (e.g., `validation.js`, `api.js`)
- **Context**: PascalCase with 'Context' suffix (e.g., `AuthContext.jsx`)

## Testing Structure (Future)

When adding tests, follow this pattern:
```
src/
├── features/
│   ├── auth/
│   │   ├── __tests__/
│   │   │   ├── Login.test.jsx
│   │   │   └── Register.test.jsx
│   │   ├── Login.jsx
│   │   └── Register.jsx
```

---

This structure provides a solid foundation for scaling the application while maintaining code clarity and developer productivity.
