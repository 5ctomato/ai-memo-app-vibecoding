// __tests__/drizzle/schema.test.ts
// DrizzleORM 스키마 검증 테스트
// 스키마 정의가 올바르게 구성되었는지 확인

import { users, notes, tags, noteTags } from '../../drizzle/schema';

describe('DrizzleORM Schema', () => {
  test('should have correct users table structure', () => {
    expect(users).toBeDefined();
    expect(users.id).toBeDefined();
    expect(users.email).toBeDefined();
    expect(users.createdAt).toBeDefined();
    expect(users.updatedAt).toBeDefined();
  });

  test('should have correct notes table structure', () => {
    expect(notes).toBeDefined();
    expect(notes.id).toBeDefined();
    expect(notes.userId).toBeDefined();
    expect(notes.title).toBeDefined();
    expect(notes.content).toBeDefined();
    expect(notes.isArchived).toBeDefined();
    expect(notes.createdAt).toBeDefined();
    expect(notes.updatedAt).toBeDefined();
  });

  test('should have correct tags table structure', () => {
    expect(tags).toBeDefined();
    expect(tags.id).toBeDefined();
    expect(tags.userId).toBeDefined();
    expect(tags.name).toBeDefined();
    expect(tags.color).toBeDefined();
    expect(tags.createdAt).toBeDefined();
    expect(tags.updatedAt).toBeDefined();
  });

  test('should have correct noteTags junction table structure', () => {
    expect(noteTags).toBeDefined();
    expect(noteTags.id).toBeDefined();
    expect(noteTags.noteId).toBeDefined();
    expect(noteTags.tagId).toBeDefined();
    expect(noteTags.createdAt).toBeDefined();
  });
});
