# Toast Notifications (Sonner)

The admin panel now uses `sonner` for toast notifications during CRUD operations.

## Usage

### Import and Use

```tsx
import { toast } from 'sonner';

// Success toast
toast.success('Course saved successfully!');

// Error toast
toast.error('Failed to save course');

// Info toast
toast.info('Loading data...');

// Warning toast
toast.warning('Action requires confirmation');

// Custom toast with promise
toast.promise(saveData(), {
  loading: 'Saving...',
  success: 'Saved successfully!',
  error: 'Failed to save',
});
```

## ToastProvider

The `ToastProvider` is already added to the admin layout (`app/admin/layout.tsx`), so no additional setup is needed in admin pages.

## Styling

Toasts are styled with:
- Yellow (#FACC15) accent color for success states
- Red for error states
- Rounded corners and shadows
- Top-right positioning
- Auto-dismiss after 4 seconds

## Example: AdminCourseEditor

See `components/admin/AdminCourseEditor.tsx` for a complete example of toast integration in CRUD operations:

```tsx
// Success
toast.success('Course saved successfully!');

// Error
toast.error('Could not save course details');
```
