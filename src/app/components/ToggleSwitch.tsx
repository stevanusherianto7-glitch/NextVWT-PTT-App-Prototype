import './ToggleSwitch.css';

interface ToggleSwitchProps {
  isOn: boolean;
  onToggle: () => void;
}

export function ToggleSwitch({ isOn, onToggle }: ToggleSwitchProps) {
  return (
    <div className="toggle-switch-container">
      <label className="toggle-switch">
        <input type="checkbox" className="toggle-switch-input" checked={isOn} onChange={onToggle} />
        <div className="toggle-indicator left"></div>
        <div className="toggle-indicator right"></div>
        <div className="toggle-button"></div>
      </label>
    </div>
  );
}
