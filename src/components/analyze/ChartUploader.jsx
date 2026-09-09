import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { cn } from '@/lib/utils';

const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
const MAX_FILE_SIZE_MB = 10;

export default function ChartUploader({ chartUrl, onUpload, onClear }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [localPreview, setLocalPreview] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const fileRef = useRef(null);

  const compressImage = (file) => new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const maxW = 900, maxH = 675;
      let { width, height } = img;
      if (width > maxW || height > maxH) {
        const ratio = Math.min(maxW / width, maxH / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      canvas.getContext('2d').drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);
      canvas.toBlob(resolve, 'image/jpeg', 0.72);
    };
    img.src = url;
  });

  const handleFile = async (file) => {
    if (!file) return;
    setUploadError(null);

    // Strict file type validation
    if (!ALLOWED_TYPES.includes(file.type)) {
      setUploadError('Only PNG, JPG, JPEG, and WEBP images are allowed.');
      return;
    }
    // File size limit
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setUploadError(`File too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.`);
      return;
    }

    const preview = URL.createObjectURL(file);
    setLocalPreview(preview);
    setIsUploading(true);
    try {
      const compressed = await compressImage(file);
      const smallFile = new File([compressed], 'chart.jpg', { type: 'image/jpeg' });
      const { file_url } = await base44.integrations.Core.UploadFile({ file: smallFile });
      URL.revokeObjectURL(preview);
      setLocalPreview(null);
      onUpload(file_url);
    } catch {
      setUploadError('Upload failed. Please try again.');
      setLocalPreview(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  return (
    <div className="neon-border rounded-xl bg-card/60 backdrop-blur-sm overflow-hidden">
      <div className="p-5 border-b border-border/50">
        <div className="flex items-center gap-2">
          <Upload className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">Upload Chart</h2>
        </div>
      </div>
      <div className="p-4">
        {chartUrl || localPreview ? (
          <div className="relative rounded-lg overflow-hidden border border-border/50">
            <img src={chartUrl || localPreview} alt="Chart" className="w-full max-h-80 object-contain bg-black/50" />
            {isUploading && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs text-white font-medium">Uploading...</p>
                </div>
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={onClear}
              className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white h-7 w-7"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            className={cn(
              "border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-all",
              isDragging ? "border-primary bg-primary/5" : "border-border/50 hover:border-primary/40 hover:bg-secondary/20"
            )}
          >
            {isUploading ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-muted-foreground">Uploading...</p>
              </div>
            ) : (
              <>
                <ImageIcon className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-sm font-medium text-foreground">Upload Trading Chart</p>
                <p className="text-xs text-muted-foreground mt-1">Drag and drop or click to select a chart image</p>
                <p className="text-[10px] text-muted-foreground/50 mt-2">Supports: PNG, JPG, JPEG, WEBP</p>
              </>
            )}
          </div>
        )}
        {uploadError && (
          <div className="mt-2 flex items-center gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            {uploadError}
          </div>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp"
          className="hidden"
          onChange={(e) => handleFile(e.target.files[0])}
        />
      </div>
    </div>
  );
}