# Shared Code Architecture

This directory contains code shared between the web and mobile applications.

## Structure

```
shared/
├── types/         # TypeScript type definitions
├── services/      # API service layer
├── utils/         # Utility functions
└── constants/     # Shared constants
```

## Usage

### In Web App (Frontend)

```typescript
import { User, Booking } from '@shared/types';
import api, { bookingAPI } from '@shared/services/api';
import { formatCurrency, formatDate } from '@shared/utils';

// Use shared code
const user: User = { ... };
const bookings = await bookingAPI.getAll();
const price = formatCurrency(1000);
```

### In Mobile App

```typescript
import { User, Booking } from '@shared/types';
import api, { bookingAPI } from '@shared/services/api';
import { formatCurrency, formatDate } from '@shared/utils';

// Same imports, same usage!
```

## Benefits

1. **Single Source of Truth** - Types and logic defined once
2. **Consistency** - Same formatting, validation, calculations
3. **Maintainability** - Fix bugs in one place
4. **Type Safety** - Shared TypeScript types across platforms
5. **DRY Principle** - Don't Repeat Yourself

## Important Notes

- Platform-specific implementations (storage, navigation) should NOT be in shared/
- Keep shared code pure and platform-agnostic
- Test shared code thoroughly as it affects both platforms
