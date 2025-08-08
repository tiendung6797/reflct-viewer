import React, { useState, useEffect, useRef } from 'react';
import './DropDown.css';

const SceneDropdown = ({ scenes, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const toggleDropdown = () => setIsOpen((prev) => !prev);
  const handleSelect = (scene) => {
    setIsOpen(false);
    onSelect(scene);
  };

  useEffect(() => {
    console.log(isOpen);
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="reflct-dropdown-button-container" ref={dropdownRef}>
      <button className="reflct-dropdown-button" onClick={toggleDropdown}>
        Change scene
      </button>
      <ul className={`reflct-dropdown-list ${isOpen ? 'visible' : 'hidden'}`}>
        {scenes.map((scene) => (
          <li key={scene.id} onClick={() => handleSelect(scene)}>
            {scene.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SceneDropdown;
