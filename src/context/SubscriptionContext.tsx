import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import {
  FREE_ENTITLEMENT,
  type EntitlementState,
} from '../lib/subscription';

type SubscriptionContextValue = EntitlementState & {
  /** Demo-only: flip entitlement without store billing. */
  startPaidTrialStub: () => void;
  restoreFreeStub: () => void;
};

const SubscriptionContext = createContext<SubscriptionContextValue | undefined>(
  undefined
);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const [entitlement, setEntitlement] = useState<EntitlementState>(FREE_ENTITLEMENT);

  const startPaidTrialStub = useCallback(() => {
    setEntitlement({ isPaid: true, planLabel: 'Paid trial' });
  }, []);

  const restoreFreeStub = useCallback(() => {
    setEntitlement(FREE_ENTITLEMENT);
  }, []);

  const value = useMemo(
    () => ({
      ...entitlement,
      startPaidTrialStub,
      restoreFreeStub,
    }),
    [entitlement, startPaidTrialStub, restoreFreeStub]
  );

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) throw new Error('useSubscription must be used within SubscriptionProvider');
  return ctx;
}
