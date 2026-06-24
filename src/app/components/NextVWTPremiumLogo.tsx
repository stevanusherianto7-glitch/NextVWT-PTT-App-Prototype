import './NextVWTPremiumLogo.css';

import vintageMic from '../../assets/vintage_mic.png';

export function NextVWTPremiumLogo() {
  return (
    <div className="nextvwt-premium-logo">
      <span className="logo-word logo-next">NEXT</span>

      <span className="signal-logo" aria-hidden="true">
        <span className="signal-arc arc-1" />
        <span className="signal-arc arc-2" />
        <span className="signal-arc arc-3" />
        <img src={vintageMic} className="signal-dot mic-orb" alt="Mic" />
      </span>

      <span className="logo-word logo-vwt">VWT</span>
    </div>
  );
}
