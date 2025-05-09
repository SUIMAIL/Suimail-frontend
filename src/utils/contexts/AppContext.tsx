import React, { createContext, useState, ReactNode, useEffect } from 'react';
// import App from './../../App';

export interface AppContextProps {
  activeNavItem: string;
  setActiveNavItem: React.Dispatch<React.SetStateAction<string>>;
  walletAddress: string;
  setWalletAddress: React.Dispatch<React.SetStateAction<string>>;
  connectionState: string;
  setConnectionState: React.Dispatch<React.SetStateAction<string>>;
  token: string;
  setToken: React.Dispatch<React.SetStateAction<string>>;
  // subname: string | null;                        // new: store user's suimail subname
  // setSubname: React.Dispatch<React.SetStateAction<string | null>>; // new setter for subname
  mailFee: number;
  setMailFee: React.Dispatch<React.SetStateAction<number>>;
  // from: string;
  // setFrom: React.Dispatch<React.SetStateAction<string>>;
  // to: string;
  // setTo: React.Dispatch<React.SetStateAction<string>>;
  // subject: string;
  // setSubject: React.Dispatch<React.SetStateAction<string>>;
  // date: string;
  // setDate: React.Dispatch<React.SetStateAction<string>>;
  // newbie: string;
  // setNewbie: React.Dispatch<React.SetStateAction<string>>;
  // decryptedMessage: string | undefined;
  // setDecryptedMessage: React.Dispatch<React.SetStateAction<string | undefined>>;
  // emailClick: boolean;
  // setEmailClick: React.Dispatch<React.SetStateAction<boolean>>;
}

export const AppContext = createContext<AppContextProps | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [activeNavItem, setActiveNavItem] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [connectionState, setConnectionState] = useState('');
  const [token, setToken] = useState('');
  // const [subname, setSubname] = useState<string | null>(null); // new state for subname
  const [mailFee, setMailFee] = useState(0); // default mail fee

  // useEffect(() => {
  //   const fetchSubname = async () => {
  //     try {
  //       const res = await fetch(`/https://suimail-backend.onrender.com/get-subname?wallet=${walletAddress}`);
  //       const data = await res.json();
  //       if (data.subname) {
  //         setSubname(data.subname);
  //       }
        
  //     } catch (error) {
  //       console.error("Failed to fetch subname:", error);
  //     }
  //   };

  //   if (walletAddress) {
  //     fetchSubname();
  //   }
  // }, [walletAddress]);

  return (
    <AppContext.Provider value={{
      activeNavItem,
      setActiveNavItem,
      walletAddress,
      setWalletAddress,
      connectionState,
      setConnectionState,
      token,
      setToken,
      // subname,            // new context value
      // setSubname,         // new context setter
      mailFee,
      setMailFee,
    }}>
      {children}
    </AppContext.Provider>
  );
};
