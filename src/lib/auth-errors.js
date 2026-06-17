export function formatAuthError(message = '') {
  const lower = message.toLowerCase()

  if (lower.includes('rate limit') || lower.includes('ratelimit') || lower.includes('too many')) {
    return {
      message: 'Supabase email rate limit hit — too many auth emails sent recently.',
      hint: 'For development, disable email confirmation in Supabase: Authentication → Providers → Email → turn off "Confirm email". Or add a user manually under Authentication → Users.',
    }
  }

  if (lower.includes('already registered') || lower.includes('already been registered')) {
    return {
      message: 'An account with this email already exists.',
      hint: 'Try signing in instead, or use a different email.',
    }
  }

  return { message, hint: null }
}