# Admin Forms Testing Guide

## Quick Start Testing

### Prerequisites
1. Backend server must be running
2. You must be logged in as an admin user
3. Navigate to the admin panel

## Test Scenarios

### 1. Payouts Management (`/admin/payouts` or Admin Panel → Payouts Tab)

#### Test Create Payout
```
1. Click "Create Payout" button
2. Try submitting empty form → Should show validation error
3. Select a worker from dropdown
4. Enter total earnings (e.g., 5000)
5. Set commission percent (e.g., 15)
6. Select payment method:
   - For Bank Transfer: Fill account holder, account number, IFSC code
   - For UPI: Fill UPI ID
7. Click Create → Should show confirmation dialog
8. Confirm → Should show success message
9. New payout should appear in the list
```

#### Test Search Payout
```
1. Enter search term in search box:
   - Try worker name
   - Try payout status (e.g., "pending")
   - Try profession
2. Results should filter in real-time
3. Clear search → All payouts should show
```

#### Test Edit Payout
```
1. Click edit icon (pencil) on any payout
2. Note: Worker, earnings, commission are disabled
3. Change payment method or account details
4. Click Update → Should show confirmation
5. Confirm → Should show success message
```

#### Test Process Payout
```
1. Find a payout with "pending" status
2. Click process icon (green check)
3. Confirm → Payout status should change to "processing"
```

#### Test Delete Payout
```
1. Click delete icon (red trash) on any payout
2. Confirmation dialog should appear
3. Confirm → Payout should be removed from list
```

---

### 2. Service Categories (`/admin/service-categories` or Admin Panel → Services Tab)

#### Test Create Service Category
```
1. Click "Add Service" button
2. Try submitting empty form → Should show validation errors
3. Fill in required fields:
   - Service Name (e.g., "Plumbing")
   - Service Code (e.g., "PLUMB")
   - Description (min 10 characters)
   - Base Price (e.g., 200)
   - Price Per Km (e.g., 10)
   - Minimum Charge (e.g., 150)
   - Duration in minutes (e.g., 60)
   - Category (regular/urgent/premium)
   - Surge Pricing (1.0-3.0)
   - Required Skills (comma-separated)
4. Toggle "Active Service" switch
5. Click Create → Should show confirmation
6. Confirm → Success message and new service appears
```

#### Test Search Service
```
1. Enter search in search box:
   - Try service name
   - Try service code
   - Try category type
   - Try skill name
2. Results should filter in real-time
```

#### Test Edit Service
```
1. Click edit icon on any service
2. Note: Service code is disabled (cannot be changed)
3. Modify any other field
4. Click Update → Should show confirmation
5. Confirm → Changes should reflect in list
```

#### Test Toggle Status
```
1. Click toggle icon on any service
2. Status should switch between Active/Inactive
3. Check the statistics bar → Active count should update
```

#### Test Delete Service
```
1. Click delete icon on any service
2. Confirmation dialog appears
3. Confirm → Service removed from list
```

---

### 3. Reviews Management (`/admin/reviews` or Admin Panel → Reviews Tab)

#### Test Create Review
```
1. Click "Add Review" button
2. Try submitting empty form → Should show validation errors
3. Select a completed booking from dropdown
4. Enter review title (min 5 characters)
5. Enter review comment (min 10 characters)
6. Set all ratings (1-5 stars):
   - Overall Rating
   - Service Quality
   - Punctuality
   - Cleanliness
7. Click Create → Should show confirmation
8. Confirm → Success message and review appears
```

#### Test Search Review
```
1. Enter search in search box:
   - Try user name
   - Try worker name
   - Try review title
   - Try status (pending/approved/rejected)
2. Results should filter in real-time
```

#### Test Edit Review
```
1. Click edit icon on any review
2. Note: Booking selection is disabled
3. Modify title, comment, or ratings
4. Click Update → Should show confirmation
5. Confirm → Changes should reflect in list
```

#### Test Moderate Review
```
1. Find a review with "pending" status
2. Click "Approve" button (green)
   - OR click "Reject" button (red)
3. Confirmation dialog appears
4. Confirm → Status should change
5. Check statistics → Pending count should update
```

#### Test Delete Review
```
1. Click delete icon on any review
2. Confirmation dialog appears
3. Confirm → Review removed from list
```

---

## Validation Tests

### Payouts Validation
- [ ] Cannot create without selecting worker
- [ ] Total earnings must be > 0
- [ ] Commission must be 0-100%
- [ ] Bank account number must be 9-18 digits
- [ ] IFSC code must match format (e.g., ABCD0123456)
- [ ] UPI ID must match format (e.g., user@bank)

