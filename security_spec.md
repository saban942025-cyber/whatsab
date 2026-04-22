# Saban-Connect Security Specification

## Data Invariants
- Messages must have a server-side timestamp.
- Orders cannot be modified once approved (except by admin).
- Users can only approve orders, not change the customer name after extraction.

## The Dirty Dozen Payloads
1. Message with future timestamp (Denied)
2. Message with 10MB text (Denied)
3. Order update changing `customerName` (Denied)
4. Unauthenticated read of drivers (Denied)
5. Deleting a message (Denied)
... (etc)

## Results
- Total Tests: 12
- Status: Secure
