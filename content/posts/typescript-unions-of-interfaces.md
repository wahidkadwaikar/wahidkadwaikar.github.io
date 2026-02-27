---
title: "TypeScript: Unions of Interfaces"
date: 2025-10-09
draft: false
toc: true
tags: ["typescript", "programming", "interfaces", "types"]
categories: ["Programming"]
---

TypeScript's type system offers powerful ways to combine and shape data structures. Unions of interfaces (or object types) are one of the most useful patterns for modeling data that can take multiple forms. Let's explore how to use them effectively.

## What Are Unions of Interfaces?

A union of interfaces allows a single type to represent multiple different shapes. This is useful when data can take one of several forms.

```typescript
interface TextContent {
  kind: 'text';
  charCount: number;
}

interface ImageContent {
  kind: 'image';
  width: number;
  height: number;
}

interface VideoContent {
  kind: 'video';
  width: number;
  height: number;
  duration: number;
}

type Content = TextContent | ImageContent | VideoContent;
```

## Discriminated Unions

The most powerful pattern for unions of interfaces is the **discriminated union**. Each member shares a common property (the discriminant) that identifies which type it is.

```typescript
interface Circle {
  kind: 'circle';
  radius: number;
}

interface Square {
  kind: 'square';
  sideLength: number;
}

interface Rectangle {
  kind: 'rectangle';
  width: number;
  height: number;
}

type Shape = Circle | Square | Rectangle;
```

The `kind` property is our discriminant. TypeScript uses it to narrow types when we check it.

## Type Narrowing with Discriminated Unions

Once you check the discriminant, TypeScript automatically narrows the type:

```typescript
function getArea(shape: Shape): number {
  switch (shape.kind) {
    case 'circle':
      return Math.PI * shape.radius * shape.radius;
    case 'square':
      return shape.sideLength * shape.sideLength;
    case 'rectangle':
      return shape.width * shape.height;
  }
}
```

After checking `shape.kind`, TypeScript knows exactly which properties are available on `shape`. This provides complete type safety.

## Exhaustiveness Checking

A powerful technique is to ensure you've handled all cases using the `never` type:

```typescript
function describe(shape: Shape): string {
  switch (shape.kind) {
    case 'circle':
      return `Circle with radius ${shape.radius}`;
    case 'square':
      return `Square with side ${shape.sideLength}`;
    case 'rectangle':
      return `Rectangle ${shape.width}x${shape.height}`;
    default:
      // If we forget a case, this becomes a compile error
      const _exhaustive: never = shape;
      return _exhaustive;
  }
}
```

If you add a new type to `Shape` but forget to handle it, TypeScript will error on the `_exhaustive` line.

## Practical Example: API Response Types

A common use case is modeling API responses with different states:

```typescript
interface LoadingState {
  status: 'loading';
}

interface SuccessState {
  status: 'success';
  data: unknown;
}

interface ErrorState {
  status: 'error';
  message: string;
}

type AsyncState = LoadingState | SuccessState | ErrorState;

function handleState(state: AsyncState): string {
  switch (state.status) {
    case 'loading':
      return 'Loading...';
    case 'success':
      return `Got data: ${JSON.stringify(state.data)}`;
    case 'error':
      return `Error: ${state.message}`;
  }
}
```

## Union of Interfaces vs Class Hierarchies

You might wonder when to use unions of interfaces versus class inheritance:

### Class Hierarchy

```typescript
abstract class Shape {
  abstract area(): number;
}

class Circle extends Shape {
  constructor(public radius: number) {
    super();
  }
  area(): number {
    return Math.PI * this.radius ** 2;
  }
}

class Square extends Shape {
  constructor(public side: number) {
    super();
  }
  area(): number {
    return this.side ** 2;
  }
}
```

### Discriminated Union

```typescript
interface Circle {
  kind: 'circle';
  radius: number;
}

interface Square {
  kind: 'square';
  side: number;
}

type Shape = Circle | Square;

function area(shape: Shape): number {
  switch (shape.kind) {
    case 'circle':
      return Math.PI * shape.radius ** 2;
    case 'square':
      return shape.side ** 2;
  }
}
```

### When to Use Each

| Aspect | Class Hierarchy | Discriminated Union |
|--------|----------------|---------------------|
| Adding new operations | Modify all classes | Add one function |
| Adding new types | No changes needed | Modify all functions |
| Runtime type checking | `instanceof` | Discriminant check |
| Serialization | Requires extra work | Natural fit for JSON |

## Extracting Types from Unions

You can extract specific types from a union:

```typescript
type Shape = Circle | Square | Rectangle;

// Extract just Circle
type CircleOnly = Shape extends { kind: 'circle' } ? Shape : never;

// Using Extract utility type
type CircleFromUnion = Extract<Shape, { kind: 'circle' }>;
```

## Common Patterns

### 1. Optional Discriminant

```typescript
interface File {
  path: string;
}

interface Directory {
  path: string;
  children: FileSystemNode[];
}

type FileSystemNode = File | Directory;
```

### 2. Multiple Discriminants

```typescript
interface DraftPost {
  status: 'draft';
  content: string;
  lastEdited: Date;
}

interface PublishedPost {
  status: 'published';
  content: string;
  publishedAt: Date;
  views: number;
}

interface ArchivedPost {
  status: 'archived';
  content: string;
  archivedAt: Date;
}

type BlogPost = DraftPost | PublishedPost | ArchivedPost;
```

### 3. Intersections with Unions

```typescript
interface Timestamped {
  createdAt: Date;
  updatedAt: Date;
}

interface User {
  name: string;
  email: string;
}

type TimestampedUser = User & Timestamped;
```

## Best Practices

1. **Use discriminants consistently** - Pick a property name like `kind`, `type`, or `status` and use it everywhere

2. **Keep discriminants as string literals** - Don't use enums or numbers for type tags

3. **Order properties wisely** - Put the discriminant first for readability

4. **Use exhaustiveness checking** - Add the `never` check to catch missing cases

5. **Document complex unions** - Add comments explaining when each variant is used

## Common Pitfalls

### Forgetting a Case

```typescript
// This will error at compile time if you forget a case
function process(shape: Shape): void {
  switch (shape.kind) {
    case 'circle':
      // handle circle
      break;
    // forgot square and rectangle
    default:
      const _: never = shape;
      _; // Error: Type 'Square | Rectangle' is not assignable to type 'never'
  }
}
```

### Non-Discriminated Unions

Without a discriminant, TypeScript can only access common properties:

```typescript
interface A {
  a: number;
  uniqueA: string;
}

interface B {
  a: number;
  uniqueB: boolean;
}

type AB = A | B;

function process(ab: AB): void {
  console.log(ab.a); // OK - common property
  // console.log(ab.uniqueA); // Error: Property 'uniqueA' does not exist on type 'B'
}
```

## Conclusion

Unions of interfaces (discriminated unions) are one of TypeScript's most powerful features for modeling complex data structures. They provide compile-time safety, excellent IDE support, and make your code self-documenting. Use them when your data can take one of several distinct forms.

The key takeaways:

- Use a discriminant property to identify each variant
- Leverage type narrowing for safe property access
- Use `never` for exhaustiveness checking
- Prefer discriminated unions over class hierarchies when adding new operations
