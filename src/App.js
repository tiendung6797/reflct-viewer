import React, { useState, useEffect, useRef } from 'react';
import { Viewer } from '@reflct/react';
import './App.css';
import SceneDropdown from './DropDown.js';

function AccordionItem({ k, title, content, isOpen, onToggle }) {
  const panelRef = React.useRef(null);

  React.useEffect(() => {
    const el = panelRef.current;
    if (!el) return;

    // inline slideHeight
    const from = isOpen ? 0 : el.getBoundingClientRect().height || el.scrollHeight;
    const to   = isOpen ? el.scrollHeight : 0;

    el.style.height = from + 'px';
    el.offsetHeight;        // ép reflow (tránh eslint bằng 'void')
    el.style.height = to + 'px';
  }, [isOpen]);

  const contentId = `acc-${k}`;

  return (
    <div className={`accordion-item ${isOpen ? 'open' : ''}`}>
      <button
        className="accordion-title"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={contentId}
      >
        <span className="accordion-title-text">{title}</span>
        <span className={`acc-icon ${isOpen ? 'open' : ''}`} aria-hidden />
      </button>

      <div id={contentId} ref={panelRef} className="accordion-panel" role="region">
        <div className="accordion-inner">{content}</div>
      </div>
    </div>
  );
}


// Second solution
// If the content needs to load after opening
// function AccordionItem({ k, title, content, isOpen, onToggle }) {
//   const panelRef = React.useRef(null);
//   const animIdRef = React.useRef(0);

//   React.useEffect(() => {
//     const el = panelRef.current;
//     if (!el) return;

//     const id = ++animIdRef.current;

//     const onEnd = (e) => {
//       if (e.propertyName !== 'height' || id !== animIdRef.current) return;
//       el.removeEventListener('transitionend', onEnd);
//       // Không đặt height:auto để tránh vòng lặp/giật
//     };

//     el.removeEventListener('transitionend', onEnd);

//     if (isOpen) {
//       // OPEN: 0 -> scrollHeight
//       el.style.height = '0px';
//       // force reflow để transition ăn
//       // eslint-disable-next-line no-unused-expressions
//       el.offsetHeight;
//       el.style.height = el.scrollHeight + 'px';
//       el.addEventListener('transitionend', onEnd);
//     } else {
//       // CLOSE: current(px) -> 0
//       const from = el.getBoundingClientRect().height || el.scrollHeight;
//       el.style.height = from + 'px';
//       // force reflow
//       // eslint-disable-next-line no-unused-expressions
//       el.offsetHeight;
//       el.style.height = '0px';
//       el.addEventListener('transitionend', onEnd);
//     }

//     return () => el.removeEventListener('transitionend', onEnd);
//   }, [isOpen]);

//   const contentId = `acc-content-${k}`;

//   return (
//     <div className={`accordion-item ${isOpen ? 'open' : ''}`}>
//       <button
//         className="accordion-title"
//         onClick={onToggle}
//         aria-expanded={isOpen}
//         aria-controls={contentId}
//       >
//         <span className="accordion-title-text">{title}</span>
//         <span className={`acc-icon ${isOpen ? 'open' : ''}`} aria-hidden />
//       </button>

//       <div id={contentId} ref={panelRef} className="accordion-panel" role="region">
//         <div className="accordion-inner">{content}</div>
//       </div>
//     </div>
//   );
// }



