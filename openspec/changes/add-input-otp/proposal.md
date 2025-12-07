# Add Input OTP Base UI Kit Element

## Purpose

Add an Input OTP component to the `@hai3/uikit` package for one-time password and verification code input fields.

## What Changes

1. **New Package Dependency**: Install `input-otp` library in packages/uikit
2. **New Icon**: Create `MinusIcon` in packages/uikit/src/icons/ for the separator
3. **New Component**: Create `input-otp.tsx` in packages/uikit/src/base/ with InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator
4. **Export**: Add exports to packages/uikit/src/index.ts
5. **Demo**: Add Input OTP examples to FormElements.tsx (basic, with separator, controlled)
6. **Translations**: Add translation keys to all 36 language files
7. **Category System**: Add 'Input OTP' to IMPLEMENTED_ELEMENTS array

## Impact

- Low risk: Self-contained new component
- No breaking changes to existing components
- Adds new `input-otp` dependency to uikit package
