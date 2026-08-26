import { Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { Check } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function OnboardingLayout() {
  const { nextStep } = useAuthStore((state) => state);

  const steps = [
    { id: 'OTP_VERIFICATION', name: 'Verify' },
    { id: 'PROFILE_SETUP', name: 'Profile' },
    { id: 'COLLEGE_SELECTION', name: 'College' },
    { id: 'COLLEGE_VERIFICATION', name: 'Document' },
    { id: 'INTEREST_SELECTION', name: 'Interests' },
    { id: 'SERIOUSNESS_TEST', name: 'Test' },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === nextStep);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pt-10 sm:px-6 lg:px-8">
      {/* Stepper */}
      <div className="sm:mx-auto sm:w-full sm:max-w-3xl px-4">
        <nav aria-label="Progress">
          <ol role="list" className="flex items-center">
            {steps.map((step, stepIdx) => {
              const status = 
                currentStepIndex === -1 ? 'complete' : // if READY, all complete
                stepIdx < currentStepIndex ? 'complete' :
                stepIdx === currentStepIndex ? 'current' : 'upcoming';

              return (
                <li key={step.name} className={cn(stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-20' : '', 'relative')}>
                  {status === 'complete' ? (
                    <>
                      <div className="absolute inset-0 flex items-center" aria-hidden="true">
                        <div className="h-0.5 w-full bg-brand-600" />
                      </div>
                      <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 hover:bg-brand-900">
                        <Check className="h-5 w-5 text-white" aria-hidden="true" />
                        <span className="sr-only">{step.name}</span>
                      </div>
                    </>
                  ) : status === 'current' ? (
                    <>
                      <div className="absolute inset-0 flex items-center" aria-hidden="true">
                        <div className="h-0.5 w-full bg-gray-200" />
                      </div>
                      <div
                        className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-brand-600 bg-white"
                        aria-current="step"
                      >
                        <span className="h-2.5 w-2.5 rounded-full bg-brand-600" aria-hidden="true" />
                        <span className="sr-only">{step.name}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="absolute inset-0 flex items-center" aria-hidden="true">
                        <div className="h-0.5 w-full bg-gray-200" />
                      </div>
                      <div className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-300 bg-white hover:border-gray-400">
                        <span className="h-2.5 w-2.5 rounded-full bg-transparent group-hover:bg-gray-300" aria-hidden="true" />
                        <span className="sr-only">{step.name}</span>
                      </div>
                    </>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-100">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
