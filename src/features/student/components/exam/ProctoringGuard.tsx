import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { logViolation } from '../../../../store/slices/studentAttemptSlice';

interface Props {
  isStrict: boolean;
  onSecurityBreach: () => void;
}

const ProctoringGuard: React.FC<Props> = ({ isStrict, onSecurityBreach }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        dispatch(logViolation('TAB_SWITCH_OR_MINIMIZE'));
        if (isStrict) {
          onSecurityBreach();
        }
      }
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleVisibilityChange);

    return () => {
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleVisibilityChange);
    };
  }, [dispatch, isStrict, onSecurityBreach]);

  return null; // Invisible component
};

export default ProctoringGuard;