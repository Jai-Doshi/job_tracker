import React, { useEffect } from 'react';
import './SplashScreen.css';

interface Props {
  onFinish: () => void;
}

const SplashScreen: React.FC<Props> = ({ onFinish }) => {
  useEffect(() => {
    // The splash exists for 2 seconds then tells App to unmount it
    const timer = setTimeout(() => {
      onFinish();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="splash-screen">
      <div className="splash-content pulse-animation">
        <img src="/favicon.png" alt="CareerArc Logo" className="splash-logo" />
        <h1 className="splash-title">CareerArc</h1>
        <p className="splash-subtitle">Elevating your career trajectory</p>
      </div>
    </div>
  );
};

export default SplashScreen;
