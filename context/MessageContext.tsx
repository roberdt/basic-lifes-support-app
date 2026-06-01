'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { AlertColor } from '@mui/material';

/**************************************************
 * MessageContextValue
 * Defines the shape of the message context value, which includes a 'message' string and a 'setMessage' function.
 * This interface ensures that any component consuming the MessageContext will have access to
 * these properties and methods with the correct types.
 **************************************************/
interface MessageContextValue {
  message: string;
  severity: AlertColor;
  setMessage: (msg: string, severity?: AlertColor) => void;
  clearMessage: () => void;
}

/**************************************************
 * MessageContext
 * Creates a React context for managing messages across the application.
 * The context is initialized with a default value of null, and it will be provided with a MessageContextValue
 * by the MessageProvider component. This context allows components to access and update the message state globally.
 **************************************************/
const MessageContext = createContext<MessageContextValue | null>(null);

/**************************************************
 * MessageProviderProps
 * Defines the props for the MessageProvider component, which includes a single property 'children' of type ReactNode.
 * This allows the MessageProvider to wrap around any child components that need access to the message context.
 **************************************************/
interface MessageProviderProps {
  children: ReactNode;
}

/**************************************************
 * MessageProvider()
 * Initializes the message context and manages the message state.
 * It uses the useState hook to create a 'message' state variable and a 'setMessage' function to update it.
 * Wraps its children with the MessageContext.Provider to make the message state and update function available throughout the component tree.
 **************************************************/
export function MessageProvider({ children }: MessageProviderProps) {
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState<AlertColor>('success');

  const handleSetMessage = (msg: string, nextSeverity: AlertColor = 'success') => {
    setMessage(msg);
    setSeverity(nextSeverity);
  };

  const clearMessage = () => {
    setMessage('');
    setSeverity('success');
  };

  return (
    <MessageContext.Provider value={{ message, severity, setMessage: handleSetMessage, clearMessage }}>
      {children}
    </MessageContext.Provider>
  );
}

/**************************************************
 * MessageContextValue()
 * Custom hook that provides access to the MessageContext value.
 * It uses the useContext hook to consume the MessageContext and returns its value.
 * If the context is not available (i.e., if the hook is used outside of a MessageProvider), it throws an error.
 * This ensures that components using this hook are properly wrapped with a MessageProvider.
 **************************************************/
export function useMessage(): MessageContextValue {
  const ctx = useContext(MessageContext);
  if (!ctx) throw new Error('useMessage must be used within a MessageProvider');
  return ctx;
}

export default MessageContext;

