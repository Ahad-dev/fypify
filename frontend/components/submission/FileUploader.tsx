'use client';

import { useCallback, useState, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Upload,
  FileText,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  File,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  useUploadFile,
  validateFile,
  formatFileSize,
  FileValidationOptions,
} from '@/shared/hooks/useFile';
import { CloudinaryFile } from '@/shared/types';

interface FileUploaderProps {
  onFileUploaded: (file: CloudinaryFile) => void;
  onError?: (error: string) => void;
  folder?: string;
  accept?: Record<string, string[]>;
  maxSize?: number; // in bytes
  allowedExtensions?: string[];
  disabled?: boolean;
  className?: string;
}

/**
 * FileUploader Component
 * 
 * A drag-and-drop file uploader with:
 * - Progress tracking
 * - File validation (size, type, extension)
 * - Preview of selected file
 * - Upload status feedback
 */
export function FileUploader({
  onFileUploaded,
  onError,
  folder = 'submissions',
  accept = {
    'application/pdf': ['.pdf'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  },
  maxSize = 50 * 1024 * 1024, // 50MB default
  allowedExtensions = ['.pdf', '.doc', '.docx'],
  disabled = false,
  className,
}: FileUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<CloudinaryFile | null>(null);

  const { mutateAsync: uploadFile, progress, isUploading, isPending, resetProgress } = useUploadFile();

  const validationOptions: FileValidationOptions = {
    maxSize,
    allowedExtensions,
  };

  const handleFileDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];
      setValidationError(null);
      setUploadedFile(null);
      resetProgress();

      // Validate file
      const validation = validateFile(file, validationOptions);
      if (!validation.isValid) {
        setValidationError(validation.error || 'Invalid file');
        onError?.(validation.error || 'Invalid file');
        return;
      }

      setSelectedFile(file);
    },
    [onError, resetProgress, validationOptions]
  );

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      const result = await uploadFile({ file: selectedFile, folder });
      setUploadedFile(result);
      onFileUploaded(result);
    } catch (error: any) {
      const message = error?.message || 'Upload failed';
      setValidationError(message);
      onError?.(message);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setValidationError(null);
    setUploadedFile(null);
    resetProgress();
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleFileDrop,
    accept,
    maxFiles: 1,
    disabled: disabled || isUploading || !!uploadedFile,
  });

  const isComplete = !!uploadedFile;
  const showProgress = isUploading || (progress > 0 && progress < 100);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={cn(
          'relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all',
          'hover:border-primary/50 hover:bg-muted/50',
          isDragActive && 'border-primary bg-primary/5',
          isComplete && 'border-green-500 bg-green-50 dark:bg-green-900/10',
          validationError && 'border-destructive bg-destructive/5',
          (disabled || isUploading) && 'opacity-50 cursor-not-allowed',
          !selectedFile && !validationError && 'border-muted-foreground/25'
        )}
      >
        <input {...getInputProps()} />

        {!selectedFile && !validationError && (
          <div className="flex flex-col items-center gap-3">
            <div className="p-4 rounded-full bg-muted">
              <Upload className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium">
                {isDragActive ? 'Drop your file here' : 'Drag & drop your file here'}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                or click to browse
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2 mt-2">
              {allowedExtensions.map((ext) => (
                <Badge key={ext} variant="secondary" className="text-xs">
                  {ext.toUpperCase()}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Max size: {formatFileSize(maxSize)}
            </p>
          </div>
        )}

        {selectedFile && !validationError && (
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-muted">
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-medium truncate max-w-[300px]">{selectedFile.name}</p>
              <p className="text-sm text-muted-foreground">
                {formatFileSize(selectedFile.size)}
              </p>
              {showProgress && (
                <div className="mt-2">
                  <Progress value={progress} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">{progress}% uploaded</p>
                </div>
              )}
            </div>
            {isComplete && (
              <CheckCircle2 className="h-6 w-6 text-green-500 shrink-0" />
            )}
            {!isUploading && !isComplete && (
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveFile();
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}

        {validationError && (
          <div className="flex items-center gap-3 text-destructive">
            <AlertCircle className="h-6 w-6" />
            <div className="text-left">
              <p className="font-medium">Upload Error</p>
              <p className="text-sm">{validationError}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveFile();
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Upload Button */}
      {selectedFile && !isComplete && !validationError && (
        <Button
          onClick={handleUpload}
          disabled={isUploading || isPending}
          className="w-full"
        >
          {isUploading || isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading... {progress}%
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload File
            </>
          )}
        </Button>
      )}

      {/* Success State */}
      {isComplete && uploadedFile && (
        <Card className="border-green-200 bg-green-50 dark:bg-green-900/10">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                  File uploaded successfully!
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 truncate">
                  {uploadedFile.fileName}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRemoveFile}
              >
                Upload Different File
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default FileUploader;

