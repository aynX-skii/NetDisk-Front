import { describe, expect, it } from 'vitest'

import { buildUploadSelection } from '../utils/upload-plan'

describe('buildUploadSelection', () => {
  it('builds nested directories from webkitRelativePath', () => {
    const file = new File(['hello'], 'readme.txt')
    Object.defineProperty(file, 'webkitRelativePath', {
      value: 'docs/spec/readme.txt',
    })

    const selection = buildUploadSelection([file])

    expect(selection.directories.map((entry) => entry.path)).toEqual(['docs', 'docs/spec'])
    expect(selection.files[0]?.relativePath).toBe('docs/spec')
  })
})
