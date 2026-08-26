import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import Button from '../components/ui/Button';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="mx-auto w-24 h-24 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center mb-6 shadow-sm border-4 border-white">
          <Search className="w-10 h-10" />
        </div>
        <h1 className="text-9xl font-extrabold text-gray-200 tracking-widest">404</h1>
        <div className="bg-white px-4 py-8 shadow-sm sm:rounded-lg sm:px-10 border border-gray-200 -mt-16 relative z-10 mx-4 sm:mx-0">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h2>
          <p className="text-gray-500 mb-8">
            Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.
          </p>
          <Button onClick={() => navigate('/')} className="w-full">
            Go back home
          </Button>
        </div>
      </div>
    </div>
  );
}
