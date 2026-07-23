# FAQ & Troubleshooting

Common questions and resolution steps when working with CineVerse.

---

## ❓ Frequently Asked Questions

### Q: Why do I get a Clerk auth error during local development?
**A**: Ensure `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` are populated in `.env`.

### Q: Why are AI recommendations taking a long time?
**A**: Check that `GROQ_API_KEY` is set and valid. Without Groq, fallback mock recommendations are served.

### Q: How do I test Watch Party synchronization locally?
**A**: Open two incognito browser windows to `/watch-party/[roomId]`.
