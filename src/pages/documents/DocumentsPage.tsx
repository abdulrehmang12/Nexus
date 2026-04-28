import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Download, FileSignature, FileText, Upload } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import api from '../../lib/api';
import { Document } from '../../types';
import { Button } from '../../components/ui/Button';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';

const assetBaseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api$/, '');

export const DocumentsPage: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [title, setTitle] = useState('');
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setDocumentFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg', '.svg'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/json': ['.json'],
      'text/plain': ['.txt'],
    },
  });

  const loadDocuments = async () => {
    const { data } = await api.get<Document[]>('/documents');
    setDocuments(data);
    setSelectedDocument((current) => current || data[0] || null);
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const storageSummary = useMemo(() => documents.length, [documents]);

  const handleUpload = async () => {
    if (!documentFile) {
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('title', title || documentFile.name);
      formData.append('document', documentFile);
      await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setTitle('');
      setDocumentFile(null);
      await loadDocuments();
    } finally {
      setIsUploading(false);
    }
  };

  const handleSignatureUpload = async () => {
    if (!selectedDocument || !signatureFile) {
      return;
    }

    const formData = new FormData();
    formData.append('signature', signatureFile);
    await api.post(`/documents/${selectedDocument._id}/sign`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    setSignatureFile(null);
    await loadDocuments();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Document Chamber</h1>
          <p className="text-gray-600">Upload, preview, and sign documents with the live backend.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <Card className="lg:col-span-1">
          <CardHeader>
            <h2 className="text-lg font-medium text-gray-900">Upload</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} fullWidth />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Document file</label>
              <div
                {...getRootProps()}
                className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-5 text-center transition-colors ${
                  isDragActive
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
                }`}
              >
                <input {...getInputProps()} />
                <Upload size={24} className={`mb-2 ${isDragActive ? 'text-primary-600' : 'text-gray-400'}`} />
                {documentFile ? (
                  <p className="text-sm font-medium text-gray-900">{documentFile.name}</p>
                ) : isDragActive ? (
                  <p className="text-sm text-primary-600">Drop the file here…</p>
                ) : (
                  <p className="text-sm text-gray-500">Drag &amp; drop a file, or click to browse</p>
                )}
                <p className="mt-1 text-xs text-gray-400">PDF, Word, Excel, images, JSON, text — max 10 MB</p>
              </div>
            </div>
            <Button leftIcon={<Upload size={18} />} fullWidth isLoading={isUploading} onClick={handleUpload}>
              Upload Document
            </Button>

            <div className="rounded-md bg-gray-50 p-4">
              <p className="text-sm text-gray-600">Stored documents</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">{storageSummary}</p>
            </div>
          </CardBody>
        </Card>

        <div className="space-y-6 lg:col-span-3">
          <Card>
            <CardHeader className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">Uploaded Documents</h2>
              <Badge variant="gray">{documents.length} total</Badge>
            </CardHeader>
            <CardBody className="space-y-3">
              {documents.map((doc) => (
                <button
                  key={doc._id}
                  onClick={() => setSelectedDocument(doc)}
                  className={`flex w-full items-center rounded-lg border p-4 text-left ${selectedDocument?._id === doc._id ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:bg-gray-50'}`}
                >
                  <div className="mr-4 rounded-lg bg-primary-100 p-2">
                    <FileText size={22} className="text-primary-700" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-900">{doc.title}</h3>
                      <Badge variant={doc.status === 'signed' ? 'success' : 'secondary'}>{doc.status}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      Version {doc.version} • Uploaded by {doc.uploadedBy?.name || 'Unknown'}
                    </p>
                  </div>
                  <a
                    href={`${assetBaseUrl}${doc.url}`}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-md p-2 text-gray-600 hover:bg-white"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <Download size={18} />
                  </a>
                </button>
              ))}
              {documents.length === 0 && <p className="text-sm text-gray-500">No documents uploaded yet.</p>}
            </CardBody>
          </Card>

          {selectedDocument && (
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
              <Card className="xl:col-span-2">
                <CardHeader>
                  <h2 className="text-lg font-medium text-gray-900">Preview</h2>
                </CardHeader>
                <CardBody>
                  <iframe
                    title={selectedDocument.title}
                    src={`${assetBaseUrl}${selectedDocument.url}`}
                    className="h-[480px] w-full rounded-md border border-gray-200"
                  />
                </CardBody>
              </Card>

              <Card>
                <CardHeader>
                  <h2 className="text-lg font-medium text-gray-900">E-signature</h2>
                </CardHeader>
                <CardBody className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Signature image</label>
                    <input className="mt-1 block w-full text-sm" type="file" onChange={(e) => setSignatureFile(e.target.files?.[0] || null)} />
                  </div>
                  <Button leftIcon={<FileSignature size={18} />} fullWidth onClick={handleSignatureUpload}>
                    Sign Document
                  </Button>
                  {selectedDocument.signatureImageUrl && (
                    <div>
                      <p className="mb-2 text-sm text-gray-600">Stored signature</p>
                      <img
                        src={`${assetBaseUrl}${selectedDocument.signatureImageUrl}`}
                        alt="Stored signature"
                        className="max-h-40 rounded-md border border-gray-200"
                      />
                    </div>
                  )}
                </CardBody>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
