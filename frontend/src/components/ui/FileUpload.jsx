import { useState, useRef, useCallback } from 'react';
import { Upload, X, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { api } from '../../api/api';

/**
 * Drag-and-drop / click-to-browse file upload component.
 *
 * Props:
 *  - category:          'DOCUMENT' | 'PROFILE_PHOTO'
 *  - onUploadComplete:  (url: string) => void
 *  - label:             optional label text
 *  - accept:            optional file accept string (default: 'image/*')
 *  - className:         optional extra container classes
 *  - compact:           boolean — use a smaller layout (for profile photo inside a grid)
 *  - existingUrl:       optional — show existing image as the initial preview
 */
export default function FileUpload({
  category,
  onUploadComplete,
  label,
  accept = 'image/jpeg,image/png,image/webp',
  className,
  compact = false,
  existingUrl = '',
}) {
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState(existingUrl || '');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [done, setDone] = useState(!!existingUrl);
  const inputRef = useRef(null);

  const handleFile = useCallback(
    async (file) => {
      if (!file) return;

      // Client-side validation
      const allowed = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowed.includes(file.type)) {
        setError('Only JPEG, PNG or WebP images are accepted');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('File must be under 5 MB');
        return;
      }

      setError('');
      setDone(false);
      setPreview(URL.createObjectURL(file));
      setUploading(true);
      setProgress(0);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', category);

      try {
        const response = await api.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (e) => {
            if (e.total) {
              setProgress(Math.round((e.loaded * 100) / e.total));
            }
          },
        });
        setDone(true);
        setUploading(false);
        setProgress(100);
        onUploadComplete?.(response.url);
      } catch (err) {
        setError(err.message || 'Upload failed');
        setUploading(false);
        setProgress(0);
      }
    },
    [category, onUploadComplete]
  );

  const onDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer?.files?.[0];
      handleFile(file);
    },
    [handleFile]
  );

  const onFileSelect = useCallback(
    (e) => {
      const file = e.target.files?.[0];
      handleFile(file);
    },
    [handleFile]
  );

  const reset = () => {
    setPreview('');
    setError('');
    setDone(false);
    setProgress(0);
    setUploading(false);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label className="block font-mono text-[10px] uppercase tracking-widest text-mute">
          {label}
        </label>
      )}

      <div
        role="button"
        tabIndex={0}
        onDrop={onDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onClick={() => !uploading && inputRef.current?.click()}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click(); }}
        className={cn(
          'relative flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-lg border-2 border-dashed transition-all duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 focus-visible:ring-offset-paper',
          compact ? 'h-32' : 'min-h-[180px] p-8',
          dragOver
            ? 'border-accent-500 bg-accent-50/60'
            : error
              ? 'border-bad/40 bg-bad/5'
              : done
                ? 'border-good/40 bg-good/5'
                : 'border-line bg-[#FBF8F2] hover:border-accent-400 hover:bg-accent-50/30'
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={onFileSelect}
          className="hidden"
          aria-label="Choose file"
        />

        {/* Upload progress bar */}
        {uploading && (
          <motion.div
            className="absolute inset-x-0 bottom-0 h-1 bg-accent-100"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="h-full bg-accent-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: 'easeOut' }}
            />
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {preview ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center gap-3"
            >
              <img
                src={preview}
                alt="Preview"
                className={cn(
                  'rounded object-cover',
                  compact ? 'h-20 w-20' : 'h-28 w-28'
                )}
              />
              {done && !uploading && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-good">
                  <CheckCircle className="h-3.5 w-3.5" /> Uploaded
                </span>
              )}
              {uploading && (
                <span className="text-xs text-mute">Uploading… {progress}%</span>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-2 text-center"
            >
              <Upload
                className={cn(
                  'text-accent-400',
                  compact ? 'h-6 w-6' : 'h-8 w-8'
                )}
                strokeWidth={1.5}
              />
              {!compact && (
                <>
                  <p className="text-sm font-medium text-ink/70">
                    Drop an image here or{' '}
                    <span className="text-accent-600 underline underline-offset-2">browse</span>
                  </p>
                  <p className="text-[11px] text-mute">JPEG, PNG or WebP · max 5 MB</p>
                </>
              )}
              {compact && (
                <p className="text-[11px] text-mute">Upload</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Remove / retry overlay */}
        {(done || error) && !uploading && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); reset(); }}
            className="absolute right-2 top-2 rounded-full bg-ink/10 p-1 text-ink/50 transition-colors hover:bg-ink/20 hover:text-ink/80"
            aria-label="Remove"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="flex items-center gap-1.5 text-xs text-bad"
          >
            <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
