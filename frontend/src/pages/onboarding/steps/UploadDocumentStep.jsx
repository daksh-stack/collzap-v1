import { useState } from 'react';
import toast from 'react-hot-toast';
import { FileUp } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Input from '../../../../components/ui/Input';
import { useModerationStore } from '../../../../store/useModerationStore';

export default function UploadDocumentStep() {
  const [documentType, setDocumentType] = useState('FEE_SLIP');
  const [documentUrl, setDocumentUrl] = useState('');
  
  const { uploadDocument, loading } = useModerationStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!documentUrl) {
      toast.error('Please provide a document URL');
      return;
    }

    try {
      await uploadDocument(documentType, documentUrl);
      toast.success('Document submitted successfully');
      // Onboarding state will be automatically refetched and step will advance
    } catch (error) {
      toast.error(error.message || 'Failed to submit document');
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 mb-4">
          <FileUp className="h-6 w-6 text-brand-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Verify your student status</h2>
        <p className="mt-2 text-sm text-gray-500">
          Upload your fee slip or student ID card for verification. 
          Verification usually takes 24-48 hours.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Document Type</label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setDocumentType('FEE_SLIP')}
              className={`flex items-center justify-center px-4 py-3 border rounded-md text-sm font-medium ${
                documentType === 'FEE_SLIP'
                  ? 'border-brand-500 ring-2 ring-brand-500 bg-brand-50 text-brand-700'
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Fee Slip
            </button>
            <button
              type="button"
              onClick={() => setDocumentType('ID_CARD')}
              className={`flex items-center justify-center px-4 py-3 border rounded-md text-sm font-medium ${
                documentType === 'ID_CARD'
                  ? 'border-brand-500 ring-2 ring-brand-500 bg-brand-50 text-brand-700'
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              ID Card
            </button>
          </div>
        </div>

        <Input
          label="Document URL"
          placeholder="https://example.com/my-id.jpg"
          value={documentUrl}
          onChange={(e) => setDocumentUrl(e.target.value)}
          disabled={loading}
          type="url"
        />

        <Button type="submit" className="w-full" loading={loading}>
          Submit for Review
        </Button>
      </form>
    </div>
  );
}
