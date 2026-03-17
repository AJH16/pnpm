import fs from 'fs'
import path from 'path'
import { jest } from '@jest/globals'
import { tempDir } from '@pnpm/prepare'

// renameOverwrite is mocked to simulate a worst-case scenario where it always
// fails with ENOTEMPTY. In production, rename-overwrite handles ENOTEMPTY
// internally with swap-rename, but we test the fallback path here.
const renameOverwriteSyncMock = jest.fn()
jest.unstable_mockModule('rename-overwrite', () => ({
  renameOverwrite: jest.fn(),
  renameOverwriteSync: renameOverwriteSyncMock,
}))

const { importIndexedDir } = await import('../src/importIndexedDir.js')

beforeEach(() => {
  renameOverwriteSyncMock.mockReset()
})

test('importIndexedDir with safeToSkip succeeds when target already has expected content', () => {
  const tmp = tempDir()
  const srcFile = path.join(tmp, 'src', 'index.js')
  const newDir = path.join(tmp, 'dest')

  // Create source file
  fs.mkdirSync(path.join(tmp, 'src'), { recursive: true })
  fs.writeFileSync(srcFile, 'content')

  // Pre-create target with expected content (simulating another thread completed first)
  fs.mkdirSync(newDir, { recursive: true })
  fs.writeFileSync(path.join(newDir, 'index.js'), 'content')

  const filenames = new Map([['index.js', srcFile]])

  // Should not throw — safeToSkip detects the target already has the expected
  // content and returns without calling renameOverwriteSync
  importIndexedDir(fs.copyFileSync, newDir, filenames, { safeToSkip: true })

  expect(fs.existsSync(path.join(newDir, 'index.js'))).toBe(true)
  // renameOverwriteSync should not be called when safeToSkip detects matching content
  expect(renameOverwriteSyncMock).not.toHaveBeenCalled()
})

test('importIndexedDir with safeToSkip falls through to renameOverwriteSync when target has different content', () => {
  const tmp = tempDir()
  const srcFile = path.join(tmp, 'src', 'index.js')
  const newDir = path.join(tmp, 'dest')

  // Create source file with different content
  fs.mkdirSync(path.join(tmp, 'src'), { recursive: true })
  fs.writeFileSync(srcFile, 'new-content')

  // Pre-create target with DIFFERENT content
  fs.mkdirSync(newDir, { recursive: true })
  fs.writeFileSync(path.join(newDir, 'index.js'), 'old-content')

  const filenames = new Map([['index.js', srcFile]])

  renameOverwriteSyncMock.mockImplementation(() => {
    throw Object.assign(new Error('ENOTEMPTY: directory not empty'), { code: 'ENOTEMPTY' })
  })

  // Should throw because target has wrong content and renameOverwriteSync also fails
  expect(() => {
    importIndexedDir(fs.copyFileSync, newDir, filenames, { safeToSkip: true })
  }).toThrow('ENOTEMPTY')
})

test('importIndexedDir without safeToSkip throws ENOTEMPTY when renameOverwriteSync fails', () => {
  const tmp = tempDir()
  const srcFile = path.join(tmp, 'src', 'index.js')
  const newDir = path.join(tmp, 'dest')

  // Create source file
  fs.mkdirSync(path.join(tmp, 'src'), { recursive: true })
  fs.writeFileSync(srcFile, 'content')

  const filenames = new Map([['index.js', srcFile]])

  renameOverwriteSyncMock.mockImplementation(() => {
    throw Object.assign(new Error('ENOTEMPTY: directory not empty'), { code: 'ENOTEMPTY' })
  })

  expect(() => {
    importIndexedDir(fs.copyFileSync, newDir, filenames, {})
  }).toThrow('ENOTEMPTY')
})
