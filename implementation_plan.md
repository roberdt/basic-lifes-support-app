# Fix Date and Time / Slots Screen

The "Date and Time / Slots" screen (specifically the creation and update functionality) is currently broken for both Admin and non-Admin users. This plan addresses the reported issues: "will not update" and "cannot add".

## User Review Required

> [!IMPORTANT]
> The fix involves changing the field name sent to the backend from `dateValue` to `date` for both creation and updates. This assumes the backend expects `date`, which is consistent with the data received in `GET` requests.

## Open Questions

- Should we retain `dateValue` alongside `date` in the request body for backward compatibility? (Currently planning to send both to be safe).

## Proposed Changes

### [Classes Management]

#### [MODIFY] [app/classes/create/page.tsx](file:///c:/workspace/intellijProjects/basic-lifes-support-app/app/classes/create/page.tsx)

- **Fix `useAuth` destructuring**: Add `companyId` to the `useAuth` hook call to ensure it's available for API requests.
- **Implement Company Selector for Admins**: Replace the disabled `TextField` for "Hosting Company" with a `Select` component when the user is an Admin. This allows Admins to specify which company they are managing slots for.
- **Fix "Update" and "Add" logic**:
  - Update `handleSubmit` to send both `date` and `dateValue` to ensure compatibility with the backend.
  - Ensure `effectiveCompanyId` is correctly derived from `queryCompanyId`, `companyId` (from auth), or the selected company's ID.
- **Improve Initial State**: Ensure that if a `queryCompanyId` is present, the corresponding company is automatically selected for Admins.

## Verification Plan

### Automated Tests
- I will perform manual verification as automated tests for the UI are not currently configured in this environment.

### Manual Verification
1. **Admin Add**:
   - Log in as Admin.
   - Navigate to "Date and Time / Slots".
   - Click "Add New Class".
   - Verify that a company can be selected.
   - Verify that a class can be successfully scheduled.
2. **Admin Update**:
   - Log in as Admin.
   - Click the "Edit" icon on an existing class.
   - Verify that the class details load correctly (including the date).
   - Change a field (e.g., seats) and verify that the update is successful.
3. **User Add/Update**:
   - Log in as a regular company user.
   - Verify that adding and updating classes works as expected (using the user's own company context).