function App() {
  const [linkedScenes, setLinkedScenes] = useState([]);
  const [currentView, setCurrentView] = useState(null);
  const [viewerApi, setViewerApi] = useState(null);

  // Customizing Viewer
  const [isChangeScene, setIsChangeScene] = useState(false);
  const [isShowInfo, setIsShowInfo] = useState(false);
  const handleClose = () => {
    setIsShowInfo(false);
  };
  const [viewerLoaded, setViewerLoaded] = useState(false);
  const [tooltipEligible, setTooltipEligible] = useState(true);
  const [showButtonTooltip, setShowButtonTooltip] = useState(false);
  const showTimeoutRef = useRef(null);

  const handleUserInteraction = () => {
    setTooltipEligible(false);
    if (showButtonTooltip) setShowButtonTooltip(false);
    if (showTimeoutRef.current) clearTimeout(showTimeoutRef.current);
  };

  useEffect(() => {
    if (viewerLoaded && tooltipEligible) {
      showTimeoutRef.current = setTimeout(() => {
        setShowButtonTooltip(true);
      }, 4000);
    }
    return () => {
      if (showTimeoutRef.current) clearTimeout(showTimeoutRef.current);
    };
  }, [viewerLoaded, tooltipEligible]);

  const loadSceneRef = useRef(null);
  useEffect(() => {
    if (!viewerApi && typeof loadSceneRef.current === 'function') {
      setViewerApi({ loadScene: loadSceneRef.current });
    }
  }, [viewerApi]);

  function SceneCustomComponents({
    currentView,
    currentViewGroup,
    global,
    index,
    automode,
    setAutomode,
    isLoading,
    loadProgress,
    nextView,
    prevView,
    summaryImage,
    linkedScenes,
    loadScene,
  }) {
    if (!loadSceneRef.current && loadScene) {
      loadSceneRef.current = loadScene;
    }

    const [forceStopLoading, setForceStopLoading] = useState(false);
    useEffect(() => {
      if (!isLoading) return;

      const timeout = setTimeout(() => {
        if (loadProgress === 0) {
          setForceStopLoading(true);
        }
      }, 8000);

      return () => clearTimeout(timeout);
    }, [loadProgress, isLoading]);

    return (
      <>
        {(isLoading && !forceStopLoading) && (
          <div className="loading-wrapper">
            <div className="progress-bar">
              <div
                className="progress-bar-fill"
                style={{ width: `${Math.floor((loadProgress || 0) * 100)}%` }}
              />
            </div>
          </div>
        )}

        {isChangeScene && (
          <div className="scene-dropdown-wrapper">
            <SceneDropdown scenes={global.linkedScenes} onSelect={(selectedScene) => {
                setIsShowInfo(true);
                setIsChangeScene(false);
                setTooltipEligible(true);
                loadScene(selectedScene.id);
            }} />
          </div>
        )}

        <div className="view-controls">
          <button onClick={() => {
            prevView();
            handleUserInteraction();
          }}>
            <span className="icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 18L8 12L14 6" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          </button>
          <button className="play" onClick={() => {
            setAutomode(!automode);
            handleUserInteraction();
          }}>
            <span className="icon">{
              automode ? 
                <svg width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 4.5H6V20.5H10V4.5Z" fill="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M18 4.5H14V20.5H18V4.5Z" fill="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              :
                <svg width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 3.5L20 12.5L6 21.5V3.5Z" fill="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              }
            </span>
          </button>
          <button onClick={() => {
            nextView();
            handleUserInteraction();
          }}>
            <span className="icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 18L16 12L10 6" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          </button>
          {showButtonTooltip && <span className="tooltip animated-tooltip">Explore this space</span>}
        </div>

        {isShowInfo && currentView.showTextDetails && !isLoading && (
          <div className="info-overlay">
            <h3>{currentView.title}</h3>
            <div
              className="info-description"
              dangerouslySetInnerHTML={{ __html: currentView?.description || '' }}
            />
            <div className="close-button-wrapper">
              <button className="close-btn" onClick={handleClose}>Close</button>
            </div>
          </div>
        )}
      </>
    );
  }

  const renderViewer = () => (
    <Viewer
      // id="64547f12-fe83-4193-9d3d-887d9f93d719"
      // id="429d7524-5dc6-4d33-bfe9-a3b41fb9393d"
      id="9c5b5cdb-6b75-48cc-8465-fbd332ca47f7 x"

      apikey="7hUc41PtzUPkDuCzJmm3md"
      isPreview={false}
      sceneRevealMode="gradual"
      sharedMemoryForWorkers={false}
      hitPoint={(state) => (
        <button onClick={state.select} className="unstyled-button">
          <div className="marker">
            <div className="dot" />
          </div>
        </button>
      )}
      onLoadComplete={(viewGroups, global, camera) => {
        if (global.linkedScenes.length > 0) {
          setIsChangeScene(true);
          setLinkedScenes(global.linkedScenes);
        }
        setViewerLoaded(true);
        setIsShowInfo(true);
        setCurrentView(viewGroups?.[0]?.views?.[0]);
      }}
      onStateChangeStart={(targetView, targetViewGroup, global, camera) => {
        setIsShowInfo(true);
        setCurrentView(targetView);
      }}
    >
      {(sceneData) => <SceneCustomComponents {...sceneData} />}
    </Viewer>
  );

  // Infor panel
  const [quantity, setQuantity] = useState(1);

  const handleQtyChange = (delta) => {
    setQuantity((prev) => Math.max(1, prev + delta));
  };
  const [openSection, setOpenSection] = useState(null);
  
  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  const sections = [
    { key: 'description', title: 'DESCRIPTION', content: 'This is the description.' },
    { key: 'measurements', title: 'MEASUREMENTS', content: 'Measurements content here.' },
    { key: 'process', title: 'PROCESS', content: 'The photography process is extremely simple...The photography process is extremely simple...The photography process is extremely simple...The photography process is extremely simple...The photography process is extremely simple...The photography process is extremely simple...The photography process is extremely simple...The photography process is extremely simple...' },
    { key: 'otherInfo', title: 'OTHER INFO', content: 'Other information here.' },
  ];

  return (
    <div className="app-container">
      <div className="viewer-wrapper">
        {renderViewer()}
      </div>

      {/* Infor panel */}
      <div className="info-panel">
        <div className="header">
          <h4 className="brand">Nood</h4>
          <h1 className="title">Karla Sideboard</h1>
          <p className="sku">SKU: 99999</p>
        </div>

        <div class="price-container">
          <div class="price">$2,999</div>
          <div class="delivery">+ Delivery</div>
          <div class="tooltip-container">
            <span class="tooltip-icon">ⓘ</span>
            <div class="tooltip-text">Delivery charges may vary depending on location.</div>
          </div>
        </div>

        <div className="order-section">
          {/* <div className="quantity-selector">
            <button onClick={() => handleQtyChange(-1)}>-</button>
            <span>{quantity}</span>
            <button onClick={() => handleQtyChange(1)}>+</button>
          </div>
          <button className="order-button">Order</button> */}
          <button
            className='btn-primary'
            onClick={() => {}}
          >
            <span>Add to wishlist</span>
          </button>
          <button
            className='btn-secondary'
            onClick={() => {}}
          >
            <span>View product details</span>
          </button>
        </div>

        <div className="accordion">
          {sections.map(({ key, title, content }) => (
            <AccordionItem
              key={key}
              k={key}
              title={title}
              content={content}
              isOpen={openSection === key}
              onToggle={() => toggleSection(key)}
            />
          ))}
        </div>

        {/* <div className="accordion">
          {sections.map(({ key, title, content }) => (
            <div key={key} className="accordion-item">
              <button
                className="accordion-title"
                onClick={() => toggleSection(key)}
              >
                {title}
                <span className={`acc-icon ${openSection === key ? 'open' : ''}`} />
              </button>
              <div className={`accordion-panel ${openSection === key ? 'open' : ''}`}>
                <div className="accordion-content">{content}</div>
              </div>
            </div>
          ))}
        </div> */}



      </div>
    </div>
  );
}

export default App;