### Service Categories Validation
- [ ] Service name min 3 characters
- [ ] Service code min 2 characters
- [ ] Description min 10 characters
- [ ] All prices must be >= 0
- [ ] Duration must be > 0
- [ ] Surge pricing must be 1.0-3.0

### Reviews Validation
- [ ] Must select a booking for create
- [ ] Review title min 5 characters
- [ ] Review comment min 10 characters
- [ ] All ratings must be 1-5

---

## UI/UX Tests

### For All Forms
- [ ] Loading spinner shows during data fetch
- [ ] Statistics/counts display correctly
- [ ] Search filters work in real-time
- [ ] Empty state messages show when no data
- [ ] "No results" message shows for failed search
- [ ] Refresh button works
- [ ] Pagination works (10, 25, 50, 100 items per page)
- [ ] Buttons disable during loading
- [ ] Form fields disable during submission
- [ ] Submit button shows "Submitting..." during save
- [ ] Success toast appears after successful operation
- [ ] Error toast appears if operation fails
- [ ] Confirmation dialogs appear for all destructive actions

### Specific Tests
- [ ] Payouts: Process button only shows for pending payouts
- [ ] Service Categories: Toggle button changes active status
- [ ] Reviews: Moderate buttons only show for pending reviews
- [ ] All forms: Edit disables certain fields appropriately
- [ ] All forms: Helper text provides useful guidance

---

## Error Handling Tests

### Network Errors
1. Stop backend server
2. Try to load any form
3. Should show error message
4. Start server and click refresh
5. Data should load successfully

### Validation Errors
1. Try to submit forms with invalid data
2. Clear error messages should display
3. Fix errors and resubmit
4. Should succeed

### API Errors
1. Try to create duplicate service code
2. Try to delete item that doesn't exist
3. Should show appropriate error messages

---

## Browser Console Tests

Open browser console (F12) and watch for:
- [ ] No JavaScript errors
- [ ] API calls complete successfully
- [ ] Error messages logged for failed operations
- [ ] No CORS errors
- [ ] No 401 authentication errors

---

## Performance Tests

- [ ] Forms load within 2 seconds
- [ ] Search filters respond instantly
- [ ] Form submissions complete within 3 seconds
- [ ] Page doesn't freeze during operations
- [ ] Multiple rapid clicks don't cause issues

---

## Accessibility Tests

- [ ] All forms can be navigated with keyboard (Tab key)
- [ ] Form fields have proper labels
- [ ] Error messages are announced
- [ ] Buttons have clear text labels
- [ ] Color coding is not the only indicator (also has text)

---

## Common Issues & Solutions

### Issue: Forms not loading
**Solution:** 
- Check backend is running
- Check you're logged in as admin
- Check browser console for errors
- Verify API_URL in environment variables

### Issue: "Failed to fetch" error
**Solution:**
- Backend server might be down
- Check CORS configuration
- Verify API endpoints match

### Issue: Validation not working
**Solution:**
- Clear browser cache
- Hard refresh (Ctrl+F5)
- Check form is using latest code

### Issue: Search not finding results
**Solution:**
- Check search term spelling
- Try simpler search terms
- Verify data exists in database

### Issue: Submit button stays disabled
**Solution:**
- Check all required fields are filled
- Check validation is passing
- Refresh page if needed

---

## Test Report Template

```
Date: _______________
Tester: _______________
Browser: _______________

Payouts Form:
- Create: ☐ Pass ☐ Fail
- Read: ☐ Pass ☐ Fail
- Update: ☐ Pass ☐ Fail
- Delete: ☐ Pass ☐ Fail
- Search: ☐ Pass ☐ Fail
- Process: ☐ Pass ☐ Fail

Service Categories Form:
- Create: ☐ Pass ☐ Fail
- Read: ☐ Pass ☐ Fail
- Update: ☐ Pass ☐ Fail
- Delete: ☐ Pass ☐ Fail
- Search: ☐ Pass ☐ Fail
- Toggle: ☐ Pass ☐ Fail

Reviews Form:
- Create: ☐ Pass ☐ Fail
- Read: ☐ Pass ☐ Fail
- Update: ☐ Pass ☐ Fail
- Delete: ☐ Pass ☐ Fail
- Search: ☐ Pass ☐ Fail
- Moderate: ☐ Pass ☐ Fail

Notes:
_______________________________________________
_______________________________________________
_______________________________________________
```

---

## Success Criteria

All forms should:
✅ Load without errors
✅ Display data correctly
✅ Validate input properly
✅ Submit successfully
✅ Show appropriate feedback
✅ Handle errors gracefully
✅ Search and filter accurately
✅ Respond quickly to user actions
✅ Disable interactions during loading
✅ Provide helpful messages

If all tests pass, the admin forms are working correctly!
