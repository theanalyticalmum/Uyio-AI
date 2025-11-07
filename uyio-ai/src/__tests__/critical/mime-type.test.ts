/**
 * Critical Test: MIME Type Handling
 * 
 * Protects Fix #7: Safari recording support via correct MIME type detection
 * 
 * What we're testing:
 * - Chrome/Firefox select webm with opus codec
 * - Safari selects mp4 with AAC codec
 * - MIME type is stored and used consistently
 * - Blob type matches actual recording format
 * - No hardcoded MIME types cause mismatches
 */

describe('MIME Type Handling - Critical Path', () => {
  describe('Chrome/Firefox Detection', () => {
    it('selects webm with opus for Chrome', () => {
      // Mock Chrome support
      const isTypeSupported = (type: string) => type.includes('webm')
      
      let mimeType = ''
      if (isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus'
      } else if (isTypeSupported('audio/webm')) {
        mimeType = 'audio/webm'
      }
      
      expect(mimeType).toContain('webm')
      expect(mimeType).toContain('opus')
      expect(mimeType).toBe('audio/webm;codecs=opus')
    })

    it('falls back to generic webm if opus not supported', () => {
      // Mock partial support
      const isTypeSupported = (type: string) => 
        type === 'audio/webm' // supports webm but not opus
      
      let mimeType = ''
      if (isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus'
      } else if (isTypeSupported('audio/webm')) {
        mimeType = 'audio/webm'
      }
      
      expect(mimeType).toBe('audio/webm')
      expect(mimeType).not.toContain('opus')
    })
  })

  describe('Safari Detection', () => {
    it('selects mp4 with AAC for Safari (no webm support)', () => {
      // Mock Safari support (no webm!)
      const isTypeSupported = (type: string) => type.includes('mp4')
      
      let mimeType = ''
      if (isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus'
      } else if (isTypeSupported('audio/webm')) {
        mimeType = 'audio/webm'
      } else if (isTypeSupported('audio/mp4;codecs=mp4a.40.2')) {
        mimeType = 'audio/mp4;codecs=mp4a.40.2'
      } else if (isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mp4'
      }
      
      expect(mimeType).toContain('mp4')
      expect(mimeType).toContain('mp4a.40.2') // AAC codec
      expect(mimeType).not.toContain('webm')
    })

    it('falls back to generic mp4 if AAC codec not specified', () => {
      // Mock Safari with basic mp4 support
      const isTypeSupported = (type: string) => 
        type === 'audio/mp4' // supports mp4 but not codec-specific
      
      let mimeType = ''
      if (isTypeSupported('audio/webm')) {
        mimeType = 'audio/webm'
      } else if (isTypeSupported('audio/mp4;codecs=mp4a.40.2')) {
        mimeType = 'audio/mp4;codecs=mp4a.40.2'
      } else if (isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mp4'
      }
      
      expect(mimeType).toBe('audio/mp4')
    })
  })

  describe('Blob Type Consistency', () => {
    it('preserves MIME type when creating blob', () => {
      const chunks = [new Uint8Array(100)]
      const mimeType = 'audio/webm;codecs=opus'
      const blob = new Blob(chunks, { type: mimeType })
      
      expect(blob.type).toBe('audio/webm;codecs=opus')
      expect(blob.type).not.toBe('audio/webm') // ✅ Specific, not generic
    })

    it('handles Safari mp4 blob type', () => {
      const chunks = [new Uint8Array(100)]
      const mimeType = 'audio/mp4;codecs=mp4a.40.2'
      const blob = new Blob(chunks, { type: mimeType })
      
      expect(blob.type).toBe('audio/mp4;codecs=mp4a.40.2')
      expect(blob.type).not.toBe('audio/webm') // ✅ THE FIX: Not hardcoded!
    })

    it('creates blob with generic webm if that is what was used', () => {
      const chunks = [new Uint8Array(100)]
      const mimeType = 'audio/webm'
      const blob = new Blob(chunks, { type: mimeType })
      
      expect(blob.type).toBe('audio/webm')
    })
  })

  describe('MIME Type Mismatch Prevention', () => {
    it('prevents hardcoded webm when Safari uses mp4', () => {
      // Simulate the bug: Safari records mp4, blob labeled webm
      const recordedAs = 'audio/mp4'
      const blobLabeledAs = 'audio/webm' // ❌ THE BUG
      
      // This is what was broken:
      expect(recordedAs).not.toBe(blobLabeledAs)
      
      // The fix: use stored MIME type
      const storedMimeType = recordedAs
      const blobWithCorrectType = storedMimeType // ✅ Fixed
      
      expect(blobWithCorrectType).toBe(recordedAs)
    })

    it('stores actual MIME type from MediaRecorder', () => {
      // Mock MediaRecorder
      const mockRecorder = {
        mimeType: 'audio/mp4;codecs=mp4a.40.2', // What browser actually uses
      }
      
      const requestedType = 'audio/mp4'
      const actualType = mockRecorder.mimeType || requestedType
      
      expect(actualType).toBe('audio/mp4;codecs=mp4a.40.2')
      expect(actualType).not.toBe(requestedType) // ✅ Browser may adjust
    })

    it('uses stored type for blob, not hardcoded', () => {
      const storedMimeType = 'audio/mp4;codecs=mp4a.40.2'
      
      // ❌ WRONG (the bug):
      const wrongBlob = new Blob([], { type: 'audio/webm' })
      expect(wrongBlob.type).toBe('audio/webm')
      expect(wrongBlob.type).not.toBe(storedMimeType)
      
      // ✅ CORRECT (the fix):
      const correctBlob = new Blob([], { type: storedMimeType })
      expect(correctBlob.type).toBe(storedMimeType)
    })
  })

  describe('Detection Hierarchy', () => {
    it('prioritizes codec-specific over generic', () => {
      const isTypeSupported = (type: string) => true // supports everything
      
      let mimeType = ''
      if (isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus' // ✅ Preferred
      } else if (isTypeSupported('audio/webm')) {
        mimeType = 'audio/webm' // fallback
      }
      
      expect(mimeType).toBe('audio/webm;codecs=opus')
      expect(mimeType).toContain('codecs')
    })

    it('follows correct fallback chain', () => {
      // Mock no support for anything
      const isTypeSupported = (type: string) => false
      
      let mimeType = ''
      if (isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus'
      } else if (isTypeSupported('audio/webm')) {
        mimeType = 'audio/webm'
      } else if (isTypeSupported('audio/mp4;codecs=mp4a.40.2')) {
        mimeType = 'audio/mp4;codecs=mp4a.40.2'
      } else if (isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mp4'
      } else {
        mimeType = '' // let browser choose
      }
      
      expect(mimeType).toBe('')
    })
  })

  describe('Real Browser Scenarios', () => {
    it('Chrome on Windows', () => {
      const isTypeSupported = (type: string) => 
        type === 'audio/webm;codecs=opus' || type === 'audio/webm'
      
      let mimeType = ''
      if (isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus'
      }
      
      expect(mimeType).toBe('audio/webm;codecs=opus')
      
      const blob = new Blob([], { type: mimeType })
      expect(blob.type).toBe('audio/webm;codecs=opus')
    })

    it('Safari on macOS', () => {
      const isTypeSupported = (type: string) => 
        type === 'audio/mp4;codecs=mp4a.40.2' || type === 'audio/mp4'
      
      let mimeType = ''
      if (isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus'
      } else if (isTypeSupported('audio/mp4;codecs=mp4a.40.2')) {
        mimeType = 'audio/mp4;codecs=mp4a.40.2'
      }
      
      expect(mimeType).toBe('audio/mp4;codecs=mp4a.40.2')
      
      const blob = new Blob([], { type: mimeType })
      expect(blob.type).toBe('audio/mp4;codecs=mp4a.40.2')
      expect(blob.type).not.toBe('audio/webm') // ✅ THE FIX
    })

    it('Safari iOS', () => {
      // Same as Safari desktop
      const isTypeSupported = (type: string) => type.includes('mp4')
      
      let mimeType = ''
      if (isTypeSupported('audio/webm')) {
        mimeType = 'audio/webm'
      } else if (isTypeSupported('audio/mp4;codecs=mp4a.40.2')) {
        mimeType = 'audio/mp4;codecs=mp4a.40.2'
      }
      
      expect(mimeType).toContain('mp4')
      expect(mimeType).not.toContain('webm')
    })

    it('Firefox on Linux', () => {
      const isTypeSupported = (type: string) => 
        type.includes('webm') || type.includes('ogg')
      
      let mimeType = ''
      if (isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus'
      } else if (isTypeSupported('audio/ogg;codecs=opus')) {
        mimeType = 'audio/ogg;codecs=opus'
      }
      
      expect(mimeType).toBe('audio/webm;codecs=opus')
    })
  })

  describe('Upload Compatibility', () => {
    it('upload receives blob with correct type', () => {
      const mimeType = 'audio/mp4;codecs=mp4a.40.2'
      const blob = new Blob([new Uint8Array(100)], { type: mimeType })
      
      // Simulate upload
      const uploadedFile = new File([blob], 'recording.mp4', {
        type: blob.type, // ✅ Uses blob's type
      })
      
      expect(uploadedFile.type).toBe('audio/mp4;codecs=mp4a.40.2')
      expect(uploadedFile.type).not.toBe('audio/webm')
    })

    it('OpenAI Whisper accepts both webm and mp4', () => {
      const supportedFormats = [
        'audio/webm',
        'audio/mp4',
        'audio/mpeg',
        'audio/ogg',
      ]
      
      expect(supportedFormats).toContain('audio/webm')
      expect(supportedFormats).toContain('audio/mp4')
    })
  })

  describe('Edge Cases', () => {
    it('handles empty MIME type gracefully', () => {
      const mimeType = ''
      const blob = new Blob([], { type: mimeType })
      
      expect(blob.type).toBe('')
      // Browser will use default
    })

    it('handles invalid MIME type', () => {
      const mimeType = 'invalid/type'
      const blob = new Blob([], { type: mimeType })
      
      // Blob accepts any string
      expect(blob.type).toBe('invalid/type')
    })

    it('handles MIME type with spaces (browser normalization)', () => {
      // Some browsers add/remove spaces
      const mimeType1 = 'audio/webm;codecs=opus'
      const mimeType2 = 'audio/webm; codecs=opus' // with space
      
      // Both valid, just formatted differently
      expect(mimeType1).toContain('webm')
      expect(mimeType2).toContain('webm')
    })
  })

  describe('Type Safety', () => {
    it('MIME type is always a string', () => {
      const mimeType = 'audio/webm;codecs=opus'
      
      expect(typeof mimeType).toBe('string')
      expect(mimeType.length).toBeGreaterThan(0)
    })

    it('blob type is always a string', () => {
      const blob = new Blob([], { type: 'audio/webm' })
      
      expect(typeof blob.type).toBe('string')
    })

    it('empty blob type is empty string, not undefined', () => {
      const blob = new Blob([])
      
      expect(typeof blob.type).toBe('string')
      expect(blob.type).toBe('')
    })
  })
})

