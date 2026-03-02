import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useUploadDocument } from '../../hooks/useDocuments';
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE_MB } from '../../utils/constants';

export default function DocumentUpload() {
  const uploadMutation = useUploadDocument();

  const onDrop = useCallback(
    (acceptedFiles) => {
      acceptedFiles.forEach((file) => {
        uploadMutation.mutate(file);
      });
    },
    [uploadMutation]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'text/markdown': ['.md'],
    },
    maxSize: MAX_FILE_SIZE_MB * 1024 * 1024,
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors ${
        isDragActive
          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10'
          : 'border-gray-300 dark:border-gray-600 hover:border-primary-400 dark:hover:border-primary-500'
      }`}
    >
      <input {...getInputProps()} />
      <svg className="w-10 h-10 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
      </svg>
      {isDragActive ? (
        <p className="text-primary-600 font-medium">Drop files here</p>
      ) : (
        <>
          <p className="text-gray-600 dark:text-gray-300 font-medium">
            Drag & drop files here, or click to browse
          </p>
          <p className="text-sm text-gray-400 mt-1">
            PDF, TXT, MD (max {MAX_FILE_SIZE_MB}MB)
          </p>
        </>
      )}
      {uploadMutation.isPending && (
        <p className="text-sm text-primary-600 mt-2 animate-pulse">Uploading...</p>
      )}
    </div>
  );
}
