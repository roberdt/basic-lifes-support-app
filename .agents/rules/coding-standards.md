---
trigger: always_on
---

# Coding Standards

## Backend (Java / Spring Boot)
- Use constructor injection (`@RequiredArgsConstructor` or explicit constructors) instead of field `@Autowired`.
- Validate incoming request payloads with `@Valid` in controllers; handle exceptions globally via `@ControllerAdvice`.
- Use `camelCase` for methods/variables, `PascalCase` for classes, and `UPPER_SNAKE_CASE` for constants.

## Frontend (TypeScript / Next.js)
- Strict TypeScript: no `any`; define explicit interfaces in `types/`.
- Use functional components with named exports in `components/`, and default exports for Next.js `page.tsx` / `layout.tsx`.
- Handle loading and error states cleanly when calling `services/`.