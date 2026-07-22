# Connect Backend API in the Category Page

We will connect the Category page to the backend API using the custom `useAxiosSecure` hook and TanStack Query (`useQuery`). We will also integrate `react-hot-toast` for responsive feedback when creating new categories.

## Proposed Changes

### Dashboard Components

#### [MODIFY] [Category.jsx](file:///d:/Web_Development/Client_Project/8bit-cafe-dahboard/src/pages/dashboard/Category.jsx)
- Import `useAxiosSecure` hook from `../../hooks/useAxios`.
- Import `toast` from `react-hot-toast`.
- Replace the dummy `/categories.json` fetch with a secure request using `axiosSecure.get("/api/category/getCategories")`.
- Implement `handleCreateCategory` to send a POST request to `/api/category/addCategory` with payload `{ name, type }` (where type is uppercase `"FOOD"` or `"GAME"`).
- Handle success/error feedback using `toast.success` and `toast.error`.
- Ensure query cache is invalidated/refetched via `refetch()`.

#### [MODIFY] [CreateCategoryModal.jsx](file:///d:/Web_Development/Client_Project/8bit-cafe-dahboard/src/components/category/CreateCategoryModal.jsx)
- Update `onSubmit` to be asynchronous so that it awaits the `onCreate` API request.
- Add a loading state (`isSubmitting`) to disable the cancel/create buttons and show a loading state during the network request.

---

## Verification Plan

### Automated/Manual Verification
- Start the Vite development server using `npm run dev`.
- Navigate to the Category Page.
- Verify categories are fetched from the API and shown correctly in the table.
- Click "Create Category", input a name, choose a type, and click "Create".
- Verify the POST request is sent to `/api/category/addCategory`.
- Verify a success toast is shown, the modal closes, and the table auto-refreshes with the new category.
