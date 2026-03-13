# Security Policy

## Supported Versions

Only the latest version of StudyHub receives security updates.

| Version | Supported |
| ------- | --------- |
| latest (main) | ✅ |
| older branches | ❌ |

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

If you discover a security vulnerability, please report it responsibly by sending an email to:

📧 **kai.s.alvarenga@gmail.com**

Include in your report:
- A description of the vulnerability
- Steps to reproduce the issue
- Potential impact
- Any suggested fix (optional)

You can expect a response within **72 hours**. We will keep you informed of the progress toward a fix and may ask for additional information.

## Security Considerations

This project handles user authentication and personal study data. Key areas of concern include:

- **Authentication**: Powered by NextAuth v5 — report any bypass or session issues
- **Database access**: All queries go through Prisma with parameterized inputs
- **API routes**: Protected by session validation on every request
- **User data**: Study sessions, subjects, and topics are scoped per user

## Out of Scope

The following are **not** considered security vulnerabilities for this project:

- Issues in dependencies — please report those directly to the respective maintainers
- Vulnerabilities that require physical access to the server
- Social engineering attacks

## Disclosure Policy

Once a fix is released, we will publicly disclose the vulnerability details in the repository's security advisories.

Thank you for helping keep StudyHub secure. 🔒